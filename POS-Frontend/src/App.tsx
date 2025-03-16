import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./components/pages/Homepage.tsx";
import Header from "./components/pages/Header.tsx";
import Dashboard from './components/pages/Dashboard.tsx';
import AddProductForm from './components/product/AddProduct.tsx';
import ProductList from "./components/product/ProductList.tsx";
import ScanBarcode from "./components/product/ScanBarcode.tsx";
import StockPage from "./components/stock/Stock.tsx";
import StockDetailPage from "./components/stock/StockDetailPage.tsx";  // ✅ ใช้แค่ StockDetailPage
import CreateOrder from "./components/stock/CreateOrderPage.tsx";
import SupplierList from "./components/suppliers/SupplierList.tsx";
import UserSettings from "./components/pages/UserSettings.tsx";
import ReceiptPage from "./components/receipt/ReceiptPage.tsx";
import SalePage from "./components/pages/Dashboard.tsx";
import PaymentPage from "./components/payment/PaymentPage.tsx";
import EmployeeList from "./components/aboutStore/EmployeePage.tsx";
import "./App.css";

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
            <Route path="settingProfile"  element={<UserSettings />} />
            <Route path="/reports/salehistory" element={<PaymentPage />} />
            <Route path="setting/employee" element={<EmployeeList />} />
            <Route path="/reports/receipts" element={<ReceiptPage />} />
            <Route path="/reports/sales" element={<SalePage />} />
            <Route path="/products/scan" element={<ScanBarcode />} />
            <Route path="/shop" element={<ProductList />} />
            <Route path="/stocks" element={<StockPage />} />
            <Route path="/products/barcode/:barcode" element={<StockDetailPage />} /> {/* ✅ รับ barcode เป็น dynamic parameter */}
            <Route path="/createOrder" element={<CreateOrder />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
