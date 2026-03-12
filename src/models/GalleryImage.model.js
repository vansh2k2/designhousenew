const mongoose = require("mongoose");

const GalleryImageSchema = new mongoose.Schema(
    {
        galleryItem: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "GalleryItem",
            required: true,
        },
        images: [
            {
                url: {
                    type: String,
                    required: true,
                },
                altText: {
                    type: String,
                    default: "",
                },
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model("GalleryImage", GalleryImageSchema);
