import { useState, useEffect } from "react";
import { getProducts } from "../../api/product/productApi.ts";
import { updateStockByBarcode } from "../../api/stock/stock.ts";
import Checkout from "../product/Checkout.tsx"; // นำเข้า Checkout Modal
import "../../styles/product/ProductList.css";
import React from "react";

interface Product {
  barcode: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

const ProductList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Product[]>([]);
  const [showCheckout, setShowCheckout] = useState<boolean>(false);
  const [showCart, setShowCart] = useState<boolean>(false);
  const [showNumberPad, setShowNumberPad] = useState<boolean>(false);
  const [selectedProductBarcode, setSelectedProductBarcode] = useState<string>("");
  const [currentQuantity, setCurrentQuantity] = useState<number>(0);
  const [successMessage, setSuccessMessage] = useState<string>("");

  useEffect(() => {
    const fetchProducts = async () => {
      const productData = await getProducts();
      setProducts(productData);
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
    setShowCart(true);
  };

  const removeFromCart = (barcode: string) => {
    setCart((prevCart) => {
      const updatedCart = prevCart
        .map((item) => (item.barcode === barcode ? { ...item, quantity: item.quantity - 1 } : item))
        .filter((item) => item.quantity > 0);

      if (updatedCart.length === 0) {
        setShowCart(false); // ซ่อนตะกร้าเมื่อไม่มีสินค้า
      }

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
      setSuccessMessage(""); // ซ่อนข้อความสำเร็จหลังจาก 3 วินาที
      setShowCart(false); // ซ่อนตะกร้าหลังจากข้อความหายไป
    }, 3000); // เวลา 3 วินาที
  };

  const handleConfirmPayment = (method: string) => {
    setShowCheckout(false); // ปิด Modal หลังชำระเงิน
    setCart([]); // ล้างตะกร้าหลังชำระเงิน
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const getCartQuantity = (barcode: string) => {
    const product = cart.find((item) => item.barcode === barcode);
    return product ? product.quantity : 0;
  };

  // คำนวณยอดรวมทั้งหมดในตะกร้า
  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleQuantityChange = (value: string) => {
    if (value === "ลบทั้งหมด") {
      setCurrentQuantity(0); // Reset the quantity if 'del' is clicked
    } else {
      setCurrentQuantity((prev) => Number(prev.toString() + value)); // Append number to the quantity
    }
  };

  const handleSetQuantity = () => {
    setCart((prevCart) => {
      return prevCart.map((item) =>
        item.barcode === selectedProductBarcode ? { ...item, quantity: currentQuantity } : item
      );
    });
    setShowNumberPad(false); // Close the number pad after setting the quantity
  };

  return (
    <div className="product-page">
      <div className="product-list-container">
        <h1>รายการสินค้า</h1>
        <div className="product-grid">
          {products.map((product) => (
            <div key={product.barcode} className="product-card" onClick={() => addToCart(product)}>
              {getCartQuantity(product.barcode) > 0 && (
                <div className="cart-quantity">{getCartQuantity(product.barcode)}</div>
              )}
              <img src={product.imageUrl} alt={product.name} />
              <h2>{product.name}</h2>
              <p>{product.price} ฿</p>
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
              <button onClick={() => removeFromCart(item.barcode)} className="remove-btn">
                ลบ
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
            <p>จำนวน: {currentQuantity}</p>
          </div>
          <div className="number-pad-buttons">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "ลบทั้งหมด"].map((button) => (
              <button key={button} onClick={() => handleQuantityChange(button)}>{button}</button>
            ))}
          </div>
          <button onClick={handleSetQuantity} className="set-quantity-btn">เลือก</button>
        </div>
      )}
    </div>
  );
};

export default ProductList;
