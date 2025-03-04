import { useEffect, useState } from "react";
import { addSupplier } from "../../api/utils/supplierApi.ts";
import { updateSupplier } from "../../api/utils/supplierApi.ts"; // เพิ่ม import

import axios from "axios";
import "../../styles/supplier/SupplierForm.css";
import React from "react";

interface Supplier {
    id?: number;
    companyName: string;
    phoneNumber: string;
    email: string;
    address: string;
    country: string;
    stateOrProvince: string;
    district: string;
    subDistrict: string;
    postalCode: string;
}

interface SupplierFormProps {
    supplier: Supplier | null;
    onClose: () => void;
    onSave: () => void;
}

const SupplierForm: React.FC<SupplierFormProps> = ({ supplier, onClose, onSave }) => {
    const [formData, setFormData] = useState<Supplier>({
        companyName: supplier?.companyName || "",
        phoneNumber: supplier?.phoneNumber || "",
        email: supplier?.email || "",
        address: supplier?.address || "",
        country: supplier?.country || "",
        stateOrProvince: supplier?.stateOrProvince || "",
        district: supplier?.district || "",
        subDistrict: supplier?.subDistrict || "",
        postalCode: supplier?.postalCode || "",
    });

    const [countries, setCountries] = useState<string[]>([]);
    const [states, setStates] = useState<any[]>([]);
    const [districts, setDistricts] = useState<any[]>([]);
    const [subdistricts, setSubdistricts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const res = await axios.get("https://restcountries.com/v3.1/all");
                const countryList = res.data.map((c: any) => c.name.common).sort();
                setCountries(countryList);
            } catch (error) {
                console.error("Error fetching countries:", error);
            }
        };
        fetchCountries();
    }, []);

    useEffect(() => {
        if (formData.country === "Thailand") {
            const fetchStates = async () => {
                try {
                    const res = await axios.get("https://raw.githubusercontent.com/kongvut/thai-province-data/master/api_province.json");
                    setStates(res.data);
                } catch (error) {
                    console.error("Error fetching states:", error);
                }
            };
            fetchStates();
        }
    }, [formData.country]);

    useEffect(() => {
        if (formData.stateOrProvince) {
            const selectedState = states.find((s: any) => s.name_th === formData.stateOrProvince);
            if (!selectedState) return;

            const fetchDistricts = async () => {
                try {
                    const res = await axios.get("https://raw.githubusercontent.com/kongvut/thai-province-data/master/api_amphure.json");
                    setDistricts(res.data.filter((d: any) => d.province_id === selectedState.id));
                } catch (error) {
                    console.error("Error fetching districts:", error);
                }
            };
            fetchDistricts();
        }
    }, [formData.stateOrProvince, states]);

    useEffect(() => {
        if (formData.district) {
            const selectedDistrict = districts.find((d: any) => d.name_th === formData.district);
            if (!selectedDistrict) return;

            const fetchSubdistricts = async () => {
                try {
                    const res = await axios.get("https://raw.githubusercontent.com/kongvut/thai-province-data/master/api_tambon.json");
                    setSubdistricts(res.data.filter((s: any) => s.amphure_id === selectedDistrict.id));
                } catch (error) {
                    console.error("Error fetching subdistricts:", error);
                }
            };
            fetchSubdistricts();
        }
    }, [formData.district, districts]);

    useEffect(() => {
        if (formData.subDistrict) {
            const selectedSubdistrict = subdistricts.find((s: any) => s.name_th === formData.subDistrict);
            if (selectedSubdistrict) {
                setFormData((prevData) => ({
                    ...prevData,
                    postalCode: selectedSubdistrict.zip_code || "",
                }));
            }
        }
    }, [formData.subDistrict, subdistricts]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

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

            if (supplier?.id) {
                // ถ้าเป็นการแก้ไข
                await updateSupplier(supplier.id, formData, token);
                setMessage("✅ แก้ไขซัพพลายเออร์สำเร็จ!");
            } else {
                // ถ้าเป็นการเพิ่มใหม่
                await addSupplier(formData, token);
                setMessage("✅ เพิ่มซัพพลายเออร์สำเร็จ!");
            }

            setTimeout(() => {
                onSave();
                onClose();
            }, 1000);
        } catch (error) {
            setMessage("❌ เกิดข้อผิดพลาดในการบันทึกซัพพลายเออร์");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="supplier-form-container">
            <h2 className="supplier-form-title"> {supplier ? "แก้ไขซัพพลายเออร์" : "เพิ่มซัพพลายเออร์"}</h2>
            {message && <p className="supplier-form-message">{message}</p>}
            <form onSubmit={handleSubmit} className="supplier-form">
                <input
                    type="text"
                    name="companyName" // ต้องตรงกับ key ใน formData
                    placeholder="ชื่อบริษัท"
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                    className="supplier-input"
                />

                <input
                    type="text"
                    name="phoneNumber" // แก้ให้ตรงกับ formData
                    placeholder="เบอร์โทรศัพท์"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                    className="supplier-input"
                />

                <input
                    type="email"
                    name="email"
                    placeholder="อีเมล"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="supplier-input"
                />
                <input
                    type="text"
                    name="address"
                    placeholder="ที่อยู่"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className="supplier-input"
                />

                <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    required
                    className="supplier-select"
                >
                    <option value="">เลือกประเทศ</option>
                    {countries.map((country) => (
                        <option key={country} value={country}>{country}</option>
                    ))}
                </select>

                {formData.country === "Thailand" && (
                    <select
                        name="stateOrProvince"
                        value={formData.stateOrProvince}
                        onChange={handleChange}
                        required
                        className="supplier-select"
                    >
                        <option value="">เลือกจังหวัด</option>
                        {states.map((state) => (
                            <option key={state.id} value={state.name_th}>{state.name_th}</option>
                        ))}
                    </select>
                )}

                {formData.stateOrProvince && (
                    <select
                        name="district"
                        value={formData.district}
                        onChange={handleChange}
                        required
                        className="supplier-select"
                    >
                        <option value="">เลือกอำเภอ</option>
                        {districts.map((district) => (
                            <option key={district.id} value={district.name_th}>{district.name_th}</option>
                        ))}
                    </select>
                )}

                {formData.district && (
                    <select
                        name="subDistrict"
                        value={formData.subDistrict}
                        onChange={handleChange}
                        required
                        className="supplier-select"
                    >
                        <option value="">เลือกตำบล</option>
                        {subdistricts.map((subdistrict) => (
                            <option key={subdistrict.id} value={subdistrict.name_th}>{subdistrict.name_th}</option>
                        ))}
                    </select>
                )}

                <input
                    type="text"
                    name="postalCode"
                    placeholder="รหัสไปรษณีย์"
                    value={formData.postalCode}
                    readOnly
                    className="supplier-input"
                />
                <button type="submit" className="supplier-button" disabled={loading}>
                    {loading ? "⏳ กำลังบันทึก..." : "💾 บันทึก"}
                </button>
            </form>
        </div>
    );
};

export default SupplierForm;
