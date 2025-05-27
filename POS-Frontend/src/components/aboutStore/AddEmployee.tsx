import React, { useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle,faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import "../../styles/aboutStore/AddEmployee.css";

// Interface for employee data
interface EmployeeData {
  email: string;
  username: string;
  phoneNumber: string;
  password: string;
  firstName: string;
  lastName: string;
  position: string;
}

interface AddEmployeeProps {
  closeModal: () => void;
  showPopup: boolean;
  setShowPopup: (show: boolean) => void;
  message: string;
  setMessage: (message: string) => void;
  isSuccess: boolean;
  setIsSuccess: (success: boolean) => void;
}

const AddEmployee = ({
  closeModal,
  showPopup,
  setShowPopup,
  message,
  setMessage,
  isSuccess,
  setIsSuccess,
}: AddEmployeeProps) => {
  const [popupType, setPopupType] = useState<"success" | "error">("success");
  const [employee, setEmployee] = useState<EmployeeData>({
    email: '',
    username: '',
    phoneNumber: '',
    password: '',
    firstName: '',
    lastName: '',
    position: '',
  });

  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmployee({ ...employee, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('ไม่พบ Token กรุณาเข้าสู่ระบบอีกครั้ง');
        setPopupType("error");
        setIsSuccess(false);
        setShowPopup(true);
        return;
      }

      setLoading(true);

      const response = await axios.post(
        'http://localhost:5000/api/employee/register',
        employee,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 201) {
        setIsSuccess(true);
        setMessage('พนักงานถูกเพิ่มเรียบร้อยแล้ว!');
        setPopupType("success");
      } else {
        setIsSuccess(false);
        setMessage('เกิดข้อผิดพลาดในการเพิ่มพนักงาน');
        setPopupType("error");
      }
    } catch (error) {
      console.error('Error adding employee:', error);
      setIsSuccess(false);
      setMessage('ไม่สามารถเพิ่มพนักงานได้');
      setPopupType("error");
    } finally {
      setLoading(false);
      setShowPopup(true);
    }
  };

  return (
    <div className="employee-form-container">
      <h2 className="employee-form-title">เพิ่มพนักงาน</h2>
      {message && <p className="employee-form-message">{message}</p>}
      <form onSubmit={handleSubmit} className="employee-form">
        <input
          type="text"
          name="username"
          placeholder="ชื่อพนักงาน"
          value={employee.username}
          onChange={handleChange}
          required
          className="employee-input"
        />
        <input
          type="text"
          name="firstName"
          placeholder="ชื่อจริง"
          value={employee.firstName}
          onChange={handleChange}
          required
          className="employee-input"
        />
                <input
          type="text"
          name="lastName"
          placeholder="นามสกุล"
          value={employee.lastName}
          onChange={handleChange}
          required
          className="employee-input"
        />
        <input
          type="text"
          name="phoneNumber"
          placeholder="เบอร์โทรศัพท์"
          value={employee.phoneNumber}
          onChange={handleChange}
          required
          className="employee-input"
        />

        <input
          type="email"
          name="email"
          placeholder="อีเมล"
          value={employee.email}
          onChange={handleChange}
          required
          className="employee-input"
        />          
        <input
          type="password"
          name="password"
          placeholder="รหัสผ่าน"
          value={employee.password}
          onChange={handleChange}
          required
          className="employee-input"
        />

        <input
          type="text"
          name="position"
          placeholder="ตำแหน่ง"
          value={employee.position}
          onChange={handleChange}
          required
          className="employee-input"
        />

        <button type="submit" className="employee-button" disabled={loading}>
          {loading ? "⏳ กำลังบันทึก..." : "💾 บันทึก"}
        </button>
      </form>

      {/* Popup */}
      {/* Popup */}
      {showPopup && (
        <div className={`AddEmployee-popup ${popupType}`}>
          <div className={`AddEmployee-popup-content ${isSuccess ? 'success' : 'error'}`}>
            <FontAwesomeIcon
              icon={isSuccess ? faCheckCircle : faTimesCircle}
              className={`AddEmployee-icon ${isSuccess ? 'success' : 'error'}`}
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
  );
};

export default AddEmployee;
