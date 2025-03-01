import React, { useState, useEffect } from "react";
import { createOrder } from "../../api/product/productApi.ts"; // import API ที่ใช้
import { getSupplierData, getProductsBySupplier } from "../../api/utils/supplierApi.ts"; // import API สำหรับ suppliers
import '../../styles/stock/CreateOrderPage.css';

const CreateOrderPage: React.FC = () => {
    const [productId, setProductId] = useState<string>("");
    const [quantity, setQuantity] = useState<number>(0);
    const [supplier, setSupplier] = useState<string>("");
    const [location, setLocation] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    const [suppliers, setSuppliers] = useState<any[]>([]); // รายชื่อ suppliers
    const [products, setProducts] = useState<any[]>([]); // สินค้าใน supplier ที่เลือก
    const [loading, setLoading] = useState<boolean>(true); // สถานะการโหลด
    const [error, setError] = useState<string>(""); // ข้อผิดพลาด
    const [searchQuery, setSearchQuery] = useState<string>(""); // สำหรับการค้นหาชื่อ Supplier

    // ดึงข้อมูล suppliers เมื่อ component โหลด
    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("❌ No token found");
                setLoading(false);
                return;
            }

            try {
                // ดึงข้อมูล suppliers
                const suppliersData = await getSupplierData(token);
                setSuppliers(suppliersData); // ตั้งค่ารายชื่อ suppliers
                setLoading(false); // เปลี่ยนสถานะการโหลด
            } catch (error) {
                console.error("Error fetching suppliers:", error);
                setError("❌ Error fetching suppliers");
                setLoading(false); // เปลี่ยนสถานะการโหลด
            }
        };

        fetchData();
    }, []);

    // เมื่อ supplier เปลี่ยน ให้ดึงสินค้าจาก supplier นั้น
    useEffect(() => {
        if (supplier) {
            const fetchProducts = async () => {
                try {
                    const token = localStorage.getItem("token");
                    if (!token) {
                        setError("❌ No token found");
                        return;
                    }

                    const response = await getProductsBySupplier(supplier, token);
                    setProducts(response); // set สินค้าใน supplier ที่เลือก
                } catch (error) {
                    console.error("Error fetching products:", error);
                    setError("❌ Error fetching products");
                }
            };

            fetchProducts();
        }
    }, [supplier]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        try {
            const newOrder = { productId, quantity, supplier, location };

            // เรียกใช้ API สร้างใบสั่งซื้อ
            const response = await createOrder(newOrder);
            setMessage(response.message); // แสดงข้อความจาก API
        } catch (error) {
            console.error("Error creating order:", error);
            setMessage("เกิดข้อผิดพลาดในการสร้างใบสั่งซื้อ");
        }
    };

    const filteredSuppliers = suppliers.filter(supplier => supplier.companyName.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="create-order-container-suppliers">
            <h2 className="create-order-header-suppliers">สร้างใบสั่งซื้อสินค้า</h2>

            {/* แสดงสถานะการโหลดหรือข้อผิดพลาด */}
            {loading && <p className="loading-message-suppliers">กำลังโหลดข้อมูล...</p>}
            {error && <p className="error-message-suppliers">{error}</p>}

            {/* ช่องค้นหาสำหรับเลือก Supplier */}
            <div className="search-container-suppliers">
                <label className="form-label-suppliers">ค้นหา Supplier:</label>
                <input
                    className="search-input-suppliers"
                    type="text"
                    placeholder="ค้นหาจากชื่อ Supplier"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* แสดงช่องเลือก Supplier เท่านั้น */}
            <div className="form-group-suppliers">
                <label className="form-label-suppliers">Supplier:</label>
                <select
                    className="form-input-suppliers"
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    required
                >
                    <option value="">เลือก Supplier</option>
                    {filteredSuppliers.map((supplier) => (
                        <option key={supplier._id} value={supplier._id}>
                            {supplier.companyName}
                        </option>
                    ))}
                </select>
            </div>

            {/* หลังจากเลือก Supplier แล้วจึงแสดงช่องเลือกสินค้า */}
            {supplier && (
                <form className="create-order-form-suppliers" onSubmit={handleSubmit}>
                    {/* ช่องเลือกสินค้า */}
                    <div className="form-group-suppliers">
                        <label className="form-label-suppliers">Product:</label>
                        <select
                            className="form-input-suppliers"
                            value={productId}
                            onChange={(e) => setProductId(e.target.value)}
                            required
                        >
                            <option value="">เลือกสินค้า</option>
                            {products.map((product) => (
                                <option key={product.id} value={product.id}>
                                    {product.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* แสดงรายละเอียดสินค้าในตาราง */}
                    {productId && (
                        <div className="product-details-suppliers">
                            <h3>รายละเอียดสินค้า</h3>
                            <table>
                                <thead>
                                    <tr>
                                        <th>ชื่อสินค้า</th>
                                        <th>ราคา</th>
                                        <th>รายละเอียด</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products
                                        .filter(product => product.id === productId)
                                        .map((product) => (
                                            <tr key={product.id}>
                                                <td>{product.name}</td>
                                                <td>{product.price}</td>
                                                <td>{product.description}</td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="form-group-suppliers">
                        <label className="form-label-suppliers">Quantity:</label>
                        <input
                            className="form-input-suppliers"
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                            min={1}
                            required
                        />
                    </div>
                    <div className="form-group-suppliers">
                        <label className="form-label-suppliers">Location:</label>
                        <input
                            className="form-input-suppliers"
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            required
                        />
                    </div>
                    <button className="submit-btn-suppliers" type="submit">สร้างใบสั่งซื้อ</button>
                </form>
            )}

            {message && <p className="message-suppliers">{message}</p>}
        </div>
    );
};

export default CreateOrderPage;
