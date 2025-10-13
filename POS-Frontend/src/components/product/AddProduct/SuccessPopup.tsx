import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";

const SuccessPopup = ({ onClose }: { onClose: () => void }) => (
    <div className="product-popup">
        <div className="product-popup-content">
            <FontAwesomeIcon icon={faCheckCircle} className="product-icon" />
            <h3 className="product-popup-title">เพิ่มสินค้าใหม่สำเร็จ!!</h3>
            <button onClick={onClose} className="popup-close-btn">ปิด</button>
        </div>
    </div>
);

export default SuccessPopup;
