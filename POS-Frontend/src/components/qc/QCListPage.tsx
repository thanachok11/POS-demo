import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllPurchaseOrders } from "../../api/purchaseOrder/purchaseOrderApi";
import Pagination from "../stock/component/Pagination";
import "../../styles/qc/QCListPage.css";

const QCListPage: React.FC = () => {
    const navigate = useNavigate();
    const [qcOrders, setQcOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        const fetchQCOrders = async () => {
            try {
                const token = localStorage.getItem("token") || "";
                const res = await getAllPurchaseOrders(token);
                if (res.success && Array.isArray(res.data)) {
                    setQcOrders(res.data);
                } else {
                    setError(res.message || "ไม่สามารถโหลดข้อมูล QC ได้");
                }
            } catch {
                setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
            } finally {
                setLoading(false);
            }
        };
        fetchQCOrders();
    }, []);

    const formatThaiDateTime = (dateString: string) =>
        new Date(dateString)
            .toLocaleString("th-TH", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
                timeZone: "Asia/Bangkok",
            })
            .replace("น.", "")
            .trim() + " น.";

    const filteredQC = qcOrders.filter(
        (q) =>
            q.purchaseOrderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.supplierCompany?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.qcStatus?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedQC = filteredQC.slice(startIndex, startIndex + itemsPerPage);
    const totalPages = Math.ceil(filteredQC.length / itemsPerPage);

    return (
        <div className="display">
            <div className="stock-container">
                <div className="qclist-header-wrapper">
                    <h1 className="receipt-header">🧪 รายการตรวจสอบคุณภาพสินค้า (QC)</h1>

                    {loading && <p className="qclist-loading">⏳ กำลังโหลดข้อมูล...</p>}
                    {error && <p className="qclist-error">{error}</p>}

                    <div className="qclist-controls">
                        <div className="qclist-search">
                            <input
                                type="text"
                                placeholder="🔍 ค้นหาเลขที่ PO / ผู้จัดส่ง / สถานะ QC..."
                                className="qclist-search-input"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                        <div className="qclist-page-size">
                            <label>แสดง:</label>
                            <select
                                value={itemsPerPage}
                                onChange={(e) => {
                                    setItemsPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={30}>30</option>
                            </select>
                            <span> รายการต่อหน้า</span>
                        </div>
                    </div>
                </div>

                {!loading && !error && (
                    <div className="qclist-table-wrapper">
                        <table className="qclist-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>เลขที่ PO</th>
                                    <th>ผู้จัดส่ง</th>
                                    <th>วันที่สร้าง</th>
                                    <th>สถานะ QC</th>
                                    <th>จัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedQC.length > 0 ? (
                                    paginatedQC.map((q, index) => (
                                        <tr key={q._id} className="qclist-row">
                                            <td>{startIndex + index + 1}</td>
                                            <td>{q.purchaseOrderNumber}</td>
                                            <td>{q.supplierCompany}</td>
                                            <td>{formatThaiDateTime(q.createdAt)}</td>
                                            <td
                                                className={`qclist-status ${q.qcStatus === "ผ่าน"
                                                    ? "passed"
                                                    : q.qcStatus === "ไม่ผ่าน"
                                                        ? "failed"
                                                        : "pending"
                                                    }`}
                                            >
                                                {q.qcStatus || "รอตรวจ"}
                                            </td>
                                            <td>
                                                <button
                                                    className="qclist-btn-view"
                                                    onClick={() => navigate(`/qc/${q._id}`)}
                                                >
                                                    🔍 ตรวจสอบ
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="qclist-empty">
                                            😕 ไม่พบข้อมูล QC
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    setCurrentPage={setCurrentPage}
                />
            </div>
        </div>
    );
};

export default QCListPage;
