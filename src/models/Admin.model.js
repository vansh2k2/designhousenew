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
      sparse: true  // ✅ Email optional ho jayega
    },
    password: { 
      type: String, 
      required: true 
    },
    role: {
      type: String,
      enum: ['Super Admin', 'Content Manager', 'Editor'],
      default: 'Editor'
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active'
    },
    lastLogin: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Admin", adminSchema);