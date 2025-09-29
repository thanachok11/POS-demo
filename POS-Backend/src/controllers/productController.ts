import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Product from '../models/Product';
import User from '../models/User';
import Employee from '../models/Employee';
import Category from '../models/Category';

// -------------------------
// 🔑 Helper Functions
// -------------------------
const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET as string);
  } catch {
    throw new Error('Invalid token');
  }
};

const getDecodedUserId = (req: Request): string | null => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return null;

  const decoded = verifyToken(token);
  if (typeof decoded !== 'string' && 'userId' in decoded) {
    return decoded.userId;
  }
  return null;
};

const getOwnerId = async (userId: string): Promise<string> => {
  let user = await User.findById(userId) || await Employee.findById(userId);
  if (!user) throw new Error('User not found');

  if (user.role === 'admin' || user.role === 'manager') return user._id.toString();
  if (user.role === 'employee') {
    if (!user.adminId) throw new Error('Employee does not have an admin assigned');
    return user.adminId.toString();
  }
  throw new Error('Invalid user role');
};

// -------------------------
// 📦 Product Controllers
// -------------------------
export const getProductByBarcode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const product = await Product.findOne({ barcode: req.params.barcode });
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    res.status(200).json(product);
    return;
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
    return;
  }
};

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getDecodedUserId(req);
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const ownerId = await getOwnerId(userId);
    const products = await Product.find({ userId: ownerId });

    res.status(200).json({ success: true, data: products });
    return;
  } catch (error: any) {
    res.status(403).json({ success: false, message: error.message });
    return;
  }
};

export const getAllProducts = async (_: Request, res: Response): Promise<void> => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
    return;
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
    return;
  }
};

export const getProductsByCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getDecodedUserId(req);
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const ownerId = await getOwnerId(userId);
    const products = await Product.find({ userId: ownerId, category: req.params.category });

    if (!products.length) {
      res.status(404).json({ success: false, message: 'No products found for this category' });
      return;
    }
    res.status(200).json({ success: true, data: products });
    return;
  } catch (error: any) {
    res.status(403).json({ success: false, message: error.message });
    return;
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedProduct) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Product updated successfully', data: updatedProduct });
    return;
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
    return;
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Product deleted successfully' });
    return;
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
    return;
  }
};

// -------------------------
// 🏷️ Category Controllers
// -------------------------
export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getDecodedUserId(req);
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const ownerId = await getOwnerId(userId);
    const categories = await Product.distinct('category', { userId: ownerId });

    res.status(200).json({ success: true, data: categories });
    return;
  } catch (error: any) {
    res.status(403).json({ success: false, message: error.message });
    return;
  }
};

export const fetchCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getDecodedUserId(req);
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    let user = await User.findById(userId) || await Employee.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const ownerId = user.role === 'employee' ? user.adminId : user._id;
    const categories = await Category.find({ adminId: ownerId });

    res.status(200).json({ success: true, data: categories });
    return;
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
    return;
  }
};

export const addCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getDecodedUserId(req);
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    let user = await User.findById(userId) || await Employee.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const { name, description } = req.body;
    if (!name?.trim()) {
      res.status(400).json({ success: false, message: 'Category name is required' });
      return;
    }

    const existing = await Category.findOne({ name });
    if (existing) {
      res.status(400).json({ success: false, message: 'Category already exists' });
      return;
    }

    const newCategory = new Category({ name, description, adminId: userId });
    await newCategory.save();

    res.status(201).json({ success: true, message: 'Category added successfully', data: newCategory });
    return;
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error while adding category' });
    return;
  }
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const updatedCategory = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedCategory) {
      res.status(404).json({ success: false, message: 'Category not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Category updated successfully', data: updatedCategory });
    return;
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
    return;
  }
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const deletedCategory = await Category.findByIdAndDelete(req.params.id);
    if (!deletedCategory) {
      res.status(404).json({ success: false, message: 'Category not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Category deleted successfully' });
    return;
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
    return;
  }
};
