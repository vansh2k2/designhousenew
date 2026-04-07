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
        displayNumber: {
            type: String,
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        bannerTitle: {
            type: String,
            trim: true,
            default: "",
        },
        bannerHighlightText: {
            type: String,
            trim: true,
            default: "",
        },
        description: {
            type: String,
            trim: true,
            default: "",
        },
        mainImage: {
            type: String,
        },
        heroImage: {
            type: String,
        },
        heroImageAltText: {
            type: String,
            default: "Hero Image",
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
        updatedBy: {
            type: String,
            default: "Admin User",
            trim: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("PortfolioGallery", portfolioGallerySchema);
