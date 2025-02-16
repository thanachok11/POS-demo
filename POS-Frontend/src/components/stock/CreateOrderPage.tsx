import React, { useState } from "react";
import { createOrder } from "../../api/product/productApi.ts"; // import API ที่ใช้
import '../../styles/stock/CreateOrderPage.css'

const CreateOrderPage: React.FC = () => {
    const [productId, setProductId] = useState<string>("");
    const [quantity, setQuantity] = useState<number>(0);
    const [supplier, setSupplier] = useState<string>("");
    const [location, setLocation] = useState<string>("");
    const [message, setMessage] = useState<string>("");

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        try {
            const newOrder = { productId, quantity, supplier, location };

            // เรียกใช้ API สร้างใบสั่งซื้อ
            const response = await createOrder(newOrder);
            setMessage(response.data.message); // แสดงข้อความจาก API
        } catch (error) {
            console.error("Error creating order:", error);
            setMessage("เกิดข้อผิดพลาดในการสร้างใบสั่งซื้อ");
        }
    };

    return (
        <div className="create-order-container">
            <h2 className="create-order-header">สร้างใบสั่งซื้อสินค้า</h2>
            <form className="create-order-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label">Product ID:</label>
                    <input
                        className="form-input"
                        type="text"
                        value={productId}
                        onChange={(e) => setProductId(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Quantity:</label>
                    <input
                        className="form-input"
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        min={1}
                        required
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Supplier:</label>
                    <input
                        className="form-input"
                        type="text"
                        value={supplier}
                        onChange={(e) => setSupplier(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Location:</label>
                    <input
                        className="form-input"
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        required
                    />
                </div>
                <button className="submit-btn" type="submit">สร้างใบสั่งซื้อ</button>
            </form>
            {message && <p className="message">{message}</p>}
        </div>
    );
};

export default CreateOrderPage;
