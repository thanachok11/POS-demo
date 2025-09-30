import express from 'express';
import { registerEmployee, getEmployeesByManager ,updateEmployee,deleteEmployee} from '../controllers/employeeController';
// import { loginEmployee } from "../controllers/authController";

const router = express.Router();

// Route สำหรับการสมัครพนักงาน (เฉพาะผู้จัดการหรือแอดมิน)
router.post('/register', registerEmployee);
// router.post("/login",loginEmployee);
router.get('/', getEmployeesByManager);
router.put('/:id', updateEmployee);
router.patch('/:id', updateEmployee);
router.delete('/:id', deleteEmployee);

export default router;
