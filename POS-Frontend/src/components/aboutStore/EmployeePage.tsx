import { useEffect, useState } from "react";
import { getEmployeesByManager } from "../../api/aboutStore/employeeApi.ts";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserTie, faSearch, faEnvelope, faBriefcase, faPlus } from "@fortawesome/free-solid-svg-icons";
import "../../styles/aboutStore/Employee.css";
import AddEmployee from "../aboutStore/AddEmployee.tsx";

// Define Employee interface
interface Employee {
    _id: string;
    username?: string;
    email?: string;
    position?: string;
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

            const cleanedEmployees = data.employees.filter(
                (emp: Employee) => emp && emp.username && emp.email && emp.position
            );

            setEmployees(cleanedEmployees);
        } catch (err) {
            console.error("Error fetching employees:", err);
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setShowPopup(false);
        fetchEmployees();
    };

    const filteredEmployees = employees.filter((employee) =>
        (employee.username || "").toLowerCase().includes(search.toLowerCase())
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
                                    <td>{employee.username}</td>
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
