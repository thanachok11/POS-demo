import { useEffect, useState } from "react";
import { addSupplier } from "../../api/utils/supplierApi.ts";
import axios from "axios";
import "../../styles/supplier/SupplierForm.css";
import React from "react";

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
        if (formData.state) {
            const selectedState = states.find((s: any) => s.name_th === formData.state);
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
    }, [formData.state, states]);

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
        if (formData.subdistrict) {
            const selectedSubdistrict = subdistricts.find((s: any) => s.name_th === formData.subdistrict);
            if (selectedSubdistrict) {
                setFormData((prevData) => ({
                    ...prevData,
                    postalCode: selectedSubdistrict.zip_code || "",
                }));
            }
        }
    }, [formData.subdistrict, subdistricts]);

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
        <div className="supplier-form-container">
            <h2 className="supplier-form-title">เพิ่มซัพพลายเออร์</h2>
            {message && <p className="supplier-form-message">{message}</p>}
            <form onSubmit={handleSubmit} className="supplier-form">
                <input
                    type="text"
                    name="name"
                    placeholder="ชื่อบริษัท"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="supplier-input"
                />
                <input
                    type="text"
                    name="phone"
                    placeholder="เบอร์โทรศัพท์"
                    value={formData.phone}
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
                        name="state"
                        value={formData.state}
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

                {formData.state && (
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
                        name="subdistrict"
                        value={formData.subdistrict}
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
