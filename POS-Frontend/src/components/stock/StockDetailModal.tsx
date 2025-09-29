import React, { useState, useEffect } from "react";
import "../../styles/stock/StockDetailModal.css";
import { updateProduct, updateProductImage } from "../../api/product/productApi";
import { updateStock, deleteStock } from "../../api/stock/stock";
import { getWarehouses } from "../../api/product/warehousesApi"; // ✅ import api warehouse
import { useNavigate } from "react-router-dom";

interface StockDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  barcode: string | null;
  product: any;
  stock: any;
  onSuccess: () => void;
}

const StockDetailModal: React.FC<StockDetailModalProps> = ({
  isOpen,
  onClose,
  barcode,
  product,
  stock,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<any>(product || {});
  const [stockData, setStockData] = useState<any>(stock || {});
  const [activeTab, setActiveTab] = useState<"product" | "stock">("product");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const [warehouseName, setWarehouseName] = useState<string>("ไม่พบข้อมูล"); // ✅ แสดงชื่อคลัง
  const [warehouseId, setWarehouseId] = useState<string>("");

  const navigate = useNavigate();
  const isOtherSupplier = stock?.supplierCompany === "อื่นๆ";

  useEffect(() => {
    if (product) setFormData(product);
    if (stock) setStockData(stock);
    // ✅ ดึง warehouse เสมอ ไม่ว่ามี stock หรือไม่
    const fetchWarehouse = async () => {
      try {
        const warehouses = await getWarehouses();
        if (stock?.location) { // ✅ ใช้ location เป็น warehouseId
          const found = warehouses.find((w: any) => w._id === stock.location);
          setWarehouseId(found._id);
          setWarehouseName(found ? found.location : "ไม่พบข้อมูล");
        } else {
        }
      } catch (err) {
        console.error("❌ Error fetching warehouses:", err);
      }
    };
    fetchWarehouse();
  }, [product, stock]);


  if (!isOpen || !product) return null;

  const handleProductChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleStockChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setStockData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImage(e.target.files[0]);
    }
  };

  const safeValue = (val: unknown): string => {
    if (typeof val === "object" && val !== null) {
      if ("_id" in val) return String((val as any)._id);
    }
    return String(val);
  };

  const appendFormData = (fd: FormData, data: any) => {
    Object.entries(data).forEach(([k, v]) => {
      if (v !== undefined && v !== null) {
        fd.append(k, safeValue(v));
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setLoading(true);

      // ✅ ใช้ ObjectId ของ warehouse แทนชื่อ
      const updatedStockData = { ...stockData, location: warehouseId };

      // --- update product ---
      await updateProduct(product._id, formData);

      // --- update stock ---
      if (stock?.barcode) {
        await updateStock(stock.barcode, updatedStockData);
      }

      // --- update image ถ้ามี ---
      if (image) {
        const formDataUpload = new FormData();
        appendFormData(formDataUpload, formData);
        appendFormData(formDataUpload, updatedStockData);
        formDataUpload.append("image", image);

        await updateProductImage(formDataUpload, token);
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error("❌ Update error:", err);
    } finally {
      setLoading(false);
    }
  };



  const handleDelete = async () => {
    if (!stock?.barcode) return;
    if (!window.confirm("คุณแน่ใจหรือไม่ที่จะลบสต็อกนี้?")) return;

    try {
      await deleteStock(stock.barcode);
      onSuccess();
      onClose();
    } catch (err) {
      console.error("❌ Delete error:", err);
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
                <input type="text" name="category" value={formData?.category || ""} onChange={handleProductChange} />
              </div>
              <div className="stock-form-group">
                <label>เปลี่ยนรูปสินค้า:</label>
                <input type="file" accept="image/*" onChange={handleImageChange} />
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

          {activeTab === "stock" && (
            <div className="tab-content">
              <div className="stock-form-group">
                <label>จำนวนสต็อก:</label>
                <input
                  type="number"
                  name="quantity"
                  value={stockData?.quantity || 0}
                  onChange={handleStockChange}
                />
              </div>
              <div className="stock-form-group">
                <label>ค่าขั้นต่ำสต็อก:</label>
                <input
                  type="number"
                  name="threshold"
                  value={stockData?.threshold || 0}
                  onChange={handleStockChange}
                />
              </div>
              <div className="stock-form-group">
                <label>ซัพพลายเออร์:</label>
                <input type="text" value={stockData?.supplier || "ไม่พบข้อมูล"} readOnly />
              </div>
              <div className="stock-form-group">
                <label>คลังสินค้า:</label>
                <input type="text" value={warehouseName} readOnly /> {/* ✅ ชื่อ warehouse */}
              </div>

              {!isOtherSupplier && (
                <button type="button" className="stock-import-btn" onClick={() => navigate("/createOrder")}>
                  📥 นำเข้าสินค้าใหม่
                </button>
              )}
            </div>
          )}

          <div className="stock-form-actions">
            <button
              type="button"
              className="delete-btn" onClick={handleDelete}>ลบสต็อก
            </button>

            <button type="submit" className={`save-btn ${loading ? "loading" : ""}`} disabled={loading}>
              {loading ? <span className="spinner"></span> : "บันทึกการแก้ไข"}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
};

export default StockDetailModal;
