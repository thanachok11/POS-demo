import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPurchaseOrderById } from "../../api/purchaseOrder/purchaseOrderApi";
import {
    createQCRecord,
    getQCByBatch,
    updateQCRecord,
    updateQCStatus,
} from "../../api/purchaseOrder/qcApi";
import "../../styles/qc/QCInspectionPage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faCheck, faUpload } from "@fortawesome/free-solid-svg-icons";
import GlobalPopup from "../layout/GlobalPopup";

const QCInspectionPage: React.FC = () => {
    const { poId } = useParams<{ poId: string }>();
    const navigate = useNavigate();

    const [po, setPo] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [qcData, setQcData] = useState<Record<string, any>>({});
    const [files, setFiles] = useState<Record<string, File[]>>({});
    const [saving, setSaving] = useState(false);

    // ✅ popup กลาง
    const [showPopup, setShowPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState("");
    const [popupSuccess, setPopupSuccess] = useState(true);

    /* =========================================================
       โหลดข้อมูล PO + QC เดิม
    ========================================================= */
    useEffect(() => {
        const loadData = async () => {
            try {
                const token = localStorage.getItem("token") || "";
                const res = await getPurchaseOrderById(poId!, token);
                const poData = res.data;
                setPo(poData);

                const qcPromises = poData.items.map((item: any) =>
                    getQCByBatch(item.batchNumber, token).catch(() => null)
                );
                const qcResults = await Promise.all(qcPromises);

                const qcMap: Record<string, any> = {};
                qcResults.forEach((qcRes, i) => {
                    const batch = poData.items[i].batchNumber;
                    if (qcRes && qcRes.success && qcRes.data.length > 0) {
                        qcMap[batch] = qcRes.data[0];
                    }
                });
                setQcData(qcMap);
            } catch {
                setPopupMessage("❌ โหลดข้อมูล QC ไม่สำเร็จ");
                setPopupSuccess(false);
                setShowPopup(true);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [poId]);

    /* =========================================================
       ตรวจว่าทุกล็อตผ่าน QC หรือยัง
    ========================================================= */
    const allLotsPassed = po?.items?.every((item: any) => {
        const qc = qcData[item.batchNumber];
        return qc && qc.status === "ผ่าน";
    });

    const allQCChecked = po?.items?.every((item: any) => {
        const qc = qcData[item.batchNumber];
        return qc && qc.status && qc.status !== "รอตรวจ";
    });

    /* =========================================================
       บันทึกผล QC รายล็อต
    ========================================================= */
    const handleSubmitQC = async (item: any) => {
        const batchNumber = item.batchNumber;
        const current = qcData[batchNumber] || {};
        const token = localStorage.getItem("token") || "";
        if (!batchNumber) return;

        setSaving(true);
        try {
            let res;
            if (current._id) {
                res = await updateQCRecord(
                    current._id,
                    { status: current.status, remarks: current.remarks },
                    token
                );
            } else {
                const formData = new FormData();
                formData.append("batchNumber", batchNumber);
                formData.append("productId", item.productId?._id || item.productId || "");
                formData.append("supplierId", po.supplierId?._id || po.supplierId || "");
                formData.append("warehouseId", po.location?._id || po.location || "");
                formData.append("status", current.status || "รอตรวจ");
                formData.append("remarks", current.remarks || "");
                (files[batchNumber] || []).forEach((file) =>
                    formData.append("attachments", file)
                );
                res = await createQCRecord(formData, token);
            }

            if (res.success) {
                setPopupMessage(`✅ บันทึกผล QC สำหรับ ${item.productName} สำเร็จ`);
                setPopupSuccess(true);
                setShowPopup(true);

                const updated = await getQCByBatch(batchNumber, token);
                if (updated.success && updated.data.length > 0) {
                    setQcData((prev) => ({
                        ...prev,
                        [batchNumber]: updated.data[0],
                    }));
                }
            } else {
                setPopupMessage("❌ บันทึก QC ไม่สำเร็จ");
                setPopupSuccess(false);
                setShowPopup(true);
            }
        } catch {
            setPopupMessage("⚠️ เกิดข้อผิดพลาดระหว่างบันทึก QC");
            setPopupSuccess(false);
            setShowPopup(true);
        } finally {
            setSaving(false);
        }
    };

    /* =========================================================
       ✅ สรุป QC และเติมสต็อก
    ========================================================= */
    const handleSubmitFinalQC = async () => {
        const token = localStorage.getItem("token") || "";
        setSaving(true);
        try {
            const res = await updateQCStatus(poId!, { qcStatus: "ผ่าน" }, token);
            if (res.success) {
                setPopupMessage("✅ QC ครบแล้วและเติมสต็อกสำเร็จ!");
                setPopupSuccess(true);
                setShowPopup(true);
                setTimeout(() => navigate("/purchase-orders"), 1500);
            } else {
                setPopupMessage("❌ ไม่สามารถสรุป QC ได้");
                setPopupSuccess(false);
                setShowPopup(true);
            }
        } catch {
            setPopupMessage("⚠️ เกิดข้อผิดพลาดในการสรุป QC");
            setPopupSuccess(false);
            setShowPopup(true);
        } finally {
            setSaving(false);
        }
    };

    /* =========================================================
       ✅ Rendering
    ========================================================= */
    if (loading) return <p className="qc-loading">⏳ กำลังโหลดข้อมูล...</p>;
    if (!po) return <p className="qc-error">ไม่พบข้อมูลใบสั่งซื้อ</p>;

    return (
        <div className="qc-page">
            <div className="qc-header">
                <button className="qc-back-btn" onClick={() => navigate("/purchase-orders")}>
                    <FontAwesomeIcon icon={faArrowLeft} /> กลับ
                </button>
                <h1>🧪 ตรวจสอบคุณภาพสินค้า (QC)</h1>
                <p className="qc-subtitle">
                    ใบสั่งซื้อ: <strong>{po.purchaseOrderNumber}</strong> / ผู้จัดส่ง:{" "}
                    {po.supplierCompany}
                </p>
            </div>

            <table className="qc-table">
                <thead>
                    <tr>
                        <th>สินค้า</th>
                        <th>Batch</th>
                        <th>สถานะ QC</th>
                        <th>หมายเหตุ</th>
                        <th>แนบรูป</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {po.items.map((item: any, idx: number) => {
                        const batchNumber = item.batchNumber;
                        const qc = qcData[batchNumber] || {};

                        return (
                            <tr key={idx}>
                                <td>{item.productName}</td>
                                <td>{batchNumber}</td>
                                <td>
                                    <select
                                        value={qc.status || "รอตรวจ"}
                                        onChange={(e) =>
                                            setQcData({
                                                ...qcData,
                                                [batchNumber]: {
                                                    ...qc,
                                                    status: e.target.value,
                                                },
                                            })
                                        }
                                    >
                                        <option value="รอตรวจ">รอตรวจ</option>
                                        <option value="ผ่าน">ผ่าน</option>
                                        <option value="ไม่ผ่าน">ไม่ผ่าน</option>
                                    </select>
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        placeholder="หมายเหตุ..."
                                        value={qc.remarks || ""}
                                        onChange={(e) =>
                                            setQcData({
                                                ...qcData,
                                                [batchNumber]: {
                                                    ...qc,
                                                    remarks: e.target.value,
                                                },
                                            })
                                        }
                                    />
                                </td>
                                <td>
                                    <label className="qc-upload-label">
                                        <FontAwesomeIcon icon={faUpload} /> เลือกรูป
                                        <input
                                            type="file"
                                            multiple
                                            hidden
                                            onChange={(e) =>
                                                setFiles({
                                                    ...files,
                                                    [batchNumber]: Array.from(e.target.files || []),
                                                })
                                            }
                                        />
                                    </label>
                                    {files[batchNumber]?.length > 0 && (
                                        <p className="qc-file-count">
                                            📎 {files[batchNumber].length} ไฟล์
                                        </p>
                                    )}
                                </td>
                                <td>
                                    <button
                                        className="qc-save-btn"
                                        disabled={saving}
                                        onClick={() => handleSubmitQC(item)}
                                    >
                                        <FontAwesomeIcon icon={faCheck} /> บันทึก
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            <div className="qc-finalize-section">
                <button
                    className={`qc-submit-btn ${allLotsPassed ? "active" : "disabled"}`}
                    disabled={!allLotsPassed || saving}
                    onClick={handleSubmitFinalQC}
                >
                    <FontAwesomeIcon icon={faCheck} /> สรุป QC และเติมสต็อก
                </button>

                {!allLotsPassed && (
                    <p className="qc-hint">⚠️ ต้องตรวจและผ่าน QC ทุกล็อตก่อน</p>
                )}
            </div>

            <GlobalPopup
                message={popupMessage}
                isSuccess={popupSuccess}
                show={showPopup}
                setShow={setShowPopup}
            />
        </div>
    );
};

export default QCInspectionPage;
