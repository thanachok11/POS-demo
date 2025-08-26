import React, { useState, useEffect } from "react";
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
import Scanner from "./components/product/Scanner.tsx";
import PaymentPage from "./components/payment/PaymentPage.tsx";
import EmployeeList from "./components/aboutStore/EmployeePage.tsx";
import OrderPage from "./components/stock/OrderPage.tsx";
import EmployeePage from "./components/pages/Employee/Dashboard-employee.tsx";
import { jwtDecode } from "jwt-decode";
import { renewToken } from "./api/auth/auth.ts"; // 👈 เรียกใช้จาก API

const API_BASE_URL = process.env.REACT_APP_API_URL;

import "./App.css";
// Interceptor เพื่อตรวจสอบ response ทั้งหมด
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401 || status === 403) {
      // ล้าง token
      localStorage.removeItem("token");

      // เปลี่ยนหน้าแบบ force reload
      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  const token = localStorage.getItem("token");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    let timeoutId: NodeJS.Timeout;
    let lastRenewTime = 0;
    const COOLDOWN_MS = 5 * 60 * 1000;

    const isTokenExpiringSoon = (token: string | null, bufferSeconds = 60) => {
      if (!token) return true;
      try {
        const decoded: any = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        return decoded.exp - currentTime < bufferSeconds;
      } catch {
        return true;
      }
    };

    const activityDetected = async () => {
      clearTimeout(timeoutId);

      const token = localStorage.getItem("token");
      const now = Date.now();

      const enoughTimePassed = now - lastRenewTime > COOLDOWN_MS;
      const tokenIsExpiring = isTokenExpiringSoon(token, 60);

      if (token && tokenIsExpiring && enoughTimePassed) {
        const newToken = await renewToken(token); // ✅ เรียกใช้ API function
        if (newToken) {
          localStorage.setItem("token", newToken);
          lastRenewTime = Date.now();
          console.log("🔄 Token renewed successfully");

        }
      }

      timeoutId = setTimeout(() => { }, COOLDOWN_MS);
    };

    window.addEventListener("mousemove", activityDetected);
    window.addEventListener("keydown", activityDetected);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("mousemove", activityDetected);
      window.removeEventListener("keydown", activityDetected);
    };
  }, []);

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
            <Route path="/scan" element={<Scanner />} />

            <Route path="/reports/sales" element={<SalePage />} />
            <Route path="/products/scan" element={<ScanBarcode />} />
            <Route path="/employee-dashboard" element={<EmployeePage />} />
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
