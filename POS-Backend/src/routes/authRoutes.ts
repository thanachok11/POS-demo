import { Router } from "express";
import { register, login, showAllUsers } from "../controllers/authController";
import { verifyGoogleTokenMiddleware } from "../controllers/google";

const router = Router();

// แสดงผู้ใช้ทั้งหมด
router.get("/users", showAllUsers);

// ใช้ verifyGoogleTokenMiddleware ในเส้นทางนี้
router.post("/google/callback", verifyGoogleTokenMiddleware);

// เส้นทางสำหรับการลงทะเบียน
router.post("/register", register);

// เส้นทางสำหรับการล็อกอิน
router.post("/login", login);

export default router;
