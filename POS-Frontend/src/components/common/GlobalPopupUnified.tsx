import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCheckCircle,
    faExclamationCircle,
    faQuestionCircle,
} from "@fortawesome/free-solid-svg-icons";
import "../../styles/common/GlobalPopupUnified.css";

interface GlobalPopupProps {
    type: "success" | "error" | "confirm";
    message: string;
    onClose: () => void;
    onConfirm?: () => void;
    autoClose?: boolean;
    duration?: number;
}

const GlobalPopupUnified: React.FC<GlobalPopupProps> = ({
    type,
    message,
    onClose,
    onConfirm,
    autoClose = false,
    duration = 2000,
}) => {
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        if (!autoClose) return;
        const step = 100 / (duration / 50);
        const timer = setInterval(() => {
            setProgress((p) => {
                if (p <= 0) {
                    clearInterval(timer);
                    onClose();
                    return 0;
                }
                return p - step;
            });
        }, 50);
        return () => clearInterval(timer);
    }, [autoClose, duration, onClose]);

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
                    <>
                        <button className="btn-close" onClick={onClose}>
                            ปิด
                        </button>
                        <div className="global-popup-progress">
                            <div
                                className="global-popup-progress-fill"
                                style={{
                                    width: `${progress}%`,
                                    backgroundColor: type === "success" ? "#22c55e" : "#ef4444",
                                }}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default GlobalPopupUnified;
