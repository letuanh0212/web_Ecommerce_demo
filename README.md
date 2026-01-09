# Multi-Store E-Commerce Web Application

## Overview

This project is a **Multi-Store E-Commerce Web Application** developed as a Major Project for the Information Technology program at Ho Chi Minh City University of Technology. The system allows multiple sellers to operate stores on a single platform while serving customers and administrators with clearly separated roles and permissions.

The application follows a **3-tier architecture** with a modern tech stack, supports online payments via **VNPay**, fast searching using **Elasticsearch**, and basic **product recommendation** features.

---

## Key Features

### 👤 Customer (User)

* Register, login, and manage account information
* Browse products by category and store
* Search products with Elasticsearch
* View product details and store information
* Add products to cart and manage cart items
* Place orders with COD or VNPay payment
* Receive order confirmation via email
* View order history and order status
* Like and view store articles

### 🏪 Seller

* Register and manage a single store
* Manage store profile and articles
* Manage product catalog and product variants
* Upload and manage product images
* Create and manage vouchers
* View and process store orders
* Update order status
* View store statistics and dashboard

### 🛠️ Admin

* Manage users, sellers, and stores
* Manage global product categories
* Manage all products and articles
* Monitor orders and system activity
* Manage vouchers and system access control

---

## System Architecture

The system is built using a **three-tier architecture**:

1. **Presentation Layer (Front-end)**: ReactJS (SPA)
2. **Business Logic Layer (Back-end)**: Node.js + Express (RESTful API)
3. **Data Layer**: Microsoft SQL Server

```
User / Seller / Admin
        ↓
     Front-end
        ↓
    RESTful API
        ↓
      Back-end
        ↓
      Database
```

---

## Technology Stack

### Front-end

* ReactJS 18
* Vite
* React Router DOM
* Axios
* Ant Design, Material UI (MUI), Emotion
* Recharts

### Back-end

* Node.js
* Express.js
* JWT (jsonwebtoken)
* bcrypt
* mssql
* dotenv
* nodemailer
* VNPay SDK
* Elasticsearch Client
* Natural (TF-IDF recommendation)

### Database

* Microsoft SQL Server
* SQL Server Management Studio (SSMS)

### Search & Recommendation

* Elasticsearch (Product search)
* Natural + TF-IDF (Basic recommendation)

### Development Tools

* Visual Studio Code
* Git & GitHub

---

## Installation & Setup

### 1. Database Setup

* Install **Microsoft SQL Server**
* Use **SSMS** to create the database
* Create tables according to the designed schema
* Configure database connection in the back-end `.env` file

### 2. Elasticsearch Setup

* Download Elasticsearch compatible with your OS
* Start Elasticsearch:

```
bin/elasticsearch
```

* Verify Elasticsearch is running at:

```
http://localhost:9200
```

### 3. Back-end Setup

```bash
cd backend
npm install
npm run dev
```

Configure the `.env` file with:

* Database credentials
* JWT secret
* VNPay configuration
* Email service settings

### 4. Front-end Setup

```bash
cd frontend
npm install
npm run dev
```

---

## Payment Integration

* Supports **Cash on Delivery (COD)**
* Supports **VNPay Online Payment**
* Secure payment flow with automatic order status update

---

## Project Scope

* Designed for **small to medium-sized businesses**
* Responsive web interface (mobile-friendly)
* Mobile applications (React Native / Flutter) planned for future versions

---

## Limitations & Future Development

* No dedicated mobile application yet
* Recommendation system is basic and can be improved with advanced AI/ML
* More payment gateways can be integrated in the future

---

## Contributors

* **Le Tuan Anh** – 2280600066
* **Tran Dai Nhan** – 2280602187
* **Pham Dinh Hieu** – 2280600968

Class: 22DTHQA2

---

## Supervisor

* **Dr. Le Thi Ngoc Tho**

---

## License

This project is developed for academic purposes.

---

## Acknowledgements

Special thanks to **Dr. Le Thi Ngoc Tho** for her guidance and support throughout the project development.
