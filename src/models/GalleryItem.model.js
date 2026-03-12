const mongoose = require("mongoose");

const GalleryItemSchema = new mongoose.Schema(
    {
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "PortfolioCategory",
            required: true,
        },
        subcategory: {
            type: String,
        },
        title: {
            type: String,
            required: true,
        },
        highlightText: {
            type: String,
        },
        shortDescription: {
            type: String,
        },
        number: {
            type: String,
        },
        buttonText: {
            type: String,
            default: "VIEW DETAILS",
        },
        buttonUrl: {
            type: String,
        },
        slug: {
            type: String,
            unique: true,
        },
        mainImage: {
            type: String,
            required: true,
        },
        mainImageAltText: {
            type: String,
        },
        status: {
            type: String,
            enum: ["Active", "Inactive"],
            default: "Active",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("GalleryItem", GalleryItemSchema);
