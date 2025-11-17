#### 🌱 Organic Food Traceability System

A transparent way to trace organic food from farm to table.

The Organic Food Traceability System provides end-to-end visibility for organic food products using a digital supply-chain tracking workflow. Built with React, Node.js, and Supabase, this system allows farmers, distributors, retailers, and consumers to verify food authenticity and ensure transparency.


### 📖 About the Project

Consumers often face difficulty verifying whether a product is genuinely organic. Farmers and retailers lack transparent systems to document the journey of food items.

This project solves that by enabling:

✔ Tracking a product’s journey from the farm → processing → packaging → distribution → retailer → consumer
✔ Providing authenticity verification
✔ Storing data securely using Supabase
✔ A clean and modern React UI for interaction
✔ Node.js APIs for backend integration

### ✨ Features
## 🔗 Product Traceability

Track complete supply-chain history

View all stages of a product’s lifecycle

## 📦 Product Management

Add new organic products

Edit/update product details

Delete unwanted entries

## 🗂 Supabase Database Integration

Real-time database

Secure authentication (optional)

Smart storage for supply chain events

## 📊 Interactive Dashboard

Displays product categories, certifications, origins

Visual traceability flow

- 🧾 Certification Tracking

Organic, USDA, FSSAI, etc.

Document verification support

### 🛠 Installation
1️⃣ Clone the repository
git clone https://github.com/your-username/organic-food-traceability.git
cd organic-food-traceability

2️⃣ Install client dependencies
cd client
npm install

3️⃣ Install server dependencies
cd ../server
npm install

### 🔐 Environment Variables

Create a .env file in both client and server directories.

Client (.env)
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_KEY=your_public_key

Server (.env)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_secret_key
PORT=5000

▶️ Running the Project
Start Backend
cd server
npm start

Start Frontend
cd client
npm start

### Local URLs

Frontend: http://localhost:3000

Backend: http://localhost:5000

#### 🚀 Future Enhancements

- Blockchain smart contract integration

- QR code scanning for instant product traceability

- RFID/IoT sensor integration

- AI-based freshness prediction

- Role management: Farmer / Distributor / Retailer / Consumer

- Export traceability report as PDF

