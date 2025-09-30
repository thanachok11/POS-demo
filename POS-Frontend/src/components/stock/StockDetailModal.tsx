import React, { useState, useEffect } from "react";
import "../../styles/stock/StockDetailModal.css";
import { updateProduct, updateProductImage } from "../../api/product/productApi";
import { updateStock, deleteStock } from "../../api/stock/stock";
import { getWarehouses } from "../../api/product/warehousesApi";
import { useNavigate } from "react-router-dom";
import GlobalPopup from "../layout/GlobalPopup"; // ✅ ใช้ popup กลาง

interface StockDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  barcode: string | null;
  stock: any;
  onSuccess: () => void;
}

const StockDetailModal: React.FC<StockDetailModalProps> = ({
  isOpen,
  onClose,
  barcode,
  stock,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<any>(stock?.productId || {});
  const [stockData, setStockData] = useState<any>(stock || {});
  const [activeTab, setActiveTab] = useState<"product" | "stock">("product");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const [warehouseName, setWarehouseName] = useState<string>("ไม่พบข้อมูล");
  const [warehouseId, setWarehouseId] = useState<string>("");

  // ✅ Popup state
  const [message, setMessage] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState<boolean>(true);
  const [showPopup, setShowPopup] = useState<boolean>(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (stock?.productId) setFormData(stock.productId);
    if (stock) setStockData(stock);

    const fetchWarehouse = async () => {
      try {
        const warehouses = await getWarehouses();

        if (stock?.location?._id) {
          const found = warehouses.find((w: any) => w._id === stock.location._id);
          if (found) {
            setWarehouseId(found._id);
            setWarehouseName(found.location);
          }
        } else if (stock?.location?.location) {
          setWarehouseId(stock.location._id);
          setWarehouseName(stock.location.location);
        }
      } catch (err) {
        console.error("❌ Error fetching warehouses:", err);
      }
    };
    fetchWarehouse();
  }, [stock]);

  if (!isOpen || !stock) return null;

  const handleProductChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleStockChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setStockData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setLoading(true);

      const updatedStockData = { ...stockData, location: warehouseId };

      await updateProduct(stock.productId._id, formData);
      if (stock?.barcode) {
        await updateStock(stock.barcode, updatedStockData);
      }
      if (image) {
        const formDataUpload = new FormData();
        formDataUpload.append("image", image);
        await updateProductImage(formDataUpload, token);
      }

      setMessage("บันทึกการแก้ไขสำเร็จ ✅");
      setIsSuccess(true);
      setShowPopup(true);
      onSuccess();
    } catch (err) {
      console.error("❌ Update error:", err);
      setMessage("เกิดข้อผิดพลาดในการบันทึก ❌");
      setIsSuccess(false);
      setShowPopup(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setLoading(true);

      await deleteStock(stock.barcode);

      setMessage("ลบสต็อกสำเร็จ 🗑️");
      setIsSuccess(true);
      setShowPopup(true);
      onSuccess();

      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (err) {
      console.error("❌ Delete error:", err);
      setMessage("ลบสต็อกไม่สำเร็จ ❌");
      setIsSuccess(false);
      setShowPopup(true);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="product-detail-modal-overlay">
      <div className="product-detail-modal-content">
        <button className="modal-close" onClick={onClose}>✖</button>
        <h2>รายละเอียดสินค้า</h2>

        {/* Tabs */}
        <div className="tabs">
          <button
            className={activeTab === "product" ? "tab active" : "tab"}
            onClick={() => setActiveTab("product")}
          >
            ข้อมูลสินค้า
          </button>
          <button
            className={activeTab === "stock" ? "tab active" : "tab"}
            onClick={() => setActiveTab("stock")}
          >
            ข้อมูลสต็อก
          </button>
        </div>

        <form onSubmit={handleSubmit} className="stock-detail-form">
          {/* --- PRODUCT TAB --- */}
          {activeTab === "product" && (
            <div className="tab-content">
              <div className="stock-form-group">
                <label>ชื่อสินค้า:</label>
                <input type="text" name="name" value={formData?.name || ""} onChange={handleProductChange} />
              </div>
              <div className="stock-form-group">
                <label>ราคา:</label>
                <input type="number" name="price" value={formData?.price || ""} onChange={handleProductChange} />
              </div>
              <div className="stock-form-group">
                <label>รายละเอียด:</label>
                <input type="text" name="description" value={formData?.description || ""} onChange={handleProductChange} />
              </div>
              <div className="stock-form-group">
                <label>หมวดหมู่:</label>
                <input type="text" value={formData?.category?.name || "ไม่พบข้อมูล"} readOnly />
              </div>

              <div className="stock-form-group">
                <label>เปลี่ยนรูปสินค้า:</label>
                <input type="file" accept="image/*" onChange={(e) => e.target.files && setImage(e.target.files[0])} />
              </div>
              {(image || formData?.imageUrl) && (
                <img
                  src={image ? URL.createObjectURL(image) : formData.imageUrl}
                  alt="preview"
                  className="stock-product-preview"
                />
              )}
            </div>
          )}

          {/* --- STOCK TAB --- */}
          {activeTab === "stock" && (
            <div className="tab-content">
              <div className="stock-form-group">
                <label>จำนวนสต็อก:</label>
                <input type="number" name="quantity" value={stockData?.quantity || 0} onChange={handleStockChange} />
              </div>
              <div className="stock-form-group">
                <label>ค่าขั้นต่ำสต็อก:</label>
                <input type="number" name="threshold" value={stockData?.threshold || 0} onChange={handleStockChange} />
              </div>
              <div className="stock-form-group">
                <label>ซัพพลายเออร์:</label>
                <input
                  type="text"
                  value={stockData?.supplier || stockData?.supplierId?.companyName || "ไม่พบข้อมูล"}
                  readOnly
                />
              </div>
              <div className="stock-form-group">
                <label>คลังสินค้า:</label>
                <input type="text" value={warehouseName || "ไม่พบข้อมูล"} readOnly />
              </div>

              <button type="button" className="stock-import-btn" onClick={() => navigate("/createOrder")}>
                📥 นำเข้าสินค้าใหม่
              </button>
            </div>
          )}

          {/* --- ACTIONS --- */}
          <div className="stock-form-actions">
            <button type="button" className="delete-btn" onClick={handleDelete}>
              ลบสต็อก
            </button>
            <button type="submit" className={`save-btn ${loading ? "loading" : ""}`} disabled={loading}>
              {loading ? <span className="spinner"></span> : "บันทึกการแก้ไข"}
            </button>
          </div>
        </form>
      </div>

      {/* ✅ GlobalPopup สำหรับ success/error */}
      <GlobalPopup
        message={message}
        isSuccess={isSuccess}
        show={showPopup}
        setShow={setShowPopup}
        onClose={onClose}   // 👈 เพิ่มตรงนี้
      />

    </div>
  );
};

export default StockDetailModal;
