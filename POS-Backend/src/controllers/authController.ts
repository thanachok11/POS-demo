import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User";
import Employee from '../models/Employee';

// ฟังก์ชันสำหรับการดึงข้อมูลผู้ใช้ทั้งหมด
export const showAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    // ค้นหาผู้ใช้ทั้งหมดจากฐานข้อมูล
    const users = await User.find();

    // ส่งข้อมูลผู้ใช้ทั้งหมดกลับไปในรูปแบบ JSON
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve users', error });
  }
};


// ฟังก์ชันสำหรับการลงทะเบียน
export const register = async (req: Request, res: Response): Promise<void> => {
  const { email, password, username, firstName, lastName,nameStore } = req.body;

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });

    if (existingUser) {
      if (existingUser.email === email) {
        res.status(400).json({ message: 'อีเมลนี้ มีผู้ใช้อยู่ในระบบแล้ว' });
        return;
      }
      if (existingUser.username === username) {
        res.status(400).json({ message: 'ชื่อผู้ใช้นี้ได้มีอยู่ในระบบแล้ว' });
        return;
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      email,
      password: hashedPassword,
      username,
      firstName,
      lastName,
      nameStore,
      role: 'admin',
      profile_img: 'https://res.cloudinary.com/dboau6axv/image/upload/v1735641179/qa9dfyxn8spwm0nwtako.jpg', // กำหนด profile_img
    });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error });
  }
};


export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    // ค้นหาผู้ใช้ในฐานข้อมูลทั้งผู้ใช้และพนักงาน
    let user = await User.findOne({ email });
    let employee = await Employee.findOne({ email });

    // ตรวจสอบว่าเจอผู้ใช้หรือพนักงาน
    if (!user && !employee) {
      res.status(400).json({ message: 'ไม่พบผู้ใช้นี้ในระบบ' });
      return;
    }

    // ถ้าพบผู้ใช้ปกติ
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        res.status(400).json({ message: 'รหัสผ่านไม่ถูกต้อง' });
        return;
      }

      // สร้าง token สำหรับผู้ใช้ปกติ
      const token = jwt.sign(
        {
          userId: user._id,
          email: user.email,
          firstname: user.firstName,
          lastname: user.lastName,
          username: user.username,
          role: user.role,
          nameStore: user.nameStore,
          profile_img: user.profile_img,
        },
        process.env.JWT_SECRET as string,
        { expiresIn: '3h' }
      );

      // ถ้าเป็น admin ให้ส่ง response พร้อม token
      if (user.role === 'admin') {
        res.status(200).json({ message: 'Login successful as admin', token, role: 'admin' });
      } else {
        // ถ้าเป็น user ปกติ
        res.status(200).json({ message: 'Login successful', token, role: 'user' });
      }
      return;
    }

    // ถ้าพบพนักงาน
    if (employee) {
      const isMatch = await bcrypt.compare(password, employee.password);

      if (!isMatch) {
        res.status(400).json({ message: 'รหัสผ่านไม่ถูกต้อง' });
        return;
      }

      // สร้าง token สำหรับพนักงาน
      const token = jwt.sign(
        {
          userId: employee._id,
          email: employee.email,
          name: employee.name,
          position: employee.position,
          status: employee.status,
          profile_img: employee.profile_img,
        },
        process.env.JWT_SECRET as string,
        { expiresIn: '3h' }
      );

      // ส่ง response สำหรับพนักงาน
      res.status(200).json({ message: 'เข้าสู่ระบบสำเร็จ', token, role: 'employee' });
      return;
    }
  } catch (error) {
    res.status(500).json({ message: 'เข้าสู่ระบบไม่สำเร็จ', error });
  }
};

// ฟังก์ชันสำหรับการแก้ไข role ของผู้ใช้
export const updateUserRole = async (req: Request, res: Response): Promise<void> => {
  const { userId, newRole } = req.body;
  const { role } = req.body; // ค่าของ role จากข้อมูลผู้ใช้ที่เข้าสู่ระบบ

  try {
    // ตรวจสอบว่าเป็น admin หรือไม่
    if (role !== 'admin') {
       res.status(403).json({ message: 'Permission denied. Only admin can change roles.' });
        return;
    }

    // ค้นหาผู้ใช้ที่ต้องการเปลี่ยน role
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // อัปเดต role ของผู้ใช้
    user.role = newRole;
    await user.save();

    res.status(200).json({ message: 'User role updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user role', error });
  }
};
export const loginEmployee = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const employee = await Employee.findOne({ email });

    if (!employee) {
      res.status(400).json({ message: 'ไม่พบพนักงานนี้ในระบบ' });
      return;
    }

    const isMatch = await bcrypt.compare(password, employee.password);

    if (!isMatch) {
      res.status(400).json({ message: 'รหัสผ่านไม่ถูกต้อง' });
      return;
    }

    // สร้าง JWT Token พร้อมข้อมูลเพิ่มเติม
    const token = jwt.sign(
      {
        userId: employee._id,     // ไอดีของพนักงาน
        email: employee.email,    // อีเมลของพนักงาน
        name: employee.name, // ชื่อผู้ใช้
        position: employee.position,
        status: employee.status,      // บทบาทของพนักงาน
        profile_img: employee.profile_img, // รูปโปรไฟล์พนักงาน
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '3h' }
    );

    res.status(200).json({ message: 'เข้าสู่ระบบสำเร็จ', token });
  } catch (error) {
    res.status(500).json({ message: 'เข้าสู่ระบบล้มเหลว', error });
  }
};

