import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVial } from "@fortawesome/free-solid-svg-icons";
import PurchaseOrderItemsTable from "./PurchaseOrderItemsTable";
import PurchaseOrderActions from "./PurchaseOrderActions";
import PurchaseOrderStatusBadge from "./PurchaseOrderStatusBadge";
import { useNavigate } from "react-router-dom";

interface PurchaseOrderCardProps {
    po: any;
    onActionComplete: () => void;
    setPopup: (popup: any) => void;
}

const PurchaseOrderCard: React.FC<PurchaseOrderCardProps> = ({ po, onActionComplete, setPopup }) => {
    const navigate = useNavigate();

    const formatThaiDateTime = (dateString: string) =>
        new Date(dateString).toLocaleString("th-TH", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
            timeZone: "Asia/Bangkok",
        }) + " น.";

    const grandTotal = po.items.reduce((sum: number, i: any) => sum + i.costPrice * i.quantity, 0);

    return (
        <div className="po-card">
            {/* Header */}
            <div className="po-card-header">
                <div>
                    <h2 className="po-number">{po.purchaseOrderNumber}</h2>
                    <p className="po-date">📅 {formatThaiDateTime(po.orderDate)}</p>
                </div>
                <PurchaseOrderStatusBadge status={po.status} />
            </div>

            {/* Info */}
            <div className="po-info">
                <p><strong>ผู้จัดส่ง:</strong> {po.supplierCompany}</p>
                <p><strong>คลังสินค้า:</strong>{" "}
                    {typeof po.location === "object"
                        ? po.location.name || po.location.code || "-"
                        : po.location}
                </p>
                <p>
                    <strong>สถานะ QC:</strong>{" "}
                    <span
                        className={`qc-status-badge ${po.qcStatus === "ผ่าน"
                                ? "qc-pass"
                                : po.qcStatus === "ไม่ผ่าน"
                                    ? "qc-fail"
                                    : po.qcStatus === "ผ่านบางส่วน" || po.qcStatus === "ตรวจบางส่วน"
                                        ? "qc-partial"
                                        : "qc-pending"
                            }`}
                    >
                        {po.qcStatus || "รอตรวจ"}
                    </span>
                </p>

            </div>

            <PurchaseOrderItemsTable items={po.items} qcStatus={po.qcStatus} />
            <div className="po-total">💰 รวมทั้งหมด: {grandTotal.toLocaleString()} ฿</div>

            <PurchaseOrderActions po={po} navigate={navigate} onActionComplete={onActionComplete} setPopup={setPopup} />
        </div>
    );
};

export default PurchaseOrderCard;
