const mongoose = require("mongoose");

const PortfolioCategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        subcategories: [
            {
                name: {
                    type: String,
                    required: true,
                },
                slug: {
                    type: String,
                },
            },
        ],
        status: {
            type: String,
            enum: ["Active", "Inactive"],
            default: "Active",
        },
        updatedBy: {
            type: String,
            default: "Admin User",
            trim: true
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("PortfolioCategory", PortfolioCategorySchema);
