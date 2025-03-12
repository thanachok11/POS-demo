import React, { useState, useEffect } from "react";
import "../../styles/page/UserSettings.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faEnvelope, faSave, faStore, faUserShield, faCamera } from "@fortawesome/free-solid-svg-icons";
import { jwtDecode } from "jwt-decode";

interface User {
  name:string;
  username: string;
  firstname:string;
  email: string;
  role: string;
  profileImg: string;
  nameStore: string;
}

const UserSettings: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [editedUser, setEditedUser] = useState<User | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        const userData: User = {
          username: decoded.username,
          name:decoded.name,
          firstname: decoded.firstname,
          email: decoded.email,
          role: decoded.role,
          nameStore: decodeURIComponent(decoded.nameStore), // รองรับภาษาไทย
          profileImg: decoded.profile_img || "default-avatar.png",
        };
        setUser(userData);
        setEditedUser(userData);
      } catch (error) {
        console.error("Invalid token:", error);
      }
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editedUser) {
      setEditedUser({ ...editedUser, [e.target.name]: e.target.value });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSaveChanges = async () => {
    if (!editedUser) return;

    const formData = new FormData();
    formData.append("username", editedUser.username);
    formData.append("email", editedUser.email);
    formData.append("role", editedUser.role);
    formData.append("nameStore", encodeURIComponent(editedUser.nameStore)); // เก็บภาษาไทยให้ถูกต้อง
    if (selectedFile) {
      formData.append("profileImg", selectedFile);
    }

    try {
      const response = await fetch("/api/update-user", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (data.success) {
        setUser(editedUser);
        alert("บันทึกการเปลี่ยนแปลงสำเร็จ!");
      } else {
        alert("เกิดข้อผิดพลาด: " + data.message);
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  return (
    <div className="usersetting-page">
      <div className="usersetting-container">
        <h2 className="usersetting-title">การตั้งค่าโปรไฟล์</h2>
        {user && (
          <div className="usersetting-profile-card">
            <div className="usersetting-profile-picture">
              <img src={selectedFile ? URL.createObjectURL(selectedFile) : editedUser?.profileImg} alt="User Profile" />
              <label className="usersetting-upload-icon">
                <FontAwesomeIcon icon={faCamera} />
                <input type="file" accept="image/*" hidden onChange={handleFileChange} />
              </label>
            </div>
            <div className="usersetting-profile-details">
              <div className="usersetting-input-group">
                <FontAwesomeIcon icon={faUser} className="usersetting-icon" />
                <input type="text" name="username" value={editedUser?.username || editedUser?.name} onChange={handleInputChange} className="usersetting-input" />
              </div>
              <div className="usersetting-input-group">
                <FontAwesomeIcon icon={faUser} className="usersetting-icon" />
                <input type="text" name="firstname" value={editedUser?.firstname || ''} onChange={handleInputChange} className="usersetting-input" />
              </div>
              <div className="usersetting-input-group">
                <FontAwesomeIcon icon={faEnvelope} className="usersetting-icon" />
                <input type="email" name="email" value={editedUser?.email || ''} onChange={handleInputChange} className="usersetting-input" />
              </div>
              <div className="usersetting-input-group">
                <FontAwesomeIcon icon={faUserShield} className="usersetting-icon" />
                <input type="text" value={editedUser?.role || ''} disabled className="usersetting-input" />
              </div>
              {user.nameStore && (
                <div className="usersetting-input-group">
                  <FontAwesomeIcon icon={faStore} className="usersetting-icon" />
                  <input type="text" name="nameStore" value={editedUser?.nameStore || ''} onChange={handleInputChange} className="usersetting-input" />
                </div>
              )}
              <button className="usersetting-save-button" onClick={handleSaveChanges}>
                <FontAwesomeIcon icon={faSave} className="usersetting-button-icon" /> บันทึกการเปลี่ยนแปลง
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSettings;
