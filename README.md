# POS
# POS Frontend System

Welcome to the POS (Point of Sale) Frontend System! This is a user interface (UI) for managing products and interacting with the backend system. It includes features like searching products by barcode and viewing detailed product information.

## Features

- **Product List**: View a list of all products including name, description, price, category, barcode, and stock.
- **Barcode Lookup**: Search for products using barcode input or image scanning.
- **Responsive UI**: Fully responsive design for mobile and desktop users.
- **Add New Product**: Form to add new products with details like name, price, description, category, barcode, and stock quantity.

1. Clone this repository:
```bash
git clone https://github.com/thanachok11/POS.git
cd POS-Frontend
```

2. Install the dependencies:
```bash
npm install @zxing/library
npm install jwt-decode@latest
npm install react-router-dom
npm install @fortawesome/react-fontawesome
npm install @fortawesome/free-solid-svg-icons
npm install chart.js react-chartjs-2
npm install @react-oauth/google
npm install 
```
3. Start the server:

```bash
npm start
```
# POS Backend System

Welcome to the POS (Point of Sale) Backend System! This is a full-featured backend service for managing products, including functionality for barcode-based product lookups and inventory management.

## Features

- **Product Management**: Add, update, delete, and retrieve product details.
- **Barcode Lookup**: Search products by barcode.
- **Product Details**: View detailed product information including name, description, price, category, stock quantity, and barcode.

## Table of Contents

1. [Installation](#installation)
2. [API Endpoints](#api-endpoints)
    - [Get All Products](#get-all-products)
    - [Get Product by Barcode](#get-product-by-barcode)
3. [Usage](#usage)
4. [Technologies Used](#technologies-used)
5. [License](#license)

---

## Installation

Follow these steps to set up the backend system locally.

### Prerequisites

Ensure that you have the following installed on your machine:

- [Node.js](https://nodejs.org/en/) (>= 14.0)
- [MongoDB](https://www.mongodb.com/) (or use a cloud database like MongoDB Atlas)
  
### Steps

1. Clone this repository:

    ```bash
    git clone https://github.com/thanachok11/POS.git
    cd POS-Backend
    ```

2. Install the dependencies:

    ```bash
    npm install
    npm install multer
    npm install google-auth-library
    npm install @types/multer
    npm install cloudinary
    npm install express body-parser cors dotenv
    npm install --save-dev typescript @types/node @types/express ts-node nodemon
    ```

3. Set up your environment variables:
   Create a `.env` file in the root directory and add the following:

    ```bash
    MONGODB_URI=your-mongodb-uri
    JWT_SECRET
    CLOUDINARY_CLOUD_NAME
    CLOUDINARY_API_KEY
    CLOUDINARY_API_SECRET
    PORT=5000
    ```

4. Start the server:
    ```bash
    npm run dev
    ```
The backend should now be running on `http://localhost:5000`.

---

## API Endpoints

### Get All Products

- **Endpoint**: `/api/products`
- **Method**: `GET`
- **Description**: Fetch all products from the database.

#### Response

```json
[
  {
    "_id": "productId",
    "name": "Product Name",
    "description": "Product Description",
    "price": 29.99,
    "category": "Category Name",
    "image": "http://example.com/product-image.jpg",
    "stock": 100,
    "barcode": "1234567890123",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  ...
]
