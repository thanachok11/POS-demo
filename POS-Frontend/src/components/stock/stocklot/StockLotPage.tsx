import React, { useEffect, useState } from "react";
import {
  getStockLots,
  getStockLotsByBarcode,
  updateExpiryDate,
  deactivateStockLot,
} from "../../../api/stock/stockLotApi";
import "../../../styles/stock/StockLotPage.css";

const StockLotPage: React.FC = () => {
  const [barcode, setBarcode] = useState("");
  const [lots, setLots] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token") || "";

  const [showExpiryModal, setShowExpiryModal] = useState<any>(null);
  const [showQCModal, setShowQCModal] = useState<any>(null);

  // โหลดล็อตทั้งหมดตอนเปิดหน้า
  useEffect(() => {
    fetchAllLots();
  }, []);

  const fetchAllLots = async () => {
    setLoading(true);
    const result = await getStockLots(token);
    setLoading(false);
    if (result.success) setLots(result.data);
  };

  const handleSearch = async () => {
    if (!barcode.trim()) return fetchAllLots();
    setLoading(true);
    const result = await getStockLotsByBarcode(barcode, token);
    setLoading(false);
    if (result.success) setLots(result.lots);
  };

  const handleUpdateExpiry = async (lotId: string, expiryDate: string) => {
    const res = await updateExpiryDate(lotId, expiryDate, token);
    if (res.success) {
      alert("✅ อัปเดตวันหมดอายุสำเร็จ");
      fetchAllLots();
    }
  };

  const handleDeactivate = async (lotId: string) => {
    if (!window.confirm("❗ ต้องการปิดล็อตนี้หรือไม่?")) return;
    const res = await deactivateStockLot(lotId, token);
    if (res.success) {
      alert("🗃️ ปิดล็อตสำเร็จ");
      fetchAllLots();
    }
  };

  return (
    <div className="display">

      <div className="stocklot-page">
        <h2>📦 จัดการล็อตสินค้า</h2>

        {/* 🔍 Search */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="กรอกหรือยิง Barcode..."
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button onClick={handleSearch} disabled={loading}>
            {loading ? "กำลังค้นหา..." : "ค้นหา"}
          </button>
        </div>

        {/* 📋 ตารางล็อต */}
        <table className="lot-table">
          <thead>
            <tr>
              <th>สินค้า</th>
              <th>Batch</th>
              <th>วันหมดอายุ</th>
              <th>จำนวน</th>
              <th>Supplier</th>
              <th>คลังสินค้า</th>
              <th>สถานะ</th>
              <th>QC</th>
              <th>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {lots.map((lot) => (
              <tr key={lot._id}>
                <td>{lot.productId?.name || "-"}</td>
                <td>{lot.batchNumber}</td>
                <td>
                  {lot.expiryDate
                    ? new Date(lot.expiryDate).toLocaleDateString("th-TH")
                    : "-"}
                </td>
                <td>{lot.quantity}</td>
                <td>{lot.supplierName || lot.supplierId?.name || "-"}</td>
                <td>{lot.location?.name || "-"}</td>
                <td>{lot.status}</td>
                <td>{lot.qcStatus}</td>
                <td>
                  <button
                    className="btn-edit"
                    onClick={() => setShowExpiryModal(lot)}
                  >
                    🗓️ วันหมดอายุ
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDeactivate(lot._id)}
                  >
                    🚫 ปิดล็อต
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 🗓️ Modal วันหมดอายุ */}
        {showExpiryModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>อัปเดตวันหมดอายุ</h3>
              <input
                type="date"
                defaultValue={
                  showExpiryModal.expiryDate
                    ? new Date(showExpiryModal.expiryDate)
                      .toISOString()
                      .split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  (showExpiryModal.expiryDate = e.target.value)
                }
              />
              <div className="modal-actions">
                <button
                  onClick={() =>
                    handleUpdateExpiry(
                      showExpiryModal._id,
                      showExpiryModal.expiryDate
                    )
                  }
                >
                  บันทึก
                </button>
                <button onClick={() => setShowExpiryModal(null)}>ยกเลิก</button>
              </div>
            </div>
          </div>
        )}

        {/* 🧪 Modal QC */}
        {showQCModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>อัปเดตสถานะ QC</h3>
              <select
                defaultValue={showQCModal.qcStatus}
                onChange={(e) =>
                  (showQCModal.qcStatus = e.target.value)
                }
              >
                <option value="ผ่าน">ผ่าน</option>
                <option value="ไม่ผ่าน">ไม่ผ่าน</option>
                <option value="รอตรวจสอบ">รอตรวจสอบ</option>
              </select>
              <textarea
                placeholder="หมายเหตุ (ถ้ามี)"
                defaultValue={showQCModal.notes}
                onChange={(e) => (showQCModal.notes = e.target.value)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockLotPage;
