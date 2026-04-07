const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    username: { 
      type: String, 
      required: true, 
      unique: true, 
      trim: true 
    },
    email: { 
      type: String, 
      unique: true, 
      trim: true,
      lowercase: true,
      sparse: true
    },
    password: { 
      type: String, 
      required: true 
    },
    role: {
      type: String,
      default: 'Editor'
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active'
    },
    isActive: {  // ✅ ADD THIS FIELD
      type: Boolean,
      default: true
    },
    lastLogin: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Admin", adminSchema);