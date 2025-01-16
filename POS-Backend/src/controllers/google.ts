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
  }
};
