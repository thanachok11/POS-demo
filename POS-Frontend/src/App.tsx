import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./components/pages/Homepage.tsx"; // หน้าแรก
import Header from "./components/pages/Header.tsx"; // ใช้ Header ที่คุณสร้างขึ้น
import Dashboard from './components/pages/Dashboard.tsx';
import AddProductForm from './components/product/AddProduct.tsx';
import AddFrom from "./components/stock/AddStockForm.tsx";
import ProductList from "./components/product/ProductList.tsx";
import StockPage from "./components/stock/Stock.tsx";
import StockDetailPage from "./components/stock/StockDetailPage.tsx";
import CreateOrder from "./components/stock/CreateOrderPage.tsx";

import "./App.css";  // นำเข้าการตั้งค่าของ CSS

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen); // เปลี่ยนสถานะของ Sidebar
  };

  return (
    <Router>
      <div className={`app-container ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
        <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/dashboard" element={<Dashboard />} />

            {/* หน้า Add Product และ Add Stock รวมกันในหน้าเดียว */}
            <Route path="/add-product" element={
            
                <AddProductForm />
            
            } />

            <Route path="/shop" element={<ProductList />} />
            <Route path="/stock" element={<StockPage />} />
            <Route path="/stock/:id" element={<StockDetailPage />} />
            <Route path="/createOrder" element={<CreateOrder />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
