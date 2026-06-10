const express = require('express');
const router = express.Router();
const { registerAdmin, loginAdmin } = require('../Controller/adminAuthController');

// Make sure these match the names above exactly
router.post('/register-root', registerAdmin);
router.post('/login', loginAdmin);

module.exports = router;