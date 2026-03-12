const mongoose = require("mongoose");

const socialMediaSchema = new mongoose.Schema(
    {
        facebook: {
            type: String,
            default: "",
            trim: true,
        },
        instagram: {
            type: String,
            default: "",
            trim: true,
        },
        twitter: {
            type: String,
            default: "",
            trim: true,
        },
        linkedin: {
            type: String,
            default: "",
            trim: true,
        },
        youtube: {
            type: String,
            default: "",
            trim: true,
        },
        whatsappNumber: {
            type: String,
            default: "",
            trim: true,
        },
        whatsappMessage: {
            type: String,
            default: "Hello! I would like to know more about your interior design services.",
            trim: true,
        },
        callNumber: {
            type: String,
            default: "",
            trim: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("SocialMedia", socialMediaSchema);
