// src/pages/CategoryProducts.tsx
import React, { useEffect, useState } from "react";
import { getProductsByCategory } from "../../api/product/categoryApi.ts";

const CategoryProducts = ({ category }: { category: string }) => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem("token"); // หรือจาก context/auth state

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        if (!token) {
          setError("Unauthorized: Token not found");
          return;
        }

        const data = await getProductsByCategory(category, token);
        setProducts(data.data);
      } catch (err: any) {
        setError(err.message || "Error loading products");
      }
    };

    fetchProducts();
  }, [category]);

  return (
    <div>
      <h1>สินค้าในหมวดหมู่: {category}</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul>
        {products.map((p: any) => (
          <li key={p._id}>{p.name} - {p.price} บาท</li>
        ))}
      </ul>
    </div>
  );
};

export default CategoryProducts;
