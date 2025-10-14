import React, { useState } from "react";
import { confirmPurchaseOrder, cancelPurchaseOrder, returnPurchaseOrder } from "../../api/purchaseOrder/purchaseOrderApi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVial, faPrint } from "@fortawesome/free-solid-svg-icons";
import PurchaseOrderPrintModal from "./PurchaseOrderPrintModal"; // ✅ เพิ่ม import

interface Props {
    po: any;
    navigate: any;
    setPopup: (popup: any) => void;
    onActionComplete: () => void;
}

const PurchaseOrderActions: React.FC<Props> = ({ po, navigate, setPopup, onActionComplete }) => {
    const [loading, setLoading] = useState(false);
    const [showPrintModal, setShowPrintModal] = useState(false); // ✅ state modal

    const openConfirmPopup = (message: string, onConfirm: () => void) => {
        setPopup({ type: "confirm", message, onConfirm });
    };

    const canPrint =
        po.status === "รอดำเนินการ" ||
        po.status === "รอตรวจสอบ QC" ||
        po.status === "รอตรวจรับสินค้า" ||
        (po.status === "ได้รับสินค้าแล้ว" && po.qcStatus === "ผ่าน");

    const handleConfirm = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token") || "";
            const res = await confirmPurchaseOrder(po._id, token);
            if (res.success) {
                setPopup({
                    type: "success",
                    message: "✅ ยืนยันรับสินค้าเรียบร้อยแล้ว",
                    onConfirm: () => navigate(`/qc/${po._id}`),
                });
                onActionComplete();
            }
        } finally {
            setLoading(false);
        }
    };

    const handleReturn = async () => {
        const token = localStorage.getItem("token") || "";
        const res = await returnPurchaseOrder(po._id, token);
        setPopup({ type: res.success ? "success" : "error", message: res.message });
        onActionComplete();
    };

    const handleCancel = async () => {
        const token = localStorage.getItem("token") || "";
        const res = await cancelPurchaseOrder(po._id, token);
        setPopup({ type: res.success ? "success" : "error", message: res.message });
        onActionComplete();
    };

    const allItemsChecked = po.items.every(
        (item: any) => item.qcStatus === "ผ่าน" || item.qcStatus === "ไม่ผ่าน"
    );

    return (
        <div className="po-actions">
            {po.status === "รอดำเนินการ" && (
                <>
                    <button className="po-confirm-button" onClick={handleConfirm} disabled={loading}>
                        ยืนยันรับสินค้า
                    </button>
                    <button className="po-cancel-button" onClick={() => openConfirmPopup("ยกเลิกใบสั่งซื้อนี้หรือไม่?", handleCancel)}>
                        ยกเลิก
                    </button>
                </>
            )}

            {["ได้รับสินค้าแล้ว", "QC ผ่านบางส่วน", "ตรวจบางส่วน"].includes(po.status) && !allItemsChecked && (
                <button className="qc-go-button" onClick={() => navigate(`/qc/${po._id}`)}>
                    <FontAwesomeIcon icon={faVial} />{" "}
                    {po.status === "QC ผ่านบางส่วน" || po.status === "ตรวจบางส่วน"
                        ? "ดำเนินการตรวจ QC ต่อ"
                        : "ไปตรวจ QC"}
                </button>
            )}

            {po.status === "ไม่ผ่าน QC - รอส่งคืนสินค้า" && (
                <button className="po-return-button" onClick={() => openConfirmPopup("คืนสินค้า PO นี้หรือไม่?", handleReturn)}>
                    ↩️ คืนสินค้า
                </button>
            )}

            {canPrint && (
                <button className="btn-print" onClick={() => setShowPrintModal(true)}>
                    <FontAwesomeIcon icon={faPrint} /> พิมพ์ใบสั่งซื้อ
                </button>
            )}

            {/* ✅ Modal พิมพ์ใบสั่งซื้อ */}
            {showPrintModal && (
                <PurchaseOrderPrintModal po={po} onClose={() => setShowPrintModal(false)} />
            )}
        </div>
    );
};

export default PurchaseOrderActions;
