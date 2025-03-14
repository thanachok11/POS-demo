import { useEffect, useState } from "react";
import { getEmployeesByManager } from "../../api/aboutStore/employeeApi.ts";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserTie, faSearch, faEnvelope, faBriefcase, faPlus } from "@fortawesome/free-solid-svg-icons";
import "../../styles/aboutStore/Employee.css";
import AddEmployee from "../aboutStore/AddEmployee.tsx"; // นำเข้าฟอร์ม AddEmployee

// Define Employee interface
interface Employee {
    _id: string;
    name: string;
    email: string;
    position: string;
}

// Define AddEmployee props interface
interface AddEmployeeProps {
    closeModal: () => void;
}

const EmployeeList: React.FC = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState<string>("");
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    // Fetch employees data
    const fetchEmployees = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Unauthorized: No token found");

            const data = await getEmployeesByManager(token);
            if (!data || !data.employees) throw new Error("No employees found");

            setEmployees(data.employees);
        } catch (err) {
            console.error("Error fetching employees:", err);
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch of employees
    useEffect(() => {
        fetchEmployees();
    }, []);

    // Open modal handler
    const openModal = () => {
        setIsModalOpen(true);
    };

    // Close modal handler and refresh employee list
    const closeModal = () => {
        setIsModalOpen(false);
        setShowPopup(false); // Optional: Clear popup state when closing modal
        fetchEmployees(); // Refresh employee data after adding a new employee
    };

    // Filter employees based on search
    const filteredEmployees = employees.filter((employee) =>
        employee.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="employee-container">
            <h2 className="employee-header">
                <span className="employee-title">👨‍💼</span> จัดการพนักงาน
            </h2>
            {loading && <p className="loading-employee">⏳ Loading...</p>}
            {error && <p className="error-message">{error}</p>}
            <div className="empsearch-container">
                <input
                    type="text"
                    placeholder="🔍 ค้นหาชื่อพนักงาน..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="empsearch-input"
                />
            </div>
            <button className="add-employee-button" onClick={openModal}>
                <FontAwesomeIcon icon={faPlus} /> เพิ่มพนักงาน
            </button>
            <div className="employee-table-container">
                <table className="employee-table">
                    <thead>
                        <tr>
                            <th>ชื่อพนักงาน</th>
                            <th>อีเมล</th>
                            <th>ตำแหน่ง</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEmployees.length > 0 ? (
                            filteredEmployees.map((employee) => (
                                <tr key={employee._id}>
                                    <td>{employee.name}</td>
                                    <td>{employee.email}</td>
                                    <td>{employee.position}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={3} className="no-employee">ไม่พบพนักงาน</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <button className="modal-close" onClick={closeModal}>❌</button>
                        <AddEmployee
                            closeModal={closeModal}
                            showPopup={showPopup}
                            setShowPopup={setShowPopup}
                            message={message}
                            setMessage={setMessage}
                            isSuccess={isSuccess}
                            setIsSuccess={setIsSuccess}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeList;
