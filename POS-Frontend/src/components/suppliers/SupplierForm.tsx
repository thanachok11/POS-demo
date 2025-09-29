import { useEffect, useState } from "react";
import { addSupplier, updateSupplier } from "../../api/suppliers/supplierApi";
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

// ✅ URL dataset ล่าสุด
const PROVINCE_URL =
    "https://raw.githubusercontent.com/kongvut/thai-province-data/refs/heads/master/api/latest/province.json";
const DISTRICT_URL =
    "https://raw.githubusercontent.com/kongvut/thai-province-data/refs/heads/master/api/latest/district.json";
const SUBDISTRICT_URL =
    "https://raw.githubusercontent.com/kongvut/thai-province-data/refs/heads/master/api/latest/sub_district.json";

// helper
const isThailand = (country?: string) =>
    (country || "").toLowerCase().includes("thai") ||
    (country || "").includes("ประเทศไทย") ||
    (country || "").includes("ไทย");

const matchByName = (item: any, name: string) =>
    item?.name_th === name || item?.name_en === name;

const SupplierForm: React.FC<SupplierFormProps> = ({
    supplier,
    onClose,
    onSave,
}) => {
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

    // sync form เมื่อเปิด modal
    useEffect(() => {
        if (!supplier) return;
        setFormData({
            id: (supplier as any)._id || supplier.id,   // ✅ รองรับทั้ง _id และ id
            companyName: supplier.companyName || "",
            phoneNumber: supplier.phoneNumber || "",
            email: supplier.email || "",
            address: supplier.address || "",
            country: supplier.country || "",
            stateOrProvince: supplier.stateOrProvince || "",
            district: supplier.district || "",
            subDistrict: supplier.subDistrict || "",
            postalCode: supplier.postalCode || "",
        });
        console.log("📌 Edit supplier:", supplier);
    }, [supplier]);


    // โหลด country list
    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const res = await axios.get(
                    "https://restcountries.com/v3.1/all?fields=name"
                );
                const list = res.data.map((c: any) => c.name.common).sort();
                setCountries(list);
            } catch (e) {
            }
        };
        fetchCountries();
    }, []);

    // โหลดจังหวัด
    useEffect(() => {
        if (!isThailand(formData.country) && !formData.stateOrProvince) {
            setStates([]);
            return;
        }
        (async () => {
            try {
                const res = await axios.get(PROVINCE_URL);
                setStates(res.data);
            } catch (e) {
            }
        })();
    }, [formData.country]);

    // โหลดอำเภอ
    useEffect(() => {
        if (!formData.stateOrProvince || states.length === 0) return;
        const selectedState = states.find((s: any) =>
            matchByName(s, formData.stateOrProvince)
        );
        if (!selectedState) return;

        (async () => {
            try {
                const res = await axios.get(DISTRICT_URL);
                const amphures = res.data.filter(
                    (d: any) => Number(d.province_id) === Number(selectedState.id)
                );
                setDistricts(amphures);
            } catch (e) {
                console.error("❌ Error fetching districts:", e);
            }
        })();
    }, [formData.stateOrProvince, states]);

    // โหลดตำบล
    // โหลดตำบล
    useEffect(() => {
        if (!formData.district || districts.length === 0) return;
        const selectedDistrict = districts.find((d: any) =>
            matchByName(d, formData.district)
        );
        if (!selectedDistrict) return;

        (async () => {
            try {
                const res = await axios.get(SUBDISTRICT_URL);
                const tambons = res.data.filter(
                    (t: any) => Number(t.district_id) === Number(selectedDistrict.id) // ✅ fix ตรงนี้
                );
                setSubdistricts(tambons);
            } catch (e) {
                console.error("Error fetching subdistricts:", e);
            }
        })();
    }, [formData.district, districts]);


    // ตั้งรหัสไปรษณีย์ auto
    useEffect(() => {
        if (!formData.subDistrict || subdistricts.length === 0) return;
        const selectedSub = subdistricts.find((s: any) =>
            matchByName(s, formData.subDistrict)
        );
        console.log("📌 Selected subdistrict:", selectedSub);
        if (selectedSub) {
            setFormData((prev) => ({
                ...prev,
                postalCode: selectedSub.zip_code?.toString() || "",
            }));
        }
    }, [formData.subDistrict, subdistricts]);

    // handle change
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;

        if (name === "country") {
            setFormData((p) => ({
                ...p,
                country: value,
                stateOrProvince: "",
                district: "",
                subDistrict: "",
                postalCode: "",
            }));
            return;
        }
        if (name === "stateOrProvince") {
            setFormData((p) => ({
                ...p,
                stateOrProvince: value,
                district: "",
                subDistrict: "",
                postalCode: "",
            }));
            return;
        }
        if (name === "district") {
            setFormData((p) => ({
                ...p,
                district: value,
                subDistrict: "",
                postalCode: "",
            }));
            return;
        }

        setFormData({ ...formData, [name]: value });
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

            if (formData.id) {
                await updateSupplier(formData.id, formData, token);
                setMessage("✅ แก้ไขซัพพลายเออร์สำเร็จ!");
            } else {
                await addSupplier(formData, token);
                setMessage("✅ เพิ่มซัพพลายเออร์สำเร็จ!");
            }

            setTimeout(() => { onSave(); onClose(); }, 800);
        } catch (error) {
            setMessage("❌ เกิดข้อผิดพลาดในการบันทึกซัพพลายเออร์");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="supplier-form-container">
            <h2 className="supplier-form-title">
                {supplier ? "แก้ไขซัพพลายเออร์" : "เพิ่มซัพพลายเออร์"}
            </h2>
            {message && <p className="supplier-form-message">{message}</p>}

            <form onSubmit={handleSubmit} className="supplier-form">
                <input
                    className="supplier-input"
                    type="text"
                    name="companyName"
                    placeholder="ชื่อบริษัท"
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                />
                <input
                    className="supplier-input"
                    type="text"
                    name="phoneNumber"
                    placeholder="เบอร์โทรศัพท์"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                />
                <input
                    className="supplier-input"
                    type="email"
                    name="email"
                    placeholder="อีเมล"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
                <input
                    className="supplier-input"
                    type="text"
                    name="address"
                    placeholder="ที่อยู่"
                    value={formData.address}
                    onChange={handleChange}
                    required
                />

                <select
                    className="supplier-select"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    required
                >
                    <option value="">เลือกประเทศ</option>
                    {countries.map((c) => (
                        <option key={c} value={c}>
                            {c}
                        </option>
                    ))}
                </select>

                {(isThailand(formData.country) || !!formData.stateOrProvince) && (
                    <select
                        className="supplier-select"
                        name="stateOrProvince"
                        value={formData.stateOrProvince}
                        onChange={handleChange}
                        required
                    >
                        <option value="">เลือกจังหวัด</option>
                        {states.map((s) => (
                            <option key={s.id} value={s.name_th}>
                                {s.name_th}
                            </option>
                        ))}
                    </select>
                )}

                {formData.stateOrProvince && (
                    <select
                        className="supplier-select"
                        name="district"
                        value={formData.district}
                        onChange={handleChange}
                        required
                    >
                        <option value="">เลือกอำเภอ</option>
                        {districts.map((d) => (
                            <option key={d.id} value={d.name_th}>
                                {d.name_th}
                            </option>
                        ))}
                    </select>
                )}

                {formData.district && (
                    <select
                        className="supplier-select"
                        name="subDistrict"
                        value={formData.subDistrict}
                        onChange={handleChange}
                        required
                    >
                        <option value="">เลือกตำบล</option>
                        {subdistricts.map((t) => (
                            <option key={t.id} value={t.name_th}>
                                {t.name_th}
                            </option>
                        ))}
                    </select>
                )}

                <input
                    className="supplier-input"
                    type="text"
                    name="postalCode"
                    placeholder="รหัสไปรษณีย์"
                    value={formData.postalCode}
                    readOnly
                />

                <button type="submit" className="supplier-button" disabled={loading}>
                    {loading ? "⏳ กำลังบันทึก..." : "💾 บันทึก"}
                </button>
            </form>
        </div>
    );
};

export default SupplierForm;
