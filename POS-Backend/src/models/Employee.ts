import mongoose, { Document, Schema } from 'mongoose';

// กำหนด Interface สำหรับ Employee
export interface IEmployee extends Document {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  phoneNumber: string;
  position: string;
  adminId: mongoose.Schema.Types.ObjectId; // ✅ เปลี่ยนจาก managerId
  role: 'employee';
  status: 'active' | 'inactive';
  profile_img?: string;
}

// สร้าง Schema สำหรับพนักงาน
const employeeSchema = new Schema<IEmployee>(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: [6, 'Password must be at least 6 characters long'],
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    position: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['employee'],
      default: 'employee',
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // ✅ ชัดเจนว่าอ้างถึง admin
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    profile_img: {
      type: String,
      default:
        'https://res.cloudinary.com/dboau6axv/image/upload/v1735641179/qa9dfyxn8spwm0nwtako.jpg',
    },
  },
  {
    timestamps: true,
  }
);

// สร้าง Model
const Employee = mongoose.model<IEmployee>('Employee', employeeSchema);

export default Employee;
