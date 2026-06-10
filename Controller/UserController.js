const User = require('../models/UserModel');
const jwt = require('jsonwebtoken');

// ==========================================
// 📝 1. USER & ADMIN REGISTRATION (SIGN UP)
// ==========================================
const SignUpUser = async (req, res) => {
    try {
        // Added 'role' to the destructured body parameters
        const { firstname, lastname, email, phone, password, role } = req.body;
        
        // Safety check to ensure the user doesn't already exist
        const userExists = await User.findOne({ email: email.toLowerCase() });
        if (userExists) {
            return res.status(400).json({ message: "An account with this email already exists." });
        }

        const newUser = new User({
            firstname,
            lastname,
            email: email.toLowerCase(), // Store in lowercase to prevent case-sensitivity bugs
            phone,
            password,
            role: role || 'user' // 💡 If no role is passed, it defaults to a regular 'user'
        });

        const savedUser = await newUser.save();
        res.status(201).json({
            message: 'User registered successfully',
            data: savedUser,
        });
    } catch (error) {
        res.status(400).json({ // Changed to 400 Bad Request for validation/parsing errors
            message: "Error Registering User",
            error: error.message,
        });
    }
};

// ==========================================
// 🔑 2. UNIFIED LOGIN ENGINE (USER & ADMIN BRANCH)
// ==========================================
const LoginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Please fill in all fields." });
        }

        // Find the user by email
        const user = await User.findOne({ email: email.toLowerCase() });

        // Verify user exists and check password via schema method
        // (Note: ensure your UserModel has a password comparison method like user.comparePassword)
        if (user && (await user.comparePassword(password))) {
            
            // Sign a JWT token containing their user ID and their assigned cluster role
            const token = jwt.sign(
                { id: user._id, role: user.role }, 
                process.env.JWT_SECRET || 'FASHIONHUB_SECRET', 
                { expiresIn: '1d' }
            );

            // Send back the token along with details the frontend router needs
            return res.status(200).json({
                token,
                user: {
                    id: user._id,
                    name: `${user.firstname} ${user.lastname}`,
                    email: user.email,
                    role: user.role || 'user' // 💡 CRITICAL: Hands role over to React Application.jsx
                }
            });
        } else {
            return res.status(401).json({ message: "Invalid email or password configuration." });
        }

    } catch (error) {
        res.status(500).json({
            message: "Internal server login execution failure",
            error: error.message
        });
    }
};

// Export BOTH functions clearly as an object group
module.exports = {
    SignUpUser,
    LoginUser
};