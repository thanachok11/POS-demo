import { useEffect, useState } from "react";
import { getEmployeesByManager } from "../../api/aboutStore/employeeApi.ts";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserTie, faSearch, faEnvelope, faBriefcase } from "@fortawesome/free-solid-svg-icons";
import "../../styles/aboutStore/Employee.css";

interface Employee {
    _id: string;
    name: string;
    email: string;
    position: string;
}

const EmployeeList = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState(""); // state สำหรับค้นหา

    useEffect(() => {
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

        fetchEmployees();
    }, []);

    // ฟังก์ชันกรองพนักงานตามชื่อ
    const filteredEmployees = employees.filter((employee) =>
        employee.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="employee-container">
            <h2 className="employee-header">
                <FontAwesomeIcon icon={faUserTie} className="icon" /> จัดการพนักงาน
            </h2>

            {loading && <p className="loadingEmployee">⏳ Loading...</p>}
            {error && <p className="error-message">{error}</p>}

            {/* ช่องค้นหาพนักงาน */}
            <div className="search-container">
                <input
                    type="text"
                    placeholder="🔍 ค้นหาชื่อพนักงาน..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="search-input"
                />
            </div>

            <div className="employee-list">
                {filteredEmployees.length > 0 ? (
                    filteredEmployees.map((employee) => (
                        <div key={employee._id} className="employee-card">
                            <h3>{employee.name}</h3>
                            <p><FontAwesomeIcon icon={faEnvelope} /> {employee.email}</p>
                            <p><FontAwesomeIcon icon={faBriefcase} /> {employee.position}</p>
                        </div>
                    ))
                ) : (
                    <p className="no-employee">ไม่พบพนักงานที่ตรงกับการค้นหา</p>
                )}
            </div>
        </div>
    );
};

export default EmployeeList;
