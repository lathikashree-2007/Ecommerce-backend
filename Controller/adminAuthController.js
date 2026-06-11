const Admin = require('../Models/AdminModel'); // Double check if your folder is named "models" or "Models"
const jwt = require('jsonwebtoken');

// 🛡️ 1. REGISTER ROOT CONTROLLER
const registerAdmin = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Safety fallback check to prevent system crashes if Postman body is empty
    if (!email || !password) {
      return res.status(400).json({ error: "Missing required fields: email and password are required." });
    }

    const exists = await Admin.findOne({ email });
    if (exists) {
      return res.status(400).json({ error: 'Admin already registered' });
    }

    // Creating the administrator profile document
    const admin = await Admin.create({ name, email, password, role });
    return res.status(201).json({ message: 'Admin created successfully', adminId: admin._id });

  } catch (err) {
    return res.status(500).json({ error: "Controller execution failed", details: err.message });
  }
};

// 🔑 2. LOGIN ADMIN CONTROLLER
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Please provide both email and password." });
    }

    const admin = await Admin.findOne({ email });
    
    // Safety check to ensure comparePassword is a method built into your Admin schema
    if (admin && typeof admin.comparePassword === 'function' && (await admin.comparePassword(password))) {
      const token = jwt.sign(
        { id: admin._id, role: admin.role }, 
        process.env.JWT_SECRET || 'FASHIONHUB_SECRET', 
        { expiresIn: '1d' }
      );
      
      return res.json({ 
        token, 
        admin: { name: admin.name, email: admin.email, role: admin.role } 
      });
    } else {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }
  } catch (err) {
    return res.status(500).json({ error: "Controller execution failed", details: err.message });
  }
};

// Explicit module export assignment block
module.exports = { 
  registerAdmin, 
  loginAdmin 
};