import React from "react";

interface Props {
    productData: any;
    categories: any[];
    imagePreview: string | null;
    onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    setShowCategoryModal: (open: boolean) => void;
}

const ProductFormSection: React.FC<Props> = ({
    productData,
    categories,
    imagePreview,
    onImageChange,
    onInputChange,
    setShowCategoryModal
}) => {
    return (
        <div className="add-product-form-column">
            <h3>สินค้า</h3>
            <div className="add-product-form-group">
                <label className="add-product-form-label">ชื่อสินค้า:</label>
                <input
                    type="text"
                    name="name"
                    value={productData.name}
                    onChange={onInputChange}
                    className="add-product-form-input"
                    required
                />
            </div>
            <div className="add-product-form-group">
                <label className="add-product-form-label">รายละเอียด:</label>
                <input
                    type="text"
                    name="description"
                    value={productData.description}
                    onChange={onInputChange}
                    className="add-product-form-input"
                    required
                />
            </div>
            <div className="add-product-form-group">
                <label className="add-product-form-label">หมวดหมู่:</label>
                <select
                    name="category"
                    value={productData.category}
                    onChange={(e) => {
                        if (e.target.value === "custom") setShowCategoryModal(true);
                        else onInputChange(e);
                    }}
                    className="add-product-form-input"
                    required
                >
                    <option value="">-- เลือกหมวดหมู่ --</option>
                    {categories.map((c) => (
                        <option key={c._id} value={c._id}>
                            {c.name}
                        </option>
                    ))}
                    <option value="custom">➕ เพิ่มหมวดหมู่ใหม่</option>
                </select>
            </div>
            <div className="add-product-form-group">
                <label className="add-product-form-label">บาร์โค้ด:</label>
                <input
                    type="text"
                    name="barcode"
                    value={productData.barcode}
                    onChange={onInputChange}
                    className="add-product-form-input"
                    placeholder="ถ้าไม่มี barcode ระบบจะสร้างให้"
                />
            </div>
            <div className="add-product-form-group">
                <label className="add-product-form-label">รูปภาพ:</label>
                <input
                    type="file"
                    onChange={onImageChange}
                    className="add-product-form-input"
                    accept="image/*"
                    required
                />
                {imagePreview && (
                    <img src={imagePreview} alt="preview" className="add-product-image-preview" />
                )}
            </div>
        </div>
    );
};

export default ProductFormSection;
