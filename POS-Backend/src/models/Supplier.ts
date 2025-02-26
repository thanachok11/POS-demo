import mongoose, { Schema, Document } from "mongoose";

interface ISupplier extends Document {
    userId: mongoose.Types.ObjectId; // อ้างอิงไปยัง User
    companyName: string;
    phoneNumber: string;
    address: string;
    country: string;
    stateOrProvince: string;
    district: string;
    subDistrict: string;
    postalCode: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
}

const SupplierSchema = new Schema<ISupplier>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // เพิ่ม userId ที่อ้างอิงกับ User
        companyName: { type: String, required: true }, // ชื่อบริษัท
        phoneNumber: { type: String, required: true }, // เบอร์โทรศัพท์
        address: { type: String, required: true }, // ที่อยู่
        country: { type: String, required: true }, // ประเทศ
        stateOrProvince: { type: String, required: true }, // จังหวัด/รัฐ
        district: { type: String, required: true }, // อำเภอ/เขต
        subDistrict: { type: String, required: true }, // ตำบล/แขวง
        postalCode: { type: String, required: true }, // รหัสไปรษณีย์
        email: { type: String, required: true, unique: true }, // อีเมล
    },
    { timestamps: true }
);
const Supplier = mongoose.model<ISupplier>("Supplier", SupplierSchema);
export default Supplier;