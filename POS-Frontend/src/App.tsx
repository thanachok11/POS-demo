import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./components/pages/Homepage.tsx";  // นำเข้า Homepage หรือส่วนประกอบอื่น ๆ ที่ต้องการใช้
import Header from "./components/pages/Header.tsx";  // นำเข้า Header หรือส่วนประกอบอื่น ๆ ที่ต้องการใช้
import Dashboard from './components/pages/Dashboard.tsx';
import ProductList from "./components/product/ProductList.tsx";
import UploadProduct from "./components/product/addProduct.tsx";
import StockPage from "./components/stock/Stock.tsx";
import Navbar from "./components/pages/navbar.tsx";
// ถ้าคุณมีหน้า login

const App: React.FC = () => {
  return (
    <Router>
      <Header /> {/* แสดง Header ที่จะใช้ในทุกหน้า */}
      <Navbar /> {/* แสดง Navbar ที่จะใช้ในทุกหน้า */}
      <Routes>
      <Route path="/" element={<Homepage />} /> {/* หน้าแรกหรือ Homepage */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/shop" element={<ProductList />} />
      <Route path="/add-products" element={<UploadProduct />} />
      <Route path="/stock" element={<StockPage />} />

      </Routes>
    </Router>
  );
};

export default App;
