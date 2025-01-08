import { Router } from "express";
import { register, login,showAllUsers } from "../controllers/authController";  // นำเข้าฟังก์ชัน register และ login
const router = Router();

// เส้นทางสำหรับการลงทะเบียนและล็อกอิน
router.get('/users', showAllUsers);

// เส้นทางสำหรับการลงทะเบียน
router.post('/register', register);

// เส้นทางสำหรับการล็อกอิน
router.post('/login', login);

export default router;
