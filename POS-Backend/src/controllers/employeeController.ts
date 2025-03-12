import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Employee from '../models/Employee';
import User from '../models/User';

const verifyToken = (token: string) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET as string);
    } catch (error) {
        throw new Error('Invalid token');
    }
};
// ฟังก์ชันสำหรับเพิ่มพนักงาน (เฉพาะผู้ที่มีสิทธิ์ เช่น ผู้จัดการ หรือแอดมิน)
export const registerEmployee = async (req: Request, res: Response): Promise<void> => {
    // ดึง token จาก headers (Authorization header)
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        res.status(401).json({ success: false, message: 'No token provided' });
        return;
    }

    try {
        // ตรวจสอบ token และดึง userId
        const decoded = verifyToken(token);

        // ตรวจสอบว่า decoded เป็น object และมี property userId หรือไม่
        if (typeof decoded !== 'string' && 'userId' in decoded) {
            const user = await User.findById(decoded.userId);
            if (!user) {
                res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
                return;
            }

            // ตรวจสอบว่า user มี role เป็น admin หรือ manager
            if (user.role !== 'admin' && user.role !== 'manager') {
                res.status(403).json({ success: false, message: 'Forbidden: Only admin or manager can register employees' });
                return;
            }

            // ดึงข้อมูลพนักงานจาก request body
            const { email,name,phoneNumber, password, username, firstName, lastName,  position } = req.body;

            // ตรวจสอบว่าพนักงานมีอยู่แล้วหรือไม่
            const existingEmployee = await Employee.findOne({ $or: [{ email }, { username }] });
            if (existingEmployee) {
                res.status(400).json({ success: false, message: 'Email or username already in use' });
                return;
            }

            // แฮชรหัสผ่าน
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // สร้างพนักงานใหม่
            const newEmployee = new Employee({
                email,
                name,
                phoneNumber,
                password: hashedPassword,
                username,
                firstName,
                lastName,
                position,
                managerId: decoded.userId, // ระบุว่าใครเป็นผู้เพิ่มพนักงานนี้ (Manager)
                role: 'employee', // role เริ่มต้นเป็น employee
                status: 'active', // พนักงานเริ่มต้นเป็น active
                profile_img: 'https://res.cloudinary.com/dboau6axv/image/upload/v1735641179/qa9dfyxn8spwm0nwtako.jpg', // ภาพโปรไฟล์เริ่มต้น
            });

            // บันทึกข้อมูลลงฐานข้อมูล
            await newEmployee.save();

            res.status(201).json({ success: true, message: 'Employee registered successfully', data: newEmployee });
        } else {
            res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to register employee', error });
    }
};

// ฟังก์ชันสำหรับดึงข้อมูลพนักงานที่ผู้จัดการหรือแอดมินดูได้
export const getEmployeesByManager = async (req: Request, res: Response): Promise<void> => {
  try {
    // ดึง token จาก request headers
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      res.status(401).json({ message: "Unauthorized: No token provided" });
      return;
    }

    // ตรวจสอบและถอดรหัส token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string; role: string };

    // ตรวจสอบว่าเป็น role admin หรือ manager
    if (!decoded || (decoded.role !== "admin" && decoded.role !== "manager")) {
      res.status(403).json({ message: "Forbidden: Only managers and admin can view employees" });
      return;
    }

    // ดึงพนักงานทั้งหมดที่อยู่ภายใต้ managerId ของผู้จัดการที่เข้าสู่ระบบ
    const employees = await Employee.find({ managerId: decoded.userId }).select("-password");

    res.status(200).json({ employees });
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve employees", error });
  }
};
