import React, { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { DecodeHintType, BarcodeFormat } from "@zxing/library";

const ZxingScanner = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const controlsRef = useRef<any>(null);
    const [result, setResult] = useState("📡 กำลังสแกน...");
    const [lastScan, setLastScan] = useState("");
    const [scanTime, setScanTime] = useState<number | null>(null);

    useEffect(() => {
        const hints = new Map();
        hints.set(DecodeHintType.POSSIBLE_FORMATS, [
            BarcodeFormat.QR_CODE,
            BarcodeFormat.CODE_128,
            BarcodeFormat.EAN_13,
        ]);

        const codeReader = new BrowserMultiFormatReader(hints, {
            delayBetweenScanAttempts: 150, // ปรับให้สมดุลระหว่างเร็วและเสถียร
        });

        console.log("🎥 เริ่มเปิดกล้อง...");

        codeReader.decodeFromVideoDevice(undefined, videoRef.current!, (res, err, controls) => {
            if (res) {
                const text = res.getText();
                if (text !== lastScan) {
                    console.log("✅ อ่านได้:", text);
                    setResult(`✅ พบข้อมูล: ${text}`);
                    setLastScan(text);
                    setScanTime(Date.now());
                }
            }

            if (err && !(err.name === "NotFoundException")) {
                console.warn("⚠️ ข้อผิดพลาด:", err.message);
            }

            if (!controlsRef.current && controls) {
                controlsRef.current = controls;
            }
        });

        return () => {
            if (controlsRef.current) {
                controlsRef.current.stop();
                controlsRef.current = null;
                console.log("🛑 ปิดกล้อง");
            }
        };
    }, [lastScan]);

    // Reset result หลังผ่านไป 5 วิ
    useEffect(() => {
        if (scanTime) {
            const timeout = setTimeout(() => {
                setResult("📡 กำลังสแกน...");
            }, 5000);
            return () => clearTimeout(timeout);
        }
    }, [scanTime]);

    return (
        <div style={{ maxWidth: 600, margin: "0 auto", padding: 20 }}>
            <h1 style={{ textAlign: "center" }}>📷 ZXing Barcode Scanner</h1>

            <div style={{ position: "relative" }}>
                <video
                    ref={videoRef}
                    style={{
                        width: "100%",
                        border: "4px solid #333",
                        borderRadius: "10px",
                    }}
                />
                {/* กล่องแนะนำตำแหน่ง */}
                <div
                    style={{
                        position: "absolute",
                        top: "30%",
                        left: "20%",
                        width: "60%",
                        height: "40%",
                        border: "2px dashed limegreen",
                        borderRadius: "8px",
                        pointerEvents: "none",
                    }}
                ></div>
            </div>

            <p
                style={{
                    marginTop: "1rem",
                    fontSize: "1.2rem",
                    textAlign: "center",
                    color: result.startsWith("✅") ? "green" : "#666",
                }}
            >
                {result}
            </p>
        </div>
    );
};

export default ZxingScanner;
