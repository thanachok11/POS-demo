import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/aboutStore/AddEmployee.css";
import GlobalPopup from "../layout/GlobalPopup"; // ✅ popup กลาง

interface EmployeeData {
  _id?: string;
  email?: string;
  username?: string;
  phoneNumber?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  position?: string;
}

interface AddEmployeeProps {
  closeModal: () => void;
  showPopup: boolean;
  setShowPopup: (show: boolean) => void;
  message: string;
  setMessage: (message: string) => void;
  isSuccess: boolean;
  setIsSuccess: (success: boolean) => void;
  employee?: EmployeeData | null;
}

const AddEmployee: React.FC<AddEmployeeProps> = ({
  closeModal,
  showPopup,
  setShowPopup,
  message,
  setMessage,
  isSuccess,
  setIsSuccess,
  employee,
}) => {
  const [formData, setFormData] = useState<EmployeeData>({
    email: "",
    username: "",
    phoneNumber: "",
    password: "",
    firstName: "",
    lastName: "",
    position: "",
  });

  const [loading, setLoading] = useState(false);

  // ✅ โหลดข้อมูลพนักงานเก่าถ้ามี
  useEffect(() => {
    if (employee) {
      setFormData({ ...employee, password: "" });
    } else {
      setFormData({
        email: "",
        username: "",
        phoneNumber: "",
        password: "",
        firstName: "",
        lastName: "",
        position: "",
      });
    }
  }, [employee]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("ไม่พบ Token กรุณาเข้าสู่ระบบอีกครั้ง");
      setIsSuccess(false);
      setShowPopup(true);
      closeModal();
      return;
    }

    try {
      setLoading(true);
      let response;

      if (employee && employee._id) {
        // ✅ แก้ไขข้อมูล
        response = await axios.put(
          `http://localhost:5000/api/employee/${employee._id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // ✅ เพิ่มพนักงานใหม่
        response = await axios.post(
          "http://localhost:5000/api/employee/register",
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      if (response.status === 200 || response.status === 201) {
        setIsSuccess(true);
        setMessage(employee ? "แก้ไขข้อมูลพนักงานเรียบร้อย!" : "เพิ่มพนักงานเรียบร้อย!");
      } else {
        setIsSuccess(false);
        setMessage("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    } catch (error: any) {
      console.error("❌ Error saving employee:", error);
      setMessage(error.response?.data?.message || "❌ ไม่สามารถบันทึกข้อมูลได้");
      setIsSuccess(false);
    } finally {
      setLoading(false);
      setShowPopup(true);
      closeModal();
    }
  };

  return (
    <div className="employee-modal-overlay">
      <div className="employee-modal-content">
        <button className="modal-close" onClick={closeModal}>
          ✖
        </button>
        <h2 className="employee-form-title">
          {employee ? "แก้ไขพนักงาน" : "เพิ่มพนักงาน"}
        </h2>

        <form onSubmit={handleSubmit} className="employee-form">
          <input
            type="text"
            name="username"
            placeholder="ชื่อพนักงาน"
            value={formData.username}
            onChange={handleChange}
            required
            className="employee-input"
          />
          <input
            type="text"
            name="firstName"
            placeholder="ชื่อจริง"
            value={formData.firstName}
            onChange={handleChange}
            required
            className="employee-input"
          />
          <input
            type="text"
            name="lastName"
            placeholder="นามสกุล"
            value={formData.lastName}
            onChange={handleChange}
            required
            className="employee-input"
          />
          <input
            type="text"
            name="phoneNumber"
            placeholder="เบอร์โทรศัพท์"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
            className="employee-input"
          />
          <input
            type="email"
            name="email"
            placeholder="อีเมล"
            value={formData.email}
            onChange={handleChange}
            required
            className="employee-input"
          />

          {!employee && (
            <input
              type="password"
              name="password"
              placeholder="รหัสผ่าน"
              value={formData.password}
              onChange={handleChange}
              required
              className="employee-input"
            />
          )}

          <input
            type="text"
            name="position"
            placeholder="ตำแหน่ง"
            value={formData.position}
            onChange={handleChange}
            required
            className="employee-input"
          />

          <div className="employee-actions">
            <button type="submit" className="employee-save-btn" disabled={loading}>
              {loading ? "⏳ กำลังบันทึก..." : "บันทึก"}
            </button>
            <button
              type="button"
              className="employee-cancel-btn"
              onClick={closeModal}
              disabled={loading}
            >
              ยกเลิก
            </button>
          </div>
        </form>
      </div>

      {/* ✅ Global Popup */}
      <GlobalPopup
        message={message}
        isSuccess={isSuccess}
        show={showPopup}
        setShow={setShowPopup}
        onClose={closeModal}
      />
    </div>
  );
};

export default AddEmployee;
