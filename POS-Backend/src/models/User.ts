import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  email: string;
  password: string;
  comparePassword: (password: string) => Promise<boolean>;
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// เข้ารหัสรหัสผ่านก่อนบันทึก
UserSchema.pre<IUser>("save", async function (next) {
    if (!this.isModified("password")) return next();
  
    const salt = await bcrypt.genSalt(10);
    
    // บังคับให้ TypeScript เข้าใจว่า this.password เป็น string
    this.password = await bcrypt.hash(this.password as string, salt);
    next();
  });

// ตรวจสอบรหัสผ่าน
UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model<IUser>("User", UserSchema);
