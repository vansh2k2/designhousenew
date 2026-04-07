const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: false, // ✅ NOW OPTIONAL
      trim: true,
      default: "#", // ✅ DEFAULT VALUE IF NOT PROVIDED
    },
    image: {
      type: String,
      required: true,
    },
    altText: {
      type: String,
      required: false,
      default: "Client Logo",
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    showOnHomepage: {
      type: Boolean,
      default: false,
    },
    updatedBy: {
      type: String,
      default: "Admin User",
      trim: true
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Client", clientSchema);