import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import GlobalPopupUnified from "../common/GlobalPopupUnified";

interface PopupState {
    type: "success" | "error" | "confirm";
    message: string;
    onConfirm?: () => void;
    autoClose?: boolean;
    duration?: number;
    onClose?: () => void;
}

interface PopupContextProps {
    showPopup: (popup: PopupState) => void;
    closePopup: () => void;
}

const PopupContext = createContext<PopupContextProps | undefined>(undefined);

export const GlobalPopupProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [popup, setPopup] = useState<PopupState | null>(null);

    const showPopup = (popupData: PopupState) => setPopup(popupData);
    const closePopup = () => setPopup(null);

    return (
        <PopupContext.Provider value={{ showPopup, closePopup }}>
            {children}
            {popup && (
                <GlobalPopupUnified
                    type={popup.type}
                    message={popup.message}
                    onClose={() => {
                        closePopup();
                        popup.onClose?.();
                    }}
                    onConfirm={popup.onConfirm}
                    autoClose={popup.autoClose ?? popup.type !== "confirm"}
                    duration={popup.duration ?? 3000}
                />
            )}
        </PopupContext.Provider>
    );
};

export const useGlobalPopup = (): PopupContextProps => {
    const context = useContext(PopupContext);
    if (!context) throw new Error("useGlobalPopup must be used within GlobalPopupProvider");
    return context;
};
