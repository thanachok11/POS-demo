import React, { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

interface StockItem {
    _id: string;
    barcode: string;
    salePrice:string;
    productId: {
        _id: string;
        name: string;
        category?: { name: string };
        price?: number;
    };
}

interface BarcodeCardProps {
    item: StockItem;
    options: {
        format: string;
        width: number;
        height: number;
        displayValue: boolean;
    };
    onClick: (item: StockItem) => void;
}

const BarcodeCard: React.FC<BarcodeCardProps> = ({ item, options, onClick }) => {
    const barcodeRef = useRef<SVGSVGElement | null>(null);

    useEffect(() => {
        if (barcodeRef.current) {
            JsBarcode(barcodeRef.current, item.barcode, {
                ...options,
                text: item.barcode, // ให้แสดงตัวเลข barcode ด้วย
                fontSize: 14
            });
        }
    }, [item.barcode, options]);

    return (
        <div className="barcode-card" onClick={() => onClick(item)}>
            {/* ชื่อสินค้า */}
            <h3 className="barcode-name">{item.productId.name}</h3>

            {/* หมวดหมู่ */}
            <p className="barcode-category">
                หมวดหมู่: <span>{item.productId.category?.name || "-"}</span>
            </p>

            {/* Barcode */}
            <div className="barcode-wrapper">
                <svg ref={barcodeRef}></svg>
            </div>

            {/* ราคา */}
            <p className="barcode-price">
                ราคา <span>฿{Number(item.salePrice || 0).toFixed(2)}</span>
            </p>

        </div>
    );
};

export default BarcodeCard;
