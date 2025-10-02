import { useEffect, useState } from "react";
import { getEmployeesByManager, deleteEmployee } from "../../api/aboutStore/employeeApi";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import "../../styles/aboutStore/Employee.css";
import AddEmployee from "../aboutStore/AddEmployee";
import GlobalPopup from "../layout/GlobalPopup"; // ✅ ใช้ popup กลาง

interface Employee {
    _id: string;
    username?: string;
    email?: string;
    position?: string;
    phoneNumber?: string;
    firstName?: string;
    lastName?: string;
}

const EmployeeList: React.FC = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState<string>("");

    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

    // popup state
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

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

    const openModal = (employee?: Employee) => {
        setSelectedEmployee(employee || null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedEmployee(null);
        fetchEmployees();
    };

    const handleDelete = async (employeeId: string) => {
        if (!window.confirm("คุณแน่ใจหรือไม่ที่จะลบพนักงานนี้?")) return;

        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Unauthorized: No token found");

            await deleteEmployee(employeeId, token);
            setEmployees((prev) => prev.filter((e) => e._id !== employeeId));
            setMessage("🗑️ ลบพนักงานสำเร็จ!");
            setIsSuccess(true);
            setShowPopup(true);
        } catch (err) {
            console.error("Error deleting employee:", err);
            setMessage("❌ ไม่สามารถลบพนักงานได้");
            setIsSuccess(false);
            setShowPopup(true);
        }
    };

    // ✅ filter + pagination
    const filteredEmployees = employees.filter((employee) =>
        (employee.username || "").toLowerCase().includes(search.toLowerCase())
    );

    const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentEmployees = filteredEmployees.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="display">
            <div className="employee-container">
                {/* Header */}
                <div className="employee-header-wrapper">
                    <h2 className="employee-header">👨‍💼 จัดการพนักงาน</h2>
                    {loading && <p className="loading-employee">⏳ Loading...</p>}
                    {error && <p className="error-message">{error}</p>}

                    {/* Controls */}
                    <div className="employee-controls">
                        <div className="search-container">
                            <input
                                type="text"
                                placeholder="🔍 ค้นหาชื่อพนักงาน..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="search-input"
                            />
                        </div>

                        <div className="items-per-page">
                            <label>แสดง: </label>
                            <select
                                value={itemsPerPage}
                                onChange={(e) => {
                                    setItemsPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={30}>30</option>
                            </select>
                            <span> รายการต่อหน้า</span>
                        </div>
                    </div>

                    {/* Add Button */}
                    <button className="add-employee-button" onClick={() => openModal()}>
                        <FontAwesomeIcon icon={faPlus} /> เพิ่มพนักงาน
                    </button>
                </div>

                {/* Table */}
                <div className="employee-table-wrapper">
                    <table className="employee-table">
                        <thead>
                            <tr>
                                <th>ชื่อพนักงาน</th>
                                <th>อีเมล</th>
                                <th>ตำแหน่ง</th>
                                <th>จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentEmployees.length > 0 ? (
                                currentEmployees.map((employee) => (
                                    <tr key={employee._id}>
                                        <td>{employee.username}</td>
                                        <td>{employee.email}</td>
                                        <td>{employee.position}</td>
                                        <td>
                                            <div className="employee-action-buttons">
                                                <button
                                                    className="employee-edit-btn"
                                                    onClick={() => openModal(employee)}
                                                >
                                                    แก้ไข
                                                </button>
                                                <button
                                                    className="employee-delete-btn"
                                                    onClick={() => handleDelete(employee._id)}
                                                >
                                                    ลบ
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="no-employee">
                                        ❌ ไม่พบพนักงาน
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="pagination">
                    <button
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        ◀ ก่อนหน้า
                    </button>
                    <span>
                        หน้า {currentPage} จาก {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                        disabled={currentPage === totalPages}
                    >
                        ถัดไป ▶
                    </button>
                </div>

                {/* Modal */}
                {isModalOpen && (
                    <AddEmployee
                        closeModal={closeModal}
                        showPopup={showPopup}
                        setShowPopup={setShowPopup}
                        message={message}
                        setMessage={setMessage}
                        isSuccess={isSuccess}
                        setIsSuccess={setIsSuccess}
                        employee={selectedEmployee}
                    />
                )}

                {/* Global Popup */}
                <GlobalPopup
                    message={message}
                    isSuccess={isSuccess}
                    show={showPopup}
                    setShow={setShowPopup}
                />
            </div>
        </div>
    );
};

export default EmployeeList;
