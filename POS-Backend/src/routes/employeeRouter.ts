import express from 'express';
import { registerEmployee, getEmployeesByManager } from '../controllers/employeeController';
import { loginEmployee } from "../controllers/authController";

const router = express.Router();

// Route สำหรับการสมัครพนักงาน (เฉพาะผู้จัดการหรือแอดมิน)
router.post('/register', registerEmployee);
router.post("/login",loginEmployee);
router.get('/', getEmployeesByManager);

export default router;
