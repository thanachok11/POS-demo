import React, { useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown, faCog, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { logoutUser } from "../../api/auth/auth";
interface User {
    name: string;
    username: string;
    email: string;
    role: string;
    profileImg: string;
    nameStore: string;
}

interface UserDropdownProps {
    user: User;
    userdropdown: boolean;
    setUserDropdown: (value: boolean) => void;
    onSettings: () => void;
    onLogout: () => void;
}

const UserDropdown: React.FC<UserDropdownProps> = ({
    user,
    userdropdown,
    setUserDropdown,
    onSettings,
    onLogout,
}) => {
    const userRef = useRef<HTMLDivElement>(null);

    const handleLogout = async () => {
        try {
            await logoutUser();   // เคลียร์ session/token ที่ backend
            onLogout();           // เคลียร์ state ฝั่ง frontend
            window.location.reload(); // รีเฟรชหน้า
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };
    // ปิด dropdown เมื่อคลิกข้างนอก
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (userRef.current && !userRef.current.contains(target)) {
                setUserDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [setUserDropdown]);

    return (
        <div
            className="user-dropdown"
            ref={userRef}
            onClick={() => setUserDropdown(!userdropdown)}
        >
            <div className="user-info">
                <img src={user.profileImg} alt="User" className="avatar" />
                <div className="user-details">
                    <span className="username">{user?.username || user?.name}</span>
                    <span className="status-online">🟢 กำลังออนไลน์</span>
                </div>
                <FontAwesomeIcon icon={faCaretDown} className="icon caret-icon" />
            </div>

            {userdropdown && (
                <div className="dropdown-menu" onClick={(e) => e.stopPropagation()}>
                    <p className="user-role">👤 Role: {user.role}</p>

                    {/* เมนูตั้งค่าผู้ใช้ */}
                    <button onClick={onSettings} className="settings-button">
                        <FontAwesomeIcon icon={faCog} className="icon settings-icon" /> ตั้งค่าผู้ใช้
                    </button>

                    {/* ปุ่มออกจากระบบ */}
                    <button onClick={handleLogout} className="logout-button">
                        <FontAwesomeIcon icon={faSignOutAlt} className="icon logout-icon" /> ออกจากระบบ
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserDropdown;
