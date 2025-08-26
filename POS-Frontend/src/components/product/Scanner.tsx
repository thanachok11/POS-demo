// Scanner.tsx
import React, { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

const Scanner: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [result, setResult] = useState<string>("");

    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        const codeReader = new BrowserMultiFormatReader();

        const startScanner = async () => {
            try {
                const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

                const constraints: MediaStreamConstraints = {
                    video: isMobile
                        ? { facingMode: { exact: "environment" } } // กล้องหลังบนมือถือ
                        : true, // บน desktop ใช้กล้องใดก็ได้
                };

                const stream = await navigator.mediaDevices.getUserMedia(constraints);
                streamRef.current = stream;

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.setAttribute("playsinline", "true"); // สำคัญมากบน iOS
                    await videoRef.current.play();
                }

                const scan = async () => {
                    if (!videoRef.current) return;

                    try {
                        const result = await codeReader.decodeOnceFromVideoElement(videoRef.current);
                        setResult(result.getText());
                    } catch {
                        // ไม่ต้องแจ้ง error ถ้าไม่พบ code ใน frame
                    }
                };

                const intervalId = setInterval(scan, 1000); // สแกนทุก 1 วินาที

                // cleanup function
                return () => {
                    clearInterval(intervalId);
                    if (streamRef.current) {
                        streamRef.current.getTracks().forEach((track) => track.stop());
                    }
                };
            } catch (err) {
                console.error("เกิดข้อผิดพลาดในการเข้าถึงกล้อง:", err);
                alert("เกิดข้อผิดพลาดในการเข้าถึงกล้อง");
            }
        };

        const cleanupPromise = startScanner();

        return () => {
            cleanupPromise.then((cleanup) => {
                if (typeof cleanup === "function") cleanup();
            });
        };
    }, []);

    return (
        <div style={{ textAlign: "center", padding: 20 }}>
            <h2>📷 สแกนด้วยกล้องหลัง</h2>
            <video
                ref={videoRef}
                style={{
                    width: "100%",
                    maxWidth: 400,
                    borderRadius: 8,
                    backgroundColor: "#000",
                }}
                muted
                playsInline
            />
            <p>📦 ผลลัพธ์ที่สแกนได้:</p>
            <textarea
                readOnly
                value={result}
                rows={4}
                style={{
                    width: "100%",
                    maxWidth: 400,
                    borderRadius: 8,
                    fontSize: 16,
                    marginTop: 10,
                }}
            />
        </div>
    );
};

export default Scanner;
