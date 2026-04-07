const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    h1Title: {
      type: String,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
    },

    excerpt: {
      type: String,
      required: true,
    },

    content: {
      type: String,
      required: true,
    },

    image: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    author: {
      type: String,
      default: "Design House Team",
    },

    readTime: {
      type: String,
      default: "5 min read",
    },

    tags: {
      type: [String],
      default: [],
    },

    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },

    featured: {
      type: Boolean,
      default: false,
    },

    metaTitle: {
      type: String,
      maxLength: 65,
    },

    metaDescription: {
      type: String,
      maxLength: 155,
    },

    imageAlt: {
      type: String,
    },

    ogTitle: {
      type: String,
    },

    ogDescription: {
      type: String,
    },

    ogImage: {
      type: String,
    },

    canonicalTag: {
      type: String,
    },

    schemaMarkup: {
      type: String,
    },

    openGraphTags: {
      type: String,
    },
    metaKeywords: {
      type: String,
    },

    views: {
      type: Number,
      default: 0,
    },

    publishedAt: {
      type: Date,
    },
    
    updatedBy: {
      type: String,
      default: "Admin User",
      trim: true
    },
  },
  { timestamps: true }
);

// ✅ FIXED: pre-save hook (NO next())
blogSchema.pre("save", function () {
  if (this.status === "published" && !this.publishedAt) {
    this.publishedAt = new Date();
  }
});

module.exports = mongoose.model("Blog", blogSchema);
