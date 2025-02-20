import { useState, useEffect } from "react";
import { getProducts } from "../../api/product/productApi.ts";
import { updateStockByBarcode, getStockByBarcode } from "../../api/stock/stock.ts";
import Checkout from "../product/Checkout.tsx"; // นำเข้า Checkout Modal
import "../../styles/product/ProductList.css";
import { jwtDecode } from "jwt-decode";

import React from "react";

interface Product {
  barcode: string;
  name: string;
  price: number;
  quantity: number;
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


  const addToCart = async (product: Product) => {
    const stockQuantity = await getStockByBarcode(product.barcode);
    const currentCartQuantity = getCartQuantity(product.barcode);
    const newQuantity = currentCartQuantity + 1;

    if (newQuantity >= stockQuantity) {
      setLowStockMessages((prevMessages) => {
        const newMessages = new Map(prevMessages);
        newMessages.set(product.barcode, "สินค้าหมด");
        return newMessages;
      });
    } else {
      setLowStockMessages((prevMessages) => {
        const newMessages = new Map(prevMessages);
        newMessages.delete(product.barcode); // Clear the low stock message
        return newMessages;
      });
    }

    // Check if cart quantity exceeds stock
    if (newQuantity > stockQuantity) {
      setErrorMessage("");
      return;
    }

    // Update cart
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

    setShowCart(true);
  };

  const getCartQuantity = (barcode: string) => {
    const product = cart.find((item) => item.barcode === barcode);
    return product ? product.quantity : 0;
  };

  const removeFromCart = (product: Product, barcode: string) => {
    setCart((prevCart) => {
      const updatedCart = prevCart
        .map((item) =>
          item.barcode === barcode ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0); // ลบสินค้าออกถ้าจำนวนเป็น 0

      if (updatedCart.length === 0) {
        setShowCart(false); // ซ่อนตะกร้าเมื่อไม่มีสินค้า
      }

      // Clear low stock message when item is removed from cart
      setLowStockMessages((prevMessages) => {
        const newMessages = new Map(prevMessages);
        newMessages.delete(barcode); // Remove the low stock message when the item is removed
        return newMessages;
      });

      return updatedCart;
    });
  };

  const checkout = async () => {
    for (const item of cart) {
      await updateStockByBarcode(item.barcode, item.quantity);
    }
    setCart([]);
    setShowCart(false);
    setTimeout(() => {
      setShowCart(false); // ซ่อนตะกร้าหลังจากข้อความหายไป
    }, 3000); // เวลา 3 วินาที
  };

  const handleConfirmPayment = (method: string) => {
    setShowCheckout(false); // ปิด Modal หลังชำระเงิน
    setCart([]); // ล้างตะกร้าหลังชำระเงิน
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

  const handleSetQuantity = async () => {
    const stockQuantity = await getStockByBarcode(selectedProductBarcode);

    // ถ้าจำนวนที่ป้อนเกินจำนวนที่มีใน stock
    if (currentQuantity > stockQuantity) {
      setErrorMessage("สินค้าหมด");
      setCurrentQuantity(stockQuantity); // ตั้งค่าให้เป็นจำนวน stock ที่มี
      return;
    }

    setErrorMessage(""); // เคลียร์ข้อความ error

    setCart((prevCart) => {
      return prevCart.map((item) =>
        item.barcode === selectedProductBarcode
          ? { ...item, quantity: currentQuantity }
          : item
      );
    });

    setShowNumberPad(false); // ปิด numpad หลังจากเลือกจำนวน
  };


  return (
    <div className="product-page">
      <div className="product-list-container">
        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <div className="product-grid">
          {products.map((product) => (
            <div key={product.barcode} className="product-card" onClick={() => addToCart(product)}>
              {lowStockMessages.has(product.barcode) && (
                <p className="out-of-stock-message">{lowStockMessages.get(product.barcode)}</p>
              )}
              <img src={product.imageUrl} alt={product.name} className="product-image" />
              <h2>{product.name}</h2>
              <p className="product-price">{product.price} ฿</p>
            </div>
          ))}
        </div>
      </div>
      {/* ตะกร้าสินค้า */}
      <div className={`cart ${showCart && cart.length > 0 ? "show-cart" : "hidden-cart"}`}>
        <h2>ตะกร้าสินค้า</h2>
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
        <div className="number-pad">
          <div className="number-pad-display">
            {errorMessage ? (
              <p className="error-message">{errorMessage}</p> // แสดงข้อความ error ถ้ามี
            ) : (
              <p>จำนวน: {currentQuantity}</p> // แสดงจำนวนที่ผู้ใช้ป้อน
            )}
          </div>
          <div className="number-pad-buttons">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"].map((button) => (
              <button key={button} onClick={() => handleQuantityChange(button)}>
                {button}
              </button>
            ))}
          </div>
          <button onClick={handleSetQuantity} className="set-quantity-btn">
            เลือก
          </button>
          <button
            onClick={() => handleQuantityChange("ลบทั้งหมด")}
            className="clear-all-btn"
          >
            ลบทั้งหมด
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductList;
