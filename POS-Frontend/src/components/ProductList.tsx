import React, { useEffect, useState } from "react";
import { getProducts } from "../api/productApi.ts";
import "../styles/ProductList.css";
function ProductList() {
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
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

  // Handle item click to add to cart
  const handleItemClick = (product: any) => {
    setCart((prevCart) => [...prevCart, product]);
  };

  return (
    <div className="pos-container">
      {/* Left: Product List */}
      <div className="product-list">
        <h2>Product List</h2>
        {error ? (
          <p className="error-message">Error: {error}</p>
        ) : (
          <div className="product-grid">
            {products.map((product) => (
              <div
                key={product._id}
                className="product-item"
                onClick={() => handleItemClick(product)} // Click to add to cart
              >
                <div className="product-image">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="product-img"
                  />
                </div>
                <h3 className="product-name">{product.name}</h3>
                <p>
                  <strong>Price:</strong> {product.price} ฿
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right: Checkout Area */}
      <div className="checkout-area">
        <h2>Checkout</h2>
        <div className="checkout-details">
          {cart.length === 0 ? (
            <p>No items in the cart.</p>
          ) : (
            <ul>
              {cart.map((item, index) => (
                <li key={index}>
                  <strong>{item.name}</strong> - {item.price} ฿
                </li>
              ))}
            </ul>
          )}
        </div>
        <button className="checkout-btn">Proceed to Payment</button>
      </div>
    </div>
  );
}

export default ProductList;