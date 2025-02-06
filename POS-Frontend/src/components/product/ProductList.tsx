import React, { useEffect, useState } from "react";
import { getProducts,createOrder} from "../../api/product/productApi.ts"; // ดึงสินค้าจาก API

const Checkout: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<{ id: string; name: string; price: number; quantity: number }[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchProducts();
  }, []);

  // เพิ่มสินค้าไปในตะกร้า
  const addToCart = (product: any) => {
    setSelectedProducts((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  // ลบสินค้าออกจากตะกร้า
  const removeFromCart = (productId: string) => {
    setSelectedProducts((prev) => prev.filter((item) => item.id !== productId));
  };

  // คำนวณราคารวม
  const getTotalPrice = () => {
    return selectedProducts.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  // ดำเนินการ Checkout
  const handleCheckout = async () => {
    if (selectedProducts.length === 0) {
      alert("กรุณาเลือกสินค้าก่อนชำระเงิน");
      return;
    }

    const orderData = {
      products: selectedProducts,
      total: getTotalPrice(),
    };

    try {
      await createOrder(orderData);
      alert("สั่งซื้อสำเร็จ!");
      setSelectedProducts([]); // ล้างตะกร้า
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2>เลือกสินค้า</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul>
        {products.map((product) => (
          <li key={product.id}>
            <h3>{product.name}</h3>
            <p>ราคา: ฿{product.price}</p>
            <button onClick={() => addToCart(product)}>เพิ่มลงตะกร้า</button>
          </li>
        ))}
      </ul>

      <h2>ตะกร้าสินค้า</h2>
      <ul>
        {selectedProducts.map((item) => (
          <li key={item.id}>
            <h3>{item.name} x {item.quantity}</h3>
            <p>ราคารวม: ฿{item.price * item.quantity}</p>
            <button onClick={() => removeFromCart(item.id)}>ลบ</button>
          </li>
        ))}
      </ul>

      <h3>ราคารวมทั้งหมด: ฿{getTotalPrice()}</h3>
      <button onClick={handleCheckout}>ชำระเงิน</button>
    </div>
  );
};

export default Checkout;
