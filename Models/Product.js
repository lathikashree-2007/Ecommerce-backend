const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  oldPrice: { type: Number },
  discount: { type: Number },
  rating: { type: Number, default: 4.0 },
  reviews: { type: Number, default: 0 },
  size: { type: [String], default: ["M", "L"] },
  color: { type: [String] },
  brand: { type: String },
  img: { type: String, default: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600" },
  tag: { type: String },
  salesCount: { type: Number, default: 0 },
  desc: { type: String }
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

module.exports = mongoose.model('Product', ProductSchema);