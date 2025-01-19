<<<<<<< HEAD
import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User';  // สมมติว่าใช้ Mongoose หรือ ORM อื่นๆ
import jwt from 'jsonwebtoken';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
export const googleLogin = async (req: Request, res: Response): Promise<void> => {
  const { googleToken } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: googleToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const googleEmail = payload?.email;
    const googleId = payload?.sub;

    if (!googleEmail || !googleId) {
      res.status(400).json({ message: 'ไม่สามารถตรวจสอบข้อมูลจาก Google ได้' });
      return;
    }

    // 🔎 ค้นหาผู้ใช้จากฐานข้อมูลโดยใช้ email
    let user = await User.findOne({ email: googleEmail });

    if (!user) {
      res.status(400).json({ message: 'ไม่มีบัญชีผู้ใช้ที่เชื่อมโยงกับ Google นี้' });
      return;
    }

    // 📌 ถ้าผู้ใช้มีอยู่ แต่ยังไม่มี googleId → อัปเดต googleId และ googleToken
    if (!user.googleId) {
      user.googleId = googleId;
      user.googleToken = googleToken;
      await user.save();
    } else if (user.googleId !== googleId) {
      // ถ้า googleId ไม่ตรงกัน → อาจเป็นบัญชีคนละตัว
      res.status(401).json({ message: 'บัญชี Google ID ไม่ตรงกัน' });
      return;
    }

    // 🔄 อัปเดต googleToken ทุกครั้งที่ล็อกอิน
    user.googleToken = googleToken;
    await user.save();

    // สร้าง JWT Token ใหม่
    const token = jwt.sign(
          {
            id: user._id,           // user id
            email: user.email,       // user email
            username: user.username, // username ของผู้ใช้
            role: user.role,  
            profile_img:user.profile_img,       // role ของผู้ใช้
          },
          process.env.JWT_SECRET as string,
          { expiresIn: '1h' }
        );

    res.json({ token, user });

  } catch (error) {
    console.error('❌ Error in Google Login:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย Google' });
  }
};



export const googleRegister = async (req: Request, res: Response): Promise<void> => {
  const { googleToken } = req.body;

  try {
    // ตรวจสอบ Google Token
    const ticket = await client.verifyIdToken({
      idToken: googleToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const googleEmail = payload?.email;
    const googleId = payload?.sub;
    const firstName = payload?.given_name ?? 'Guest';
    const lastName = payload?.family_name ?? 'User';
    const picture = payload?.picture ?? '';

    if (!googleEmail || !googleId) {
      res.status(400).json({ message: 'ไม่สามารถตรวจสอบข้อมูลจาก Google ได้' });
      return;
    }

    // เช็คว่าผู้ใช้มีบัญชีในระบบหรือยัง
    let user = await User.findOne({ googleId });

    if (user) {
      res.status(400).json({ message: 'มีบัญชีผู้ใช้อยู่แล้ว' });
      return;
    }

    // บันทึก googleToken ด้วย
    user = new User({
      email: googleEmail,
      googleId,
      firstName,
      lastName,
      profile_img: picture,
      role: 'user',
      username: firstName,
      googleToken, // 👉 บันทึก Google Token ลง DB
    });

    await user.save();

    // สร้าง Token สำหรับผู้ใช้
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || 'yourSecretKey',
      { expiresIn: '1h' }
    );

    res.json({ token, user });

  } catch (error) {
    console.error('Error in Google Register:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการสมัครสมาชิกด้วย Google' });
=======
import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client("429542474271-omg13rrfbv9aidi9p7c788gsfe8akfsd.apps.googleusercontent.com");

export const verifyGoogleTokenMiddleware = async (req: Request, res: Response): Promise<void> => {
  const { token } = req.body;

  if (!token) {
     res.status(400).json({ error: "Token is required" });
     return;
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: "429542474271-omg13rrfbv9aidi9p7c788gsfe8akfsd.apps.googleusercontent.com",
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error("Invalid token payload");
    }

    // เพิ่มข้อมูลผู้ใช้ใน `req.user` เพื่อใช้ในฟังก์ชันถัดไป
    req.body = payload;
  } catch (error) {
    res.status(401).json({ error: "Invalid Google Token" });
>>>>>>> 53da7cf0ae02369164b1eb52be70513e8700ef81
  }
};
