import React, { useState, useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

interface BarcodeOptions {
    format: string;
    width: number;
    height: number;
    displayValue: boolean;
}

interface BarcodeSettingsModalProps {
    options: BarcodeOptions;
    onOptionsChange: (options: BarcodeOptions) => void;
    onClose: () => void;
}

const BarcodeSettingsModal: React.FC<BarcodeSettingsModalProps> = ({
    options,
    onOptionsChange,
    onClose,
}) => {
    const [localOptions, setLocalOptions] = useState({
        ...options,
        lineColor: "#0f172a",
        background: "#ffffff",
        fontSize: 14,
    });

    const previewRef = useRef<SVGSVGElement | null>(null);

    // อัปเดต Preview ทุกครั้งที่เปลี่ยนค่า
    useEffect(() => {
        if (previewRef.current) {
            JsBarcode(previewRef.current, "123456789012", {
                ...localOptions,
                text: "123456789012",
                fontSize: localOptions.fontSize,
                lineColor: localOptions.lineColor,
                background: localOptions.background,
            });
        }
    }, [localOptions]);

    const handleChange = (key: string, value: any) => {
        setLocalOptions((prev) => ({ ...prev, [key]: value }));
    };

    const handleSave = () => {
        onOptionsChange(localOptions);
        onClose();
    };

    return (
        <div className="barcode-settings-overlay">
            <div className="barcode-settings-box">
                <h3>⚙ ตั้งค่าบาร์โค้ด</h3>

                {/* Live Preview */}
                <div className="barcode-settings-preview">
                    <svg ref={previewRef}></svg>
                </div>

                {/* Form */}
                <div className="barcode-settings-form">
                    {/* Format */}
                    <label>
                        Format:
                        <select
                            value={localOptions.format}
                            onChange={(e) => handleChange("format", e.target.value)}
                        >
                            <option value="CODE128">CODE128</option>
                            <option value="EAN13">EAN13</option>
                            <option value="UPC">UPC</option>
                            <option value="CODE39">CODE39</option>
                            <option value="ITF14">ITF14</option>
                            <option value="MSI">MSI</option>
                        </select>
                    </label>

                    {/* Width */}
                    <label>
                        ความหนาเส้น (Width):
                        <input
                            type="number"
                            value={localOptions.width}
                            onChange={(e) => handleChange("width", Number(e.target.value))}
                        />
                    </label>

                    {/* Height */}
                    <label>
                        ความสูง (Height):
                        <input
                            type="number"
                            value={localOptions.height}
                            onChange={(e) => handleChange("height", Number(e.target.value))}
                        />
                    </label>

                    {/* Font size */}
                    <label>
                        Font Size:
                        <input
                            type="number"
                            value={localOptions.fontSize}
                            onChange={(e) => handleChange("fontSize", Number(e.target.value))}
                        />
                    </label>

                    {/* Line color */}
                    <label>
                        สีเส้น:
                        <input
                            type="color"
                            value={localOptions.lineColor}
                            onChange={(e) => handleChange("lineColor", e.target.value)}
                        />
                    </label>

                    {/* Background */}
                    <label>
                        พื้นหลัง:
                        <input
                            type="color"
                            value={localOptions.background}
                            onChange={(e) => handleChange("background", e.target.value)}
                        />
                    </label>

                    {/* Display Value */}
                    {/* Display Value */}
                    <label className="checkbox-label">แสดงตัวเลขใต้บาร์โค้ด
                        <input
                            type="checkbox"
                            checked={localOptions.displayValue}
                            onChange={(e) => handleChange("displayValue", e.target.checked)}
                        />

                    </label>

                </div>

                {/* Actions */}
                <div className="barcode-settings-actions">
                    <button className="barcode-btn" onClick={onClose}>
                        ❌ ยกเลิก
                    </button>
                    <button className="barcode-btn primary" onClick={handleSave}>
                        💾 บันทึก
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BarcodeSettingsModal;
