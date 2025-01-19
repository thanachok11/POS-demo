import { Router } from "express";
import { register, login, showAllUsers } from "../controllers/authController";
<<<<<<< HEAD
import  {googleLogin,googleRegister}  from "../controllers/google";  // นำเข้าฟังก์ชันที่สร้างใน controller/google.ts
=======
import { verifyGoogleTokenMiddleware } from "../controllers/google";
>>>>>>> 53da7cf0ae02369164b1eb52be70513e8700ef81

const router = Router();

// แสดงผู้ใช้ทั้งหมด
router.get("/users", showAllUsers);

// ใช้ verifyGoogleTokenMiddleware ในเส้นทางนี้
<<<<<<< HEAD
router.post("/google-login", googleLogin);
router.post("/google-register", googleRegister);
=======
router.post("/google/callback", verifyGoogleTokenMiddleware);
>>>>>>> 53da7cf0ae02369164b1eb52be70513e8700ef81

// เส้นทางสำหรับการลงทะเบียน
router.post("/register", register);

// เส้นทางสำหรับการล็อกอิน
router.post("/login", login);

export default router;
