import express from "express";
import { getSuppliers, addSuppliers } from "../controllers/supplierController";
const router = express.Router();
router.get('/', getSuppliers);
router.post('/add-suppliers', addSuppliers)

export default router;