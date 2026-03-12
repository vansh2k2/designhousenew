const mongoose = require("mongoose");

const portfolioGallerySchema = new mongoose.Schema(
    {
        category: {
            type: String,
            required: true,
            trim: true,
        },
        subCategory: {
            type: String,
            trim: true,
            default: "",
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        highlightText: {
            type: String,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        displayNumber: {
            type: String,
            trim: true,
        },
        buttonLabel: {
            type: String,
            default: "View Details",
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        mainImage: {
            type: String,
            required: true,
        },
        altText: {
            type: String,
            default: "Portfolio Image",
        },
        galleryImages: [
            {
                image: String,
                altText: String,
            },
        ],
        status: {
            type: String,
            enum: ["Active", "Inactive"],
            default: "Active",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("PortfolioGallery", portfolioGallerySchema);
