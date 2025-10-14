import React, { useEffect, useState } from "react";
import "../../styles/layout/GlobalPopup.css";

interface GlobalPopupProps {
    message: string;
    isSuccess: boolean;
    show: boolean;
    setShow: (val: boolean) => void;
    duration?: number;
    onClose?: () => void; // callback เวลา popup ปิด
}

const GlobalPopup: React.FC<GlobalPopupProps> = ({
    message,
    isSuccess,
    show,
    setShow,
    duration = 1500,
    onClose,
}) => {
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        if (!show) return;

        setProgress(100);
        const step = 100 / (duration / 50);
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev <= 0) {
                    clearInterval(interval);
                    setShow(false);
                    if (onClose) onClose();
                    return 0;
                }
                return prev - step;
            });
        }, 50);

        return () => clearInterval(interval);
    }, [show, duration, setShow, onClose]);

    if (!show) return null;

    return (
        <div className={`global-popup ${isSuccess ? "success" : "error"}`}>
            <div className="global-popup-content">
                <div className="global-popup-message">
                    {isSuccess ? (
                        <span>{message}</span>
                    ) : (
                        <span>{message || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง"}</span>
                    )}
                </div>

                <button
                    onClick={() => {
                        setShow(false);
                        if (onClose) onClose();
                    }}
                    className="global-popup-close-btn"
                    aria-label="Close"
                >
                    ✖
                </button>
            </div>

            <div className="global-popup-progress">
                <div
                    className="global-popup-progress-fill"
                    style={{
                        width: `${progress}%`,
                        backgroundColor: isSuccess ? "#22c55e" : "#ef4444",
                    }}
                ></div>
            </div>
        </div>
    );
};

export default GlobalPopup;
