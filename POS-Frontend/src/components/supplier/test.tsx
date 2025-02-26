import React, { useState } from "react";
import { addSupplier } from "../../api/utils/supplierApi.ts"; // นำเข้าฟังก์ชันจาก service
interface Supplier {
    id?: number;
    name: string;
    phone: string;
    email: string;
    address: string;
    country: string;
    state?: string;
    district?: string;
    subdistrict?: string;
    postalCode?: string;
}

interface SupplierFormProps {
    supplier: Supplier | null;
    onClose: () => void;
    onSave: () => void;
}

const SupplierForm: React.FC<SupplierFormProps> = ({ supplier, onClose, onSave }) => {
    const [formData, setFormData] = useState<Supplier>({
        name: supplier?.name || "",
        phone: supplier?.phone || "",
        email: supplier?.email || "",
        address: supplier?.address || "",
        country: supplier?.country || "",
        state: supplier?.state || "",
        district: supplier?.district || "",
        subdistrict: supplier?.subdistrict || "",
        postalCode: supplier?.postalCode || "",
    });

    const [countries, setCountries] = useState<string[]>([]);
    const [states, setStates] = useState<any[]>([]);
    const [districts, setDistricts] = useState<any[]>([]);
    const [subdistricts, setSubdistricts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    
    const [companyName, setCompanyName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [address, setAddress] = useState("");
    const [country, setCountry] = useState("");
    const [stateOrProvince, setStateOrProvince] = useState("");
    const [district, setDistrict] = useState("");
    const [subDistrict, setSubDistrict] = useState("");
    const [postalCode, setPostalCode] = useState("");
    const [email, setEmail] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

     const handleSubmit = async (e: React.FormEvent) => {
         e.preventDefault();
         setLoading(true);
         setMessage("");
 
         try {
             const token = localStorage.getItem("token");
             if (!token) {
                 setMessage("❌ No token found");
                 return;
             }
 
             await addSupplier(formData, token);
             setMessage("✅ เพิ่มซัพพลายเออร์สำเร็จ!");
 
             // รีเซ็ตฟอร์ม
             setFormData({
                 name: "",
                 phone: "",
                 email: "",
                 address: "",
                 country: "",
                 state: "",
                 district: "",
                 subdistrict: "",
                 postalCode: "",
             });
 
             // ปิด Modal และอัปเดตข้อมูล
             setTimeout(() => {
                 onSave();
                 onClose();
             }, 1000);
         } catch (error) {
             setMessage("❌ เกิดข้อผิดพลาดในการเพิ่มซัพพลายเออร์");
             console.error(error);
         } finally {
             setLoading(false);
         }
     };

    return (
        <div>
            <h1>Add Supplier</h1>
            {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
            {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Company Name"
                    required
                />
                <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Phone Number"
                    required
                />
                <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Address"
                    required
                />
                <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Country"
                    required
                />
                <input
                    type="text"
                    value={stateOrProvince}
                    onChange={(e) => setStateOrProvince(e.target.value)}
                    placeholder="State/Province"
                    required
                />
                <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="District"
                    required
                />
                <input
                    type="text"
                    value={subDistrict}
                    onChange={(e) => setSubDistrict(e.target.value)}
                    placeholder="Sub-District"
                    required
                />
                <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="Postal Code"
                    required
                />
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                />
                <button type="submit">Add Supplier</button>
            </form>
        </div>
    );
};

export default SupplierForm;
