// src/components/common/PurchaseOrderPopup.tsx
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCheckCircle,
    faExclamationCircle,
    faQuestionCircle,
} from "@fortawesome/free-solid-svg-icons";
import "../../styles/common/GlobalPopupEdit.css";

interface PopupProps {
    type: "success" | "error" | "confirm";
    message: string;
    onClose: () => void;
    onConfirm?: () => void;
}

const PurchaseOrderPopup: React.FC<PopupProps> = ({ type, message, onClose, onConfirm }) => {
    return (
        <div className={`global-popup-overlay ${type}`}>
            <div className="global-popup-box">
                <FontAwesomeIcon
                    icon={
                        type === "success"
                            ? faCheckCircle
                            : type === "error"
                                ? faExclamationCircle
                                : faQuestionCircle
                    }
                    className={`global-popup-icon ${type}`}
                />
                <p className="global-popup-message">{message}</p>

                {type === "confirm" ? (
                    <div className="global-popup-actions">
                        <button className="btn-confirm" onClick={onConfirm}>
                            ยืนยัน
                        </button>
                        <button className="btn-cancel" onClick={onClose}>
                            ยกเลิก
                        </button>
                    </div>
                ) : (
                    <button className="btn-close" onClick={onClose}>
                        ปิด
                    </button>
                )}
            </div>
        </div>
    );
};

export default PurchaseOrderPopup;
