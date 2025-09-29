import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import "../../styles/aboutStore/AddEmployee.css";

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
  const [popupType, setPopupType] = useState<"success" | "error">("success");
  const [formData, setFormData] = useState<EmployeeData>({
    email: "",
    username: "",
    phoneNumber: "",
    password: "",
    firstName: "",
    lastName: "",
    position: "",
  });
  const [loading, setLoading] = useState<boolean>(false);

  // ✅ โหลดข้อมูลพนักงานตอนกดแก้ไข
  useEffect(() => {
    if (employee) {
      setFormData({
        ...employee,
        password: "", // reset password เวลาแก้ไข
      });
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
      setPopupType("error");
      setIsSuccess(false);
      setShowPopup(true);
      return;
    }

    try {
      setLoading(true);
      let response;

      if (employee && employee._id) {
        // ✅ อัปเดต
        response = await axios.put(
          `http://localhost:5000/api/employee/${employee._id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // ✅ เพิ่มใหม่
        response = await axios.post(
          "http://localhost:5000/api/employee/register",
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      if (response.status === 200 || response.status === 201) {
        setIsSuccess(true);
        setMessage(employee ? "แก้ไขข้อมูลพนักงานเรียบร้อย!" : "เพิ่มพนักงานเรียบร้อย!");
        setPopupType("success");
      } else {
        setIsSuccess(false);
        setMessage("เกิดข้อผิดพลาด");
        setPopupType("error");
      }
    } catch (error) {
      console.error("Error saving employee:", error);
      setIsSuccess(false);
      setMessage("❌ ไม่สามารถบันทึกข้อมูลได้");
      setPopupType("error");
    } finally {
      setLoading(false);
      setShowPopup(true);
    }
  };

  return (
    <div className="employee-modal-overlay">
      <div className="employee-modal-content">
        <button className="modal-close" onClick={closeModal}>
          ❌
        </button>
        <h2 className="employee-form-title">
          {employee ? "แก้ไขพนักงาน" : "เพิ่มพนักงาน"}
        </h2>

        {message && <p className="employee-form-message">{message}</p>}

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

          <button type="submit" className="employee-button" disabled={loading}>
            {loading ? "⏳ กำลังบันทึก..." : "💾 บันทึก"}
          </button>
        </form>

        {/* Popup */}
        {showPopup && (
          <div className={`AddEmployee-popup ${popupType}`}>
            <div
              className={`AddEmployee-popup-content ${isSuccess ? "success" : "error"
                }`}
            >
              <FontAwesomeIcon
                icon={isSuccess ? faCheckCircle : faTimesCircle}
                className={`AddEmployee-icon ${isSuccess ? "success" : "error"
                  }`}
              />
              <h3 className="AddEmployee-popup-title">{message}</h3>
              <button
                onClick={() => {
                  setShowPopup(false);
                  if (isSuccess && popupType === "success") closeModal();
                }}
                className="AddEmployee-popup-close-btn"
              >
                ปิด
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddEmployee;
