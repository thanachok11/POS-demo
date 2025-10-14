import { useEffect, useState } from "react";
import { addSupplier, updateSupplier } from "../../api/suppliers/supplierApi";
import axios from "axios";
import "../../styles/supplier/SupplierForm.css";

interface Supplier {
    _id?: string;
    code?: string; // ✅ ใช้แสดงรหัสจาก backend
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
    onSave: (success: boolean, message: string) => void;
}

// ✅ Thai location dataset
const PROVINCE_URL =
    "https://raw.githubusercontent.com/kongvut/thai-province-data/refs/heads/master/api/latest/province.json";
const DISTRICT_URL =
    "https://raw.githubusercontent.com/kongvut/thai-province-data/refs/heads/master/api/latest/district.json";
const SUBDISTRICT_URL =
    "https://raw.githubusercontent.com/kongvut/thai-province-data/refs/heads/master/api/latest/sub_district.json";

const isThailand = (country?: string) =>
    (country || "").toLowerCase().includes("thai") ||
    (country || "").includes("ประเทศไทย") ||
    (country || "").includes("ไทย");

const matchByName = (item: any, name: string) =>
    item?.name_th === name || item?.name_en === name;

const SupplierForm: React.FC<SupplierFormProps> = ({ supplier, onClose, onSave }) => {
    const [formData, setFormData] = useState<Supplier>({
        _id: supplier?._id || "",
        code: supplier?.code || "",
        companyName: supplier?.companyName || "",
        phoneNumber: supplier?.phoneNumber || "",
        email: supplier?.email || "",
        address: supplier?.address || "",
        country: supplier?.country || "ประเทศไทย",
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

    // 🧭 โหลด country list
    useEffect(() => {
        axios
            .get("https://restcountries.com/v3.1/all?fields=name")
            .then((res) => {
                const list = res.data.map((c: any) => c.name.common).sort();
                setCountries(list);
            })
            .catch(() => { });
    }, []);

    // 🏙️ โหลดจังหวัด
    useEffect(() => {
        if (!isThailand(formData.country)) {
            setStates([]);
            return;
        }
        axios.get(PROVINCE_URL).then((res) => setStates(res.data));
    }, [formData.country]);

    // 🏗️ โหลดอำเภอ
    useEffect(() => {
        if (!formData.stateOrProvince || states.length === 0) return;
        const selectedState = states.find((s: any) =>
            matchByName(s, formData.stateOrProvince)
        );
        if (!selectedState) return;

        axios.get(DISTRICT_URL).then((res) => {
            const amphures = res.data.filter(
                (d: any) => Number(d.province_id) === Number(selectedState.id)
            );
            setDistricts(amphures);
        });
    }, [formData.stateOrProvince, states]);

    // 🏡 โหลดตำบล
    useEffect(() => {
        if (!formData.district || districts.length === 0) return;
        const selectedDistrict = districts.find((d: any) =>
            matchByName(d, formData.district)
        );
        if (!selectedDistrict) return;

        axios.get(SUBDISTRICT_URL).then((res) => {
            const tambons = res.data.filter(
                (t: any) => Number(t.district_id) === Number(selectedDistrict.id)
            );
            setSubdistricts(tambons);
        });
    }, [formData.district, districts]);

    // 📬 ตั้งรหัสไปรษณีย์อัตโนมัติ
    useEffect(() => {
        if (!formData.subDistrict || subdistricts.length === 0) return;
        const selectedSub = subdistricts.find((s: any) =>
            matchByName(s, formData.subDistrict)
        );
        if (selectedSub) {
            setFormData((prev) => ({
                ...prev,
                postalCode: selectedSub.zip_code?.toString() || "",
            }));
        }
    }, [formData.subDistrict, subdistricts]);

    // 🧾 handle change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === "country") {
            setFormData((prev) => ({
                ...prev,
                country: value,
                stateOrProvince: "",
                district: "",
                subDistrict: "",
                postalCode: "",
            }));
            return;
        }

        if (name === "stateOrProvince") {
            setFormData((prev) => ({
                ...prev,
                stateOrProvince: value,
                district: "",
                subDistrict: "",
                postalCode: "",
            }));
            return;
        }

        if (name === "district") {
            setFormData((prev) => ({
                ...prev,
                district: value,
                subDistrict: "",
                postalCode: "",
            }));
            return;
        }

        setFormData({ ...formData, [name]: value });
    };

    // 💾 submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const token = localStorage.getItem("token");
        if (!token) {
            onSave(false, "❌ ไม่มี token");
            onClose();
            return;
        }

        try {
            if (formData._id) {
                await updateSupplier(formData._id, formData, token);
                onSave(true, "✅ แก้ไขซัพพลายเออร์สำเร็จ!");
            } else {
                await addSupplier(formData, token);
                onSave(true, "✅ เพิ่มซัพพลายเออร์สำเร็จ!");
            }
        } catch (err: any) {
            console.error("❌ SupplierForm Error:", err);
            const backendMsg =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                "❌ เกิดข้อผิดพลาดในการบันทึกซัพพลายเออร์";
            onSave(false, backendMsg);
        } finally {
            setLoading(false);
            onClose();
        }
    };

    return (
        <div className="supplier-form-container">
            <h2 className="supplier-form-title">
                {formData._id ? "✏️ แก้ไขซัพพลายเออร์" : "➕ เพิ่มซัพพลายเออร์ใหม่"}
            </h2>

            <form onSubmit={handleSubmit} className="supplier-form">
                {formData._id && formData.code && (
                    <div className="supplier-form-group">
                        <label>รหัสซัพพลายเออร์</label>
                        <input
                            type="text"
                            value={formData.code}
                            disabled
                            className="readonly-input"
                        />
                    </div>
                )}

                <input
                    className="supplier-input"
                    name="companyName"
                    placeholder="ชื่อบริษัท / ซัพพลายเออร์"
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                />
                <input
                    className="supplier-input"
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

                {isThailand(formData.country) && (
                    <>
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
                            name="postalCode"
                            placeholder="รหัสไปรษณีย์"
                            value={formData.postalCode}
                            onChange={handleChange}
                            readOnly
                        />
                    </>
                )}

                <div className="discount-modal-actions">
                    <button type="submit" className="supplier-save-btn" disabled={loading}>
                        {loading ? "⏳ กำลังบันทึก..." : "บันทึก"}
                    </button>
                    <button
                        type="button"
                        className="supplier-cancel-btn"
                        onClick={onClose}
                        disabled={loading}
                    >
                        ยกเลิก
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SupplierForm;
