import { Router } from "express";
import { register, login, showAllUsers } from "../controllers/authController";
import  {googleLogin,googleRegister}  from "../controllers/google";  // นำเข้าฟังก์ชันที่สร้างใน controller/google.ts

const router = Router();
// แสดงผู้ใช้ทั้งหมด
router.get("/users", showAllUsers);
// ใช้ verifyGoogleTokenMiddleware ในเส้นทางนี้
router.post("/google-login", googleLogin);
router.post("/google-register", googleRegister);
// เส้นทางสำหรับการลงทะเบียน
router.post("/register", register);

// เส้นทางสำหรับการล็อกอิน
router.post("/login", login);

export default router;