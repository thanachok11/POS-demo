import React, { useEffect, useState } from "react";
import { getStockData } from "../../api/stock/stock";
import BarcodeCard from "./BarcodeCard";
import BarcodeModal from "./BarcodeModal";
import GlobalPopup from "../layout/GlobalPopup";
import "../../styles/barcode/BarcodeStockPage.css";

interface StockItem {
    _id: string;
    barcode: string;
    productId: {
        _id: string;
        name: string;
        category?: { name: string };
        price?: number;
    };
}

interface BarcodeOptions {
    format: string;
    width: number;
    height: number;
    displayValue: boolean;
}

const defaultOptions: BarcodeOptions = {
    format: "CODE128",
    width: 2,
    height: 60,
    displayValue: true,
};

const BarcodeStockPage: React.FC = () => {
    const [stock, setStock] = useState<StockItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
    const [barcodeOptions, setBarcodeOptions] = useState<BarcodeOptions>(defaultOptions);

    // popup state
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    // filter/search/pagination
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(8);

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("❌ No token found");
                setLoading(false);
                return;
            }
            try {
                const stock = await getStockData(token);
                setStock(stock);
            } catch (err) {
                console.error("โหลดข้อมูล stock ไม่ได้", err);
                setError("❌ ไม่สามารถโหลดข้อมูลสินค้าได้");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSave = () => {
        if (selectedItem) {
            localStorage.setItem(`barcodeOptions-${selectedItem._id}`, JSON.stringify(barcodeOptions));
            setMessage("✅ บันทึกการตั้งค่าแล้ว");
            setIsSuccess(true);
            setShowPopup(true);
        }
    };

    // กรองข้อมูล
    const filteredStock = stock.filter((item) => {
        const matchName = item.productId.name.toLowerCase().includes(search.toLowerCase());
        const matchCategory = category ? item.productId.category?.name === category : true;
        return matchName && matchCategory;
    });

    // Pagination
    const totalPages = Math.ceil(filteredStock.length / limit);
    const paginatedStock = filteredStock.slice((page - 1) * limit, page * limit);

    return (
        <div className="display">
            <div className="barcode-container">
                {/* Header */}
                <div className="barcode-header-wrapper">
                    <h2 className="barcode-header">🏷️ รายการบาร์โค้ดสินค้า</h2>

                    {loading && <p className="barcode-loading">⏳ กำลังโหลด...</p>}
                    {error && <p className="barcode-error">{error}</p>}

                    {/* Controls */}
                    <div className="barcode-controls">
                        <div className="search-container">
                            <input
                                type="text"
                                placeholder="🔍 ค้นหาสินค้า..."
                                className="search-input"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                            />
                        </div>

                        <div className="items-per-page">
                            <label>แสดง: </label>
                            <select
                                value={limit}
                                onChange={(e) => {
                                    setLimit(Number(e.target.value));
                                    setPage(1);
                                }}
                            >
                                <option value={8}>8</option>
                                <option value={12}>12</option>
                                <option value={20}>20</option>
                            </select>
                            <span> รายการต่อหน้า</span>
                        </div>
                    </div>
                </div>

                {/* Grid ของสินค้า */}
                <div className="barcode-grid">
                    {paginatedStock.length > 0 ? (
                        paginatedStock.map((item) => (
                            <BarcodeCard
                                key={item._id}
                                item={item}
                                options={defaultOptions}
                                onClick={(clickedItem) => {
                                    const saved = localStorage.getItem(`barcodeOptions-${clickedItem._id}`);
                                    setBarcodeOptions(saved ? JSON.parse(saved) : defaultOptions);
                                    setSelectedItem(clickedItem);
                                }}
                            />
                        ))
                    ) : (
                        <p className="barcode-no-data">❌ ไม่พบสินค้า</p>
                    )}
                </div>

                {/* Pagination */}
                <div className="pagination">
                    <button onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1}>
                        ◀ ก่อนหน้า
                    </button>
                    <span>
                        หน้า {page} จาก {totalPages}
                    </span>
                    <button onClick={() => setPage((p) => Math.min(p + 1, totalPages))} disabled={page === totalPages}>
                        ถัดไป ▶
                    </button>
                </div>
            </div>

            {/* Modal */}
            {selectedItem && (
                <div className="barcode-modal-overlay">
                    <div className="barcode-modal-container">
                        <button className="modal-close" onClick={() => setSelectedItem(null)}>
                            ✖
                        </button>
                        <BarcodeModal
                            item={selectedItem}
                            options={barcodeOptions}
                            onOptionsChange={setBarcodeOptions}
                            onClose={() => setSelectedItem(null)}
                            onSave={handleSave}
                        />
                    </div>
                </div>
            )}

            {/* Global Popup */}
            <GlobalPopup
                message={message}
                isSuccess={isSuccess}
                show={showPopup}
                setShow={setShowPopup}
                onClose={() => {
                    setSelectedItem(null);
                }}
            />
        </div>
    );
};

export default BarcodeStockPage;
