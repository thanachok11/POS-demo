import { useState, useEffect } from "react";
import { getProducts } from "../../api/product/productApi.ts";
import { updateStockByBarcode, getStockByBarcode } from "../../api/stock/stock.ts";
import { createPayment } from "../../api/payment/paymentApi.ts"; // นำเข้า API ชำระเงิน
import { getCategories } from "../../api/product/categoryApi.ts"; // Import API ดึงหมวดหมู่สินค้า
import Checkout from "../product/Checkout.tsx"; // นำเข้า Checkout Modal
import "../../styles/product/ProductList.css";
import { jwtDecode } from "jwt-decode";

import React from "react";

interface Product {
  barcode: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
  imageUrl: string;
}

const ProductList: React.FC = () => {
  const [user, setUser] = useState<{ userId: string; username: string; email: string } | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Product[]>([]);
  const [showCheckout, setShowCheckout] = useState<boolean>(false);
  const [showCart, setShowCart] = useState<boolean>(false);
  const [showNumberPad, setShowNumberPad] = useState<boolean>(false);
  const [selectedProductBarcode, setSelectedProductBarcode] = useState<string>("");
  const [currentQuantity, setCurrentQuantity] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [lowStockMessages, setLowStockMessages] = useState<Map<string, string>>(new Map());
  const [searchProduct, setSearchProduct] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        setUser({
          userId: decoded.userId,
          username: decoded.username,
          email: decoded.email,
        });
      } catch (error) {
        console.error("Invalid token:", error);
      }
    }
  }, []);
  useEffect(() => {
  const fetchCategories = async () => {
    try {
      const categoryData = await getCategories();
      if (categoryData.success && Array.isArray(categoryData.data)) {
        setCategories(categoryData.data);
      } else {
        console.error("ไม่พบข้อมูลหมวดหมู่");
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการดึงหมวดหมู่:", error);
    }
  };

  fetchCategories();
  }, []);
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productData = await getProducts();  // เรียกใช้ฟังก์ชันจาก productApi.ts
        console.log("Product data: ", productData); // log ดูข้อมูลสินค้า

        if (productData.success && Array.isArray(productData.data)) {
          setProducts(productData.data);  // ใช้ productData.data แทน
        } else {
          setErrorMessage("ไม่พบข้อมูลสินค้า");
        }
      } catch (error) {
        setErrorMessage("เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า");
        console.error(error);
      }
    };

    fetchProducts();
  }, []);


  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingProduct = prevCart.find((item) => item.barcode === product.barcode);
      if (existingProduct) {
        return prevCart.map((item) =>
          item.barcode === product.barcode
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };


const removeFromCart = (product: Product, barcode: string) => {
    setCart((prevCart) => {
      const updatedCart = prevCart.filter(item => item.barcode !== barcode); // 🔥 ลบสินค้าทั้งหมดที่ตรงกับ barcode

      if (updatedCart.length === 0) {
        setShowCart(false); // ซ่อนตะกร้าเมื่อไม่มีสินค้า
      }

      // ลบข้อความแจ้งเตือน stock ต่ำเมื่อสินค้าถูกลบออกจากตะกร้า
      setLowStockMessages((prevMessages) => {
        const newMessages = new Map(prevMessages);
        newMessages.delete(barcode);
        return newMessages;
      });

      return updatedCart;
    });
};


  const checkout = async (amountReceived: number) => {
    if (!user) {
      setErrorMessage("กรุณาเข้าสู่ระบบก่อนทำการชำระเงิน");
      return;
    }

    const validPaymentMethods = ["เงินสด", "โอนเงิน", "บัตรเครดิต", "QR Code"] as const;
    const selectedPaymentMethod: string = "เงินสด"; // ค่าเริ่มต้น หรือดึงค่าจาก Modal

    if (!validPaymentMethods.includes(selectedPaymentMethod as any)) {
      setErrorMessage("วิธีการชำระเงินไม่ถูกต้อง");
      return;
    }

    const paymentData = {
      saleId: new Date().getTime().toString(),
      employeeName: user.username,
      paymentMethod: selectedPaymentMethod as "เงินสด" | "โอนเงิน" | "บัตรเครดิต" | "QR Code",
      amount: getTotalPrice(),
      amountReceived, // ✅ เพิ่มจำนวนเงินที่ลูกค้าจ่าย
      change: amountReceived - getTotalPrice(), // ✅ คำนวณเงินทอน
      items: cart.map(item => ({
        barcode: item.barcode,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity,
      }))
    };

    try {
      const paymentResponse = await createPayment(paymentData);
      if (!paymentResponse.success) {
        setErrorMessage(paymentResponse.message);
        return;
      }

      // 🛍️ ลดจำนวนสินค้าในสต็อก
      for (const item of cart) {
        try {
          const updatedStock = await updateStockByBarcode(item.barcode, item.quantity);
          if (!updatedStock.success) {
            setErrorMessage(`ไม่สามารถอัปเดตสต็อกของ ${item.name}`);
            return;
          }
        } catch (error) {
          setErrorMessage(`เกิดข้อผิดพลาดในการอัปเดตสต็อกของ ${item.name}`);
          console.error(error);
          return;
        }
      }

      // เคลียร์ตะกร้าและซ่อนตะกร้า
      setCart([]);
      setShowCart(false);
      setTimeout(() => {
        setShowCart(false);
      }, 3000); // เวลา 3 วินาที
    } catch (error) {
      setErrorMessage("เกิดข้อผิดพลาดในการบันทึกข้อมูลชำระเงิน");
      console.error(error);
      return;
    }
  };


// 📌 ฟังก์ชันยืนยันการชำระเงินจาก Modal
const handleConfirmPayment = (method: string, amountReceived?: number) => {
    const validPaymentMethods = ["เงินสด", "โอนเงิน", "บัตรเครดิต", "QR Code"] as const;

    if (!validPaymentMethods.includes(method as any)) {
      setErrorMessage("วิธีการชำระเงินไม่ถูกต้อง");
      return;
    }

    const paymentData = {
      saleId: new Date().getTime().toString(),
      employeeName: user?.username || "ลูกค้า",
      paymentMethod: method as "เงินสด" | "โอนเงิน" | "บัตรเครดิต" | "QR Code",
      amount: getTotalPrice(),
      amountReceived: amountReceived || getTotalPrice(), // ✅ ใช้ amountReceived หรือ totalPrice
      change: amountReceived ? amountReceived - getTotalPrice() : 0, // ✅ คำนวณเงินทอน
      items: cart.map(item => ({
        barcode: item.barcode,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity,
      }))
    };

    createPayment(paymentData)
      .then((response) => {
        if (!response.success) {
          setErrorMessage(response.message);
          return;
        }
        setShowCheckout(false); // ปิด Modal หลังจากชำระเงินเสร็จ
        setCart([]); // ล้างตะกร้า
      })
      .catch((error) => {
        setErrorMessage("เกิดข้อผิดพลาดในการบันทึกข้อมูลชำระเงิน");
        console.error(error);
      });
};


  // คำนวณยอดรวมทั้งหมดในตะกร้า
  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };


  const handleQuantityChange = (value: string) => {
    if (value === "ลบทั้งหมด") {
      setCurrentQuantity(0); // รีเซ็ตจำนวนเมื่อกด "ลบทั้งหมด"
    } else {
      // ถ้ามีค่าปัจจุบันอยู่แล้ว (currentQuantity), ต่อเลขใหม่เข้าไป
      setCurrentQuantity((prev) => Number(prev.toString() + value));
    }
  };

const handleDeleteOne = () => {
  setCurrentQuantity((prev) => {
    const newValue = prev.toString().slice(0, -1); // ลบตัวสุดท้าย
    if (newValue === "" || newValue === "0") {
      return 0;
    }
    return Number(newValue);
  });
};
const clearCart = () => {
  setCart([]); // เคลียร์สินค้าในตะกร้า
};

const handleSetQuantity = () => {
    setCart((prevCart) => {
      return prevCart
        .map((item) =>
          item.barcode === selectedProductBarcode
            ? { ...item, quantity: currentQuantity }
            : item
        )
        .filter((item) => item.quantity > 0); // 🔥 ลบสินค้าที่มีจำนวนเป็น 0
    });

    setShowNumberPad(false); // ปิดแป้นตัวเลข
};


const filteredProducts = products.filter((product) =>
  product.name.toLowerCase().includes(searchProduct.toLowerCase()) &&
  (categoryFilter === "" || product.category === categoryFilter) // กรองสินค้าตามหมวดหมู่
);

  return (
    <div className="product-page">
      <div className="search-grid">
        <div className="searchproduct-container">
          <input
            type="text"
            placeholder="🔍 ค้นหาสินค้า..."
            className="searchproduct-input"
            value={searchProduct}
            onChange={(e) => setSearchProduct(e.target.value)}
          />
 
        <div className="category-filter-container">
        <select
          className="category-filter"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">📦 ทุกหมวดหมู่</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
               </div>
      </div>
      </div>
      <div className="product-list-container">
        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <div className="product-grid">
          {filteredProducts.map((product) => (
            <div key={product.barcode} className="product-card" onClick={() => addToCart(product)}>
              <img src={product.imageUrl} alt={product.name} className="product-image" />
              <h2>{product.name}</h2>
              <p className="product-price">{product.price} ฿</p>
            </div>
          ))}
        </div>
      </div>

      {/* ตะกร้าสินค้า */}
      <div className={`cart ${cart.length > 0 ? "show-cart" : "hidden-cart"}`}>
        <h2 className="cart-title ">ตะกร้าสินค้า</h2>
        <button onClick={clearCart} className="clear-cart-btn">เคลียตะกร้า</button>

        <div className="cart-items">
          {cart.map((item) => (
            <div key={item.barcode} className="cart-item">
              <img src={item.imageUrl} alt={item.name} className="cart-item-img" />
              <div className="cart-item-info">
                <p className="cart-item-name">{item.name}</p>
                <p className="cart-item-quantity">จำนวน: {item.quantity}</p>
                <button
                  onClick={() => {
                    setSelectedProductBarcode(item.barcode);
                    setCurrentQuantity(item.quantity); // Pre-fill the quantity in number pad
                    setShowNumberPad(true); // Show number pad
                  }}
                  className="edit-quantity-btn"
                >
                  แก้ไขจำนวน
                </button>
              </div>
              <button onClick={() => removeFromCart(item, item.barcode)} className="remove-btn">
                ลบสินค้า
              </button>
            </div>
          ))}
        </div>

        {/* ✅ แสดงยอดรวมด้านบนปุ่มชำระเงิน ✅ */}
        <div className="cart-total">
          <p>ยอดรวม: <span>{getTotalPrice()} ฿</span></p>
        </div>

        <div className="checkout">
          <button onClick={() => setShowCheckout(true)} className="checkout-btn">
            ชำระเงิน
          </button>
        </div>
      </div>
      {showCheckout && (
        <Checkout
          cart={cart}
          totalPrice={getTotalPrice()} // Pass the total price here
          onClose={() => setShowCheckout(false)}
          onConfirmPayment={handleConfirmPayment}
          checkout={checkout} // ส่งฟังก์ชัน checkout ไปให้ Modal
        />
      )}

{/* Number Pad for Quantity */}
{showNumberPad && (
  <div className="numpad-overlay">
  <div className="numpad-product">
<button onClick={() => setShowNumberPad(false)} className="numpad-product-close">
  &times;
</button>

    <div className="numpad-product-display">
      {errorMessage ? (
        <p className="numpad-product-error">{errorMessage}</p> // แสดงข้อความ error ถ้ามี
      ) : (
        <p>จำนวน: {currentQuantity}</p> // แสดงจำนวนที่ผู้ใช้ป้อน
      )}
    </div>
    <div className="numpad-product-buttons">
      {["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"].map((button) => (
        <button key={button} onClick={() => handleQuantityChange(button)} className="numpad-product-btn">
          {button}
        </button>
        
      ))}
    <button onClick={handleDeleteOne} className="numpad-product-clear-one">C</button>
    <button onClick={() => handleQuantityChange("ลบทั้งหมด")} className="numpad-product-clear">
      AC
    </button>
    </div>
        <button onClick={handleSetQuantity} className="numpad-product-set">
      เลือก
    </button>
  </div>
  </div>
)}
    </div>
  );
};

export default ProductList;
