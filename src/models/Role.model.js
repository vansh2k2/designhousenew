const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    createdBy: {
      type: String,
      default: 'Admin User'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Role', roleSchema);
