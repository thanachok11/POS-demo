import React, { useState, useEffect } from "react";
import { getStockData } from "../../api/stock/stock";
import { getProducts } from "../../api/product/productApi";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { jwtDecode } from "jwt-decode";
import { getWarehouses } from "../../api/product/warehousesApi";
import { getCategories } from "../../api/product/categoryApi";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import "../../styles/stock/StockPage.css";
import StockDetailModal from "../stock/StockDetailModal";

import AddProductModal from "../product/AddProductModal";
import StockTable from "./StockTable";

interface StockItem {
  _id: string;
  barcode: string;
  quantity: number;
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
}



const StockPage: React.FC = () => {
  const [stockData, setStockData] = useState<StockItem[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedBarcode, setSelectedBarcode] = useState<string | null>(null);

  const [user, setUser] = useState<{ userId: string; username: string; role: string; email: string } | null>(null);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  // ✅ Pagination
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const navigate = useNavigate();

  // ✅ fetchData reusable
  const fetchData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("❌ No token found");
      setLoading(false);
      return;
    }

    try {
      const stock = await getStockData(token);
      setStockData(stock); // stock.data ควรมี productId populated อยู่แล้ว
    } catch (err) {
      console.error("❌ Fetch data error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ fetch warehouses
  const fetchWarehouses = async () => {
    try {
      const warehouseList = await getWarehouses();
      setWarehouses(warehouseList);
    } catch (error) {
      console.error("Warehouse Fetch Error:", error);
    }
  };

  // ✅ fetch categories
  const fetchCategories = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const categoryList = await getCategories(token);
      setCategories(categoryList.data);
    } catch (error) {
      console.error("Category Fetch Error:", error);
    }
  };

  // ✅ decode user
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        setUser({
          userId: decoded.userId,
          role: decoded.role,
          username: decoded.username,
          email: decoded.email,
        });
      } catch (error) {
        console.error("Invalid token:", error);
      }
    }
  }, []);

  // ✅ load initial data
  useEffect(() => {
    fetchData();
    fetchWarehouses();
    fetchCategories();
  }, []);

  // ✅ helpers
  const getLocationName = (location: any) => {
    if (!location) return "ไม่ทราบที่เก็บ";

    // ✅ ถ้ามีทั้ง name + location → แสดงสองอัน
    if (location.name && location.location) {
      return `${location.name} (${location.location})`;
    }

    // ✅ ถ้ามีแค่ location
    if (location.location) return location.location;

    // ✅ fallback หาใน warehouses
    const found = warehouses.find((w) => w._id === location._id);
    return found ? found.location : "ไม่ทราบที่เก็บ";
  };


  const getCategoryNameById = (categoryId: string | undefined) => {
    const category = categories.find((cat) => cat._id === categoryId);
    return category ? category.name : "ไม่ทราบหมวดหมู่";
  };

  const formatThaiDateTime = (dateString: string) =>
    new Date(dateString).toLocaleString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Bangkok",
    });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "สินค้าพร้อมขาย": return "✅";
      case "สินค้าหมด": return "❌";
      default: return "⚠️";
    }
  };

  // ✅ sort ใหม่สุดก่อน
  const sortedStock = [...stockData].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  const filteredStock = sortedStock.filter((item) => {
    const searchText = searchQuery.toLowerCase();

    const productName = item.productId?.name?.toLowerCase() || "";
    const categoryName = item.productId?.category?.name?.toLowerCase() || ""; // ✅ ใช้ตรง ๆ
    const supplierName = item.supplierId?.companyName?.toLowerCase() || "";
    const barcode = item.barcode?.toLowerCase() || "";

    return (
      productName.includes(searchText) ||
      categoryName.includes(searchText) ||
      supplierName.includes(searchText) ||
      barcode.includes(searchText)
    );
  });

  // ✅ pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStock = filteredStock.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(filteredStock.length / itemsPerPage);
  const handleRowClick = (barcode: string) => {
    setSelectedBarcode(barcode);
  };

  return (
    <div className="display">
      <div className="stock-container">
        {/* Header */}
        <div className="stock-header-wrapper">
          <h2 className="stock-header">📦 จัดการสต็อกสินค้า</h2>

          {loading && <p className="loadingStock">⏳ Loading...</p>}
          {error && <p className="error-message">{error}</p>}

          {/* Controls */}
          <div className="stock-controls">
            <div className="search-container">
              <input
                type="text"
                placeholder="🔍 ค้นหาสินค้า..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              />
            </div>

            <div className="items-per-page">
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

          {user?.role !== "employee" && (
            <button className="add-product-button" onClick={() => setIsModalOpen(true)}>
              <FontAwesomeIcon icon={faPlus} /> เพิ่มสินค้า
            </button>
          )}
        </div>

        {/* Scrollable Table */}
        <div className="stock-table-wrapper">
          <StockTable
            stock={paginatedStock}
            getLocationName={getLocationName}
            getCategoryNameById={getCategoryNameById}
            formatThaiDateTime={formatThaiDateTime}
            getStatusIcon={getStatusIcon}
            handleRowClick={handleRowClick}
          />
        </div>

        {/* Pagination */}
        <div className="pagination">
          <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1}>
            ◀ ก่อนหน้า
          </button>
          <span>หน้า {currentPage} จาก {totalPages}</span>
          <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>
            ถัดไป ▶
          </button>
        </div>

        <StockDetailModal
          isOpen={!!selectedBarcode}
          barcode={selectedBarcode}
          stock={selectedBarcode ? stockData.find((s) => s.barcode === selectedBarcode) : null}
          onClose={() => setSelectedBarcode(null)}
          onSuccess={() => fetchData()}
        />


        <AddProductModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => fetchData()}
        />
      </div>
    </div>
  );
};

export default StockPage;
