// src/types.ts
export interface Supplier {
    id: number;
    companyName: string;
    phoneNumber: string;
    email: string;
    address: string;
    country: string;
    stateOrProvince: string;
    district?: string;  // optional
    subDistrict: string;
    postalCode?: string; // optional
}
