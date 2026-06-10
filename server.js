require('dotenv').config(); // Load hidden credentials from your .env file
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Product = require('./models/Product'); // Import your Mongoose blueprint

const app = express();

// ==========================================
// MIDDLEWARE CONFIGURATION
// ==========================================
app.use(cors()); // Allows your React frontend to communicate with this backend
app.use(express.json()); // Parses incoming JSON request bodies (crucial for Postman)

app.use('/api/admin', require('./routes/adminRoutes'));

// 👥 ✅ FIXED: Pointing exactly to your real 'authRoutes.js' file layout
app.use('/api/users', require('./routes/authRoutes')); 

// ==========================================
// DATABASE CONNECTION (MONGODB ATLAS)
// ==========================================
// This checks for BOTH common naming styles to ensure it matches your .env file perfectly
const MONGO_URI = process.env.MONGO_URI || process.env.MONGO_URL;

if (!MONGO_URI) {
  console.error("❌ Error: Database connection string is missing from your .env file!");
  console.log("Please check that your .env file contains either MONGO_URI=... or MONGO_URL=...");
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("==========================================");
    console.log(" Successfully connected to MongoDB Atlas!");
    console.log(`Connected Database: ${mongoose.connection.name}`);
    console.log("==========================================");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
  });

// ==========================================
// API ROUTES
// ==========================================

// 1. GET ALL PRODUCTS FROM MONGODB
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find({}); // Fetches every single item from your Atlas cluster
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products from database", details: err.message });
  }
});

// 2. 💡 FIXED BULK & SINGLE PRODUCT UPLOADER
app.post('/api/products', async (req, res) => {
  try {
    // Check if Postman is sending a bulk list array [...]
    if (Array.isArray(req.body)) {
      const savedProducts = await Product.insertMany(req.body);
      return res.status(201).json({ 
        message: `Successfully batch-saved ${savedProducts.length} products to Atlas!`, 
        products: savedProducts 
      });
    } 
    
    // Otherwise, fallback to saving a single product object {}
    const newProduct = new Product(req.body); // Validates data against your models/Product.js Schema
    const savedProduct = await newProduct.save(); // Saves it permanently to your cloud database
    res.status(201).json({ message: "Single product saved to Atlas!", product: savedProduct });
    
  } catch (err) {
    res.status(400).json({ error: "Failed to add product(s)", details: err.message });
  }
});

// 3. DELETE A PRODUCT 
app.delete('/api/products/:id', async (req, res) => {
  try {
    // MongoDB uses its auto-generated alphanumeric '_id' instead of manual numerical ids
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    
    if (!deletedProduct) {
      return res.status(404).json({ error: "Product not found inside your database records" });
    }
    
    res.json({ message: "Product dropped from database cluster successfully!" });
  } catch (err) {
    res.status(500).json({ error: "Invalid ID layout or deletion error", details: err.message });
  }
});

// ==========================================
// SERVER INITIALIZATION
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});