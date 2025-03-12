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
        userId: user._id,           // user id
        email: user.email,       // user email
        username: user.username, // username ของผู้ใช้
        role: user.role,
        nameStore: user.nameStore, // เพิ่ม nameStore ของผู้ใช้
        profile_img: user.profile_img,       // role ของผู้ใช้
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '3h' }
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
    if (!payload) {
      res.status(400).json({ message: 'ไม่สามารถตรวจสอบข้อมูลจาก Google ได้' });
      return;
    }

    const { email: googleEmail, sub: googleId, given_name: firstName = 'Guest', family_name: lastName = 'User', picture = '' } = payload;

    if (!googleEmail || !googleId) {
      res.status(400).json({ message: 'ไม่สามารถรับข้อมูลจาก Google' });
      return;
    }

    // ตรวจสอบว่ามีบัญชีอยู่แล้วหรือไม่
    let user = await User.findOne({ googleId });

    if (user) {
      res.status(400).json({ message: 'มีบัญชีผู้ใช้อยู่แล้ว' });
      return;
    }

    // สร้าง username ไม่ให้ซ้ำกัน
    const username = `${firstName}${Math.floor(Math.random() * 1000)}`;

    // สร้างบัญชีใหม่
    user = new User({
      email: googleEmail,
      googleId,
      firstName,
      lastName,
      profile_img: picture,
      role: 'admin',
      username,
      nameStore: 'My Store',
    });

    await user.save();

    // สร้าง JWT Token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || 'yourSecretKey',
      { expiresIn: '3h' }
    );

    res.json({ token, user });

  } catch (error) {
    console.error('Error in Google Register:', error);

    // ตรวจสอบว่า error เป็น instanceof Error หรือไม่
    const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการสมัครสมาชิกด้วย Google';

    res.status(500).json({ message: errorMessage });
  }
};