import React, { useState } from "react";
import axios from "axios";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./components/pages/Homepage.tsx";
import Header from "./components/pages/Header.tsx";
import Dashboard from './components/pages/Dashboard.tsx';
import AddProductForm from './components/product/AddProduct.tsx';
import ProductList from "./components/product/ProductList.tsx";
import ScanBarcode from "./components/product/ScanBarcode.tsx";
import StockPage from "./components/stock/StockPage.tsx";
import StockDetailPage from "./components/stock/StockDetailPage.tsx";  // ✅ ใช้แค่ StockDetailPage
import CreateOrder from "./components/stock/CreateOrderPage.tsx";
import SupplierList from "./components/suppliers/SupplierList.tsx";
import UserSettings from "./components/pages/UserSettings.tsx";
import ReceiptPage from "./components/receipt/ReceiptPage.tsx";
import ReceiptDetail from "./components/receipt/ReceiptDetail.tsx";
import Search from "./components/product/BarcodeSearch.tsx";
import SalePage from "./components/pages/Dashboard.tsx";
import TestQr from "./App.js";
import PaymentPage from "./components/payment/PaymentPage.tsx";
import EmployeeList from "./components/aboutStore/EmployeePage.tsx";
import OrderPage from "./components/stock/OrderPage.tsx";
import "./App.css";
// Interceptor เพื่อตรวจสอบ response ทั้งหมด
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 403) {
      localStorage.removeItem("token");
      window.location.href = "/"; // เปลี่ยนหน้าแบบ force reload
    }
    return Promise.reject(error);
  }
);
const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <Router>
      <div className={`app-container ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
        <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/suppliers" element={<SupplierList />} />
            <Route path="/add-product" element={<AddProductForm />} />
            <Route path="settingProfile" element={<UserSettings />} />
            <Route path="/reports/salehistory" element={<PaymentPage />} />
            <Route path="setting/employee" element={<EmployeeList />} />
            <Route path="/reports/receipts" element={<ReceiptPage />} />
            <Route path="/products/search" element={<Search />} />
            <Route path="/debt" element={<OrderPage />} />
            <Route path="/reports/sales" element={<SalePage />} />
            <Route path="/products/scan" element={<ScanBarcode />} />
            <Route
              path="/shop"
              element={
                <ProductList
                  isSidebarOpen={isSidebarOpen}
                  toggleSidebar={toggleSidebar}
                />
              }
            />
            <Route path="/stocks" element={<StockPage />} />
            <Route path="/receipts/paymentId/:paymentId" element={<ReceiptDetail />} /> {/* ✅ รับ paymentId เป็น dynamic parameter */}
            <Route path="/products/barcode/:barcode" element={<StockDetailPage />} /> {/* ✅ รับ barcode เป็น dynamic parameter */}
            <Route path="/createOrder" element={<CreateOrder />} />

          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
