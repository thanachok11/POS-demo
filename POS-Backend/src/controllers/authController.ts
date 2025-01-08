import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User";
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
  const { email, password, username, firstName, lastName } = req.body;
  
  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });

    if (existingUser) {
      if (existingUser.email === email) {
         res.status(400).json({ message: 'Email already registered' });
         return;
      }
      if (existingUser.username === username) {
         res.status(400).json({ message: 'Username already taken' });
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
    });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error });
  }
};

// ฟังก์ชันสำหรับการล็อกอิน
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      res.status(400).json({ message: 'User not found' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {
      expiresIn: '1h',
    });

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error });
  }
};
