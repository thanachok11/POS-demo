export interface Category {
    _id: string;
    name: string;
}

export interface Product {
    _id: string;
    barcode: string;
    name: string;
    price: number;
    totalQuantity: number;
    category: Category;
    imageUrl: string;
}

export interface StockItem {
    barcode: string;
    totalQuantity:number;
 
    salePrice:number;
    costPrice:number;
    status: string;
    supplier: string;
    productId: Product;
    isActive:string;
}

export interface PaymentItem {
    barcode: string;
    name: string;
    price: number;
    totalQuantity: number;
    subtotal: number;
}

export interface PaymentData {
    saleId: string;
    employeeName: string;
    paymentMethod: "เงินสด" | "โอนเงิน" | "บัตรเครดิต" | "QR Code";
    amount: number;
    amountReceived: number;
    change: number;
    items: PaymentItem[];
}
