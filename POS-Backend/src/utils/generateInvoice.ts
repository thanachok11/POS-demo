// utils/generateInvoice.ts
let invoiceCounter = 1;

export const generateInvoiceNumber = (): string => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    const number = String(invoiceCounter).padStart(4, "0");
    invoiceCounter++;

    return `INV-${year}${month}${day}-${number}`;
};
