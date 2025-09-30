import React, { useEffect, useState } from "react";
import "../../styles/layout/GlobalPopup.css";

interface GlobalPopupProps {
    message: string;
    isSuccess: boolean;
    show: boolean;
    setShow: (val: boolean) => void;
    duration?: number;
    onClose?: () => void;   // ✅ callback เวลา popup ปิด
}


const GlobalPopup: React.FC<GlobalPopupProps> = ({
    message,
    isSuccess,
    show,
    setShow,
    duration = 3000,
    onClose,
}) => {
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        if (show) {
            setProgress(100);
            const step = 100 / (duration / 50);
            const interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev <= 0) {
                        clearInterval(interval);
                        setShow(false);

                        // ✅ ถ้า success → ปิด modal
                        if (isSuccess && onClose) {
                            onClose();
                        }
                        return 0;
                    }
                    return prev - step;
                });
            }, 50);

            return () => clearInterval(interval);
        }
    }, [show, duration, setShow, isSuccess, onClose]);

    if (!show) return null;

    return (
        <div className={`employee-popup ${isSuccess ? "success" : "error"}`}>
            <div className="employee-popup-con">
                <span>{message}</span>
                <button
                    onClick={() => setShow(false)}
                    className="employee-popup-close-btn"
                >
                    ✖
                </button>
            </div>
            <div className="progress-bar">
                <div
                    className="progress-fill"
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
