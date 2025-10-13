import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons";

interface ErrorPopupProps {
    message?: string;
    onClose: () => void;
}

const ErrorPopup: React.FC<ErrorPopupProps> = ({ message, onClose }) => {
    return (
        <div className="product-popup-error">
            <div className="product-popup-content">
                <FontAwesomeIcon icon={faExclamationCircle} className="product-icon-error" />
                <h3 className="product-popup-title">
                    {message || "เกิดข้อผิดพลาดในการเพิ่มสินค้า"}
                </h3>
                <button onClick={onClose} className="popup-close-btn">
                    ปิด
                </button>
            </div>
        </div>
    );
};

export default ErrorPopup;
