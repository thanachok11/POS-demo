import React, { useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import "../../styles/aboutStore/AddEmployee.css";

// Interface for employee data
interface EmployeeData {
  email: string;
  name: string;
  phoneNumber: string;
  password: string;
  username: string;
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
  const [employee, setEmployee] = useState<EmployeeData>({
    email: '',
    name: '',
    phoneNumber: '',
    password: '',
    username: '',
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
        setMessage('No token found. Please log in first.');
        return;
      }

      setLoading(true); // Start loading
      const response = await axios.post(
        'http://localhost:5000/api/employee/register',
        employee,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 201) {
        setIsSuccess(true);
        setShowPopup(true);
      }
    } catch (error) {
      console.error('Error adding employee:', error);
      setMessage('Failed to add employee');
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div className="employee-form-container">
      <h2 className="employee-form-title">เพิ่มพนักงาน</h2>
      {message && <p className="employee-form-message">{message}</p>}
      <form onSubmit={handleSubmit} className="employee-form">
        <input
          type="text"
          name="name"
          placeholder="ชื่อพนักงาน"
          value={employee.name}
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
      {showPopup && (
        <div className="AddEmployee-popup">
          <div className="AddEmployee-popup-content">
            <FontAwesomeIcon icon={faCheckCircle} className="AddEmployee-icon" />
            <h3 className="AddEmployee-popup-title">พนักงานถูกเพิ่มเรียบร้อยแล้ว!</h3>
            <button onClick={() => setShowPopup(false)} className="AddEmployee-popup-close-btn">
              ปิด
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddEmployee;
