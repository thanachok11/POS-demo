// src/types/receipt.ts

export interface Item {
    barcode: string;
    name: string;
    price: number;
    totalQuantity: number;
    quantity:string;
    subtotal: number;
    _id: string;
}

export interface Payment {
    _id: string;
    saleId: string;
    employeeName: string;
    paymentMethod: string;
    amount: number;
    status: string;
    createdAt: string;
}

export interface Receipt {
    _id: string;
    paymentId: string | Payment; 
    employeeName: string;
    isReturn:string;
    items: Item[];
    totalPrice: number;
    paymentMethod: string;
    amountPaid: number;
    changeAmount: number;
    discount:number;
    timestamp: string;
    returnReason:string;
}
