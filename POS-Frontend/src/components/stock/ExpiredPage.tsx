import React, { useState, useEffect } from "react";
import { getStockData } from "../../api/stock/stock";
import "../../styles/stock/ExpiredPage.css";

interface StockItem {
    _id: string;
    barcode: string;
    totalQuantity: number;
    threshold:number;
    status: string;
    updatedAt: string;
    productId: {
        _id: string;
        name: string;
        imageUrl?: string;
        category?: { _id: string; name: string };
    };
    supplierId?: { _id: string; companyName: string };
    location?: { _id: string; name: string; location: string; description?: string };
    expiryDate?: string;
    isActive?: boolean;
}

const ExpiredPage: React.FC = () => {
    const [stockData, setStockData] = useState<StockItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>("");

    // pagination
    const [itemsPerPage, setItemsPerPage] = useState<number>(10);
    const [currentPage, setCurrentPage] = useState<number>(1);

    const fetchData = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setError("❌ No token found");
            setLoading(false);
            return;
        }
        try {
            const stock = await getStockData(token);
            setStockData(stock);
        } catch (err) {
            console.error("❌ Fetch data error:", err);
            setError("ไม่สามารถโหลดข้อมูลสินค้าได้");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // ✅ filter เฉพาะสินค้าที่เหลือน้อย / หมดอายุ / ใกล้หมดอายุ
    const now = new Date();
    const expiryThreshold = new Date();
    expiryThreshold.setDate(now.getDate() + 30);

    // ✅ ส่วน filter
    const filteredStock = stockData.filter((item) => {
        const exp = item.expiryDate ? new Date(item.expiryDate) : null;
        const isLow = item.totalQuantity < (item.threshold || 5); // ✅ ใช้ได้
        const isExpired = exp !== null && exp < now;
        const isNear = exp !== null && exp >= now && exp <= expiryThreshold;

        const matchesFilter = isLow || isExpired || isNear;

        const searchText = searchQuery.toLowerCase();
        const productName = item.productId?.name?.toLowerCase() || "";
        const supplierName = item.supplierId?.companyName?.toLowerCase() || "";
        const barcode = item.barcode?.toLowerCase() || "";

        const matchesSearch =
            productName.includes(searchText) ||
            supplierName.includes(searchText) ||
            barcode.includes(searchText);

        return matchesFilter && matchesSearch;
    });


    // ✅ pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedStock = filteredStock.slice(startIndex, startIndex + itemsPerPage);
    const totalPages = Math.ceil(filteredStock.length / itemsPerPage);

    // ✅ helper format date
    const formatThaiDate = (d?: string) =>
        d
            ? new Date(d).toLocaleDateString("th-TH", {
                year: "numeric",
                month: "short",
                day: "numeric",
            })
            : "-";

    return (
        <div className="display">
            <div className="expired-container">
                <div className="expired-header-wrapper">
                    <h2 className="expired-header">⚠️ รายการสินค้าเหลือน้อย / ใกล้หมดอายุ</h2>
                    {loading && <p className="expired-loading">⏳ Loading...</p>}
                    {error && <p className="expired-error">{error}</p>}

                    <div className="expired-controls">
                        <div className="expired-search-container">
                            <input
                                type="text"
                                placeholder="🔍 ค้นหาสินค้า..."
                                className="expired-search-input"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>

                        <div className="expired-items-per-page">
                            <label>แสดง: </label>
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

                {/* ✅ Table Custom */}
                <div className="expired-table-wrapper">
                    <table className="expired-table">
                        <thead>
                            <tr>
                                <th>รูป</th>
                                <th>บาร์โค้ด</th>
                                <th>สินค้า</th>
                                <th>ซัพพลายเออร์</th>
                                <th>จำนวน</th>
                                <th>วันหมดอายุ</th>
                                <th>สถานะ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedStock.map((item) => {
                                const exp = item.expiryDate ? new Date(item.expiryDate) : null;
                                const isExpired = exp !== null && exp < now;
                                const isNear = exp !== null && exp >= now && exp <= expiryThreshold;
                                const isLow = item.totalQuantity < (item.threshold || 5); // ✅ ใช้ใน scope ของ map

                                let rowClass = "";
                                if (isExpired) rowClass = "expired-row";
                                else if (isNear) rowClass = "near-expired-row";
                                else if (isLow) rowClass = "low-stock-row";

                                return (
                                    <tr key={item._id} className={rowClass}>
                                        <td>
                                            {item.productId?.imageUrl ? (
                                                <img
                                                    src={item.productId.imageUrl}
                                                    alt={item.productId.name}
                                                    className="expired-img"
                                                />
                                            ) : (
                                                "-"
                                            )}
                                        </td>
                                        <td>{item.barcode}</td>
                                        <td>{item.productId?.name || "-"}</td>
                                        <td>{item.supplierId?.companyName || "-"}</td>
                                        <td>{item.totalQuantity}</td>
                                        <td>{formatThaiDate(item.expiryDate)}</td>
                                        <td>
                                            {isExpired
                                                ? "❌ หมดอายุ"
                                                : isNear
                                                    ? "⚠️ ใกล้หมดอายุ"
                                                    : isLow
                                                        ? "🔽 สินค้าเหลือน้อย"
                                                        : "✅ ปกติ"}
                                        </td>
                                    </tr>
                                );
                            })}
                            {paginatedStock.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: "center", padding: "20px" }}>
                                        ✅ ไม่มีสินค้าที่เหลือน้อยหรือใกล้หมดอายุ
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="expired-pagination">
                    <button
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        ◀ ก่อนหน้า
                    </button>
                    <span>
                        หน้า {currentPage} จาก {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                        disabled={currentPage === totalPages}
                    >
                        ถัดไป ▶
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExpiredPage;
