import React from "react";
import "../../../styles/page/EmployeePage.css"; // นำเข้า CSS เฉพาะพนักงาน

const EmployeePage: React.FC = () => {
    return (
        <div className="display">
        <div className="employee-dashboard">
            <section className="employee-dashboard__text">
                <h1 className="employee-dashboard__heading">👷‍♂️ แดชบอร์ดพนักงาน</h1>
                <p className="employee-dashboard__description">
                    เข้าถึงฟังก์ชันที่เกี่ยวข้องกับการทำงานประจำวัน เช่น การขายสินค้า ตรวจสอบตารางกะ และรับการแจ้งเตือน
                </p>

                <div className="employee-dashboard__features">
                    <div className="employee-dashboard__feature-item">
                        🛒 <strong>ขายสินค้า:</strong> เข้าถึงหน้าขายอย่างรวดเร็ว
                    </div>
                    <div className="employee-dashboard__feature-item">
                        🧾 <strong>พิมพ์ใบเสร็จ:</strong> พิมพ์ใบเสร็จหลังการขายสินค้า
                    </div>
                    <div className="employee-dashboard__feature-item">
                        🕒 <strong>ตรวจสอบกะงาน:</strong> ตรวจสอบเวลาทำงานของคุณ
                    </div>
                    <div className="employee-dashboard__feature-item">
                        📢 <strong>แจ้งเตือน:</strong> รับข่าวสารและแจ้งเตือนจากผู้จัดการ
                    </div>
                </div>
            </section>

            <section className="employee-dashboard__image">
                <img
                    className="employee-dashboard__img"
                    src="https://res.cloudinary.com/dboau6axv/image/upload/v1738154844/employee_pos_hzzmpf.jpg"
                    alt="POS Employee"
                />
            </section>
        </div>
        </div>
    );
};

export default EmployeePage;
