const mongoose = require("mongoose");

const customPageSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        highlightedTitle: {
            type: String,
            trim: true,
        },
        shortDescription: {
            type: String,
            required: true,
            trim: true,
        },
        postDescription: {
            type: String,
            required: true,
        },
        permalink: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        serviceCategory: {
            type: String,
            required: true,
        },
        location: {
            type: String,
            trim: true,
        },
        mainImage: {
            url: { type: String, required: true },
            altTag: { type: String, default: "" },
        },
        galleryImages: [
            {
                url: { type: String },
                altTag: { type: String, default: "" },
            },
        ],
        seo: {
            metaTitle: { type: String, maxLength: 65 },
            metaKeywords: { type: String },
            metaDescription: { type: String, maxLength: 155 },
            ogTitle: { type: String },
            ogDescription: { type: String, trim: true },
            ogImage: { type: String, trim: true },
            canonicalTag: { type: String, trim: true },
            schemaMarkup: { type: String, trim: true },
            openGraphTags: { type: String, trim: true }
        },
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "inactive",
        },
        views: {
            type: Number,
            default: 0,
        },
        updatedBy: {
            type: String,
            default: "Admin User",
            trim: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("CustomPage", customPageSchema);
