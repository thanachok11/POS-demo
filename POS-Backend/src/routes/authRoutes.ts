import { Router } from "express";
import { register, login } from "../controllers/authController";
import users from "../models/User";
const router = Router();

// เส้นทางสำหรับการลงทะเบียนและล็อกอิน
router.get("/", async (req, res) => {
    const user = await users.find(); // ดึงข้อมูลทั้งหมดจาก MongoDB
    res.json(user); // ส่งข้อมูลที่ได้กลับไปในรูปแบบ JSON
  });

export default router;
