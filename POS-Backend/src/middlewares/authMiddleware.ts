// middlewares/authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/auth";

// ✅ สร้าง interface ใหม่ สำหรับ Request ที่มี userId, role
export interface AuthRequest extends Request {
    userId?: string;
    role?: string;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ success: false, message: "Unauthorized, no token provided" });
    }

    try {
        const decoded = verifyToken(token);
        if (typeof decoded === "string" || !("userId" in decoded)) {
            return res.status(401).json({ success: false, message: "Invalid token" });
        }

        req.userId = decoded.userId;
        req.role = decoded.role;

        next();
    } catch {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }
};
