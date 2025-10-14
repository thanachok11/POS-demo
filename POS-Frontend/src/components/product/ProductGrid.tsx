import React from "react";
import { Product } from "../../types/productTypes";

interface ProductGridProps {
    products: Product[];
    filteredProducts: Product[];
    cart: Product[];
    addToCart: (product: Product) => void;
    errorMessage: string;
    loading: boolean;
    searchProduct: string;
    categoryFilter: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({
    products,
    filteredProducts,
    cart,
    addToCart,
    errorMessage,
    loading,
    searchProduct,
    categoryFilter,
}) => {
    // ✅ กรองเฉพาะสินค้าที่ isActive === true
    const activeProducts = filteredProducts.filter((p) => p.isActive === true);

    console.log("📦 Loaded Product:", activeProducts);

    return (
        <div className="product-list-wrapper">
            {errorMessage && <p className="error-message">{errorMessage}</p>}

            <div className="product-grid">
                {loading ? (
                    <p className="loading-message">⏳ กำลังโหลดสินค้า...</p>
                ) : activeProducts.length === 0 ? (
                    searchProduct.trim() !== "" || categoryFilter !== "" ? (
                        <p className="no-product-message">❌ ไม่พบสินค้าที่คุณค้นหา</p>
                    ) : (
                        <p className="no-product-message">🔍 ไม่พบข้อมูลสินค้าในร้านของคุณ</p>
                    )
                ) : (
                    activeProducts.map((product) => {
                        const cartItem = cart.find(
                            (i) => i.barcode === product.barcode
                        );
                        return (
                            <div
                                key={product.barcode}
                                className="product-card"
                                onClick={() => addToCart(product)}
                            >
                                {/* 🔢 Badge แสดงจำนวนในตะกร้า */}
                                {cartItem && cartItem.totalQuantity > 0 && (
                                    <div className="product-quantity-badge">
                                        {cartItem.totalQuantity}
                                    </div>
                                )}

                                {/* 🖼️ รูปสินค้า */}
                                <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    className="product-image"
                                />

                                {/* 🏷️ ชื่อสินค้า */}
                                <h2 className="product-title">{product.name}</h2>

                                {/* 💰 ราคา */}
                                <p className="product-price">
                                    ฿{product.price.toLocaleString()}
                                </p>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default ProductGrid;
