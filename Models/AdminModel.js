const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const AdminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['Super Admin', 'Product Manager', 'Order Manager'], 
    default: 'Product Manager' 
  }
}, { timestamps: true });

// 🕵️‍♂️ UPDATED PRE-SAVE HOOK (Removed 'next' to avoid runtime collision)
AdminSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  
  this.password = await bcrypt.hash(this.password, 10);
});

AdminSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('Admin', AdminSchema);