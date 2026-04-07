const Blog = require("../models/Blog.model");
const { logActivity } = require('./activityLog.controller');
const path = require("path");
const fs = require("fs");

exports.createBlog = async (req, res) => {
  try {

    console.log("📝 CREATE BLOG STARTED");
    console.log("Body:", req.body);
    console.log("File:", req.file);
    console.log("File path:", req.file?.path);
    console.log("File filename:", req.file?.filename);

    const {
      title,
      excerpt,
      content,
      category,
      author,
      readTime,
      tags,
      status,
      featured,
      metaTitle,
      metaDescription,
      slug,
      imageAlt,
      ogTitle,
      ogDescription,
      openGraphTags,
      canonicalTag,
      schemaMarkup,
      h1Title,
      metaKeywords,
    } = req.body;

    // ✅ ENHANCED Validation
    const missingFields = [];
    if (!title || title.trim() === "") missingFields.push("title");
    if (!excerpt || excerpt.trim() === "") missingFields.push("excerpt");
    if (!content || content.trim() === "") missingFields.push("content");
    if (!category || category.trim() === "") missingFields.push("category");

    if (missingFields.length > 0) {
      console.error("❌ Missing required fields:", missingFields);
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
        missingFields,
      });
    }

    if (!req.files || !req.files.image) {
      console.error("❌ No blog image file uploaded");
      return res.status(400).json({
        success: false,
        message: "Please upload a blog image",
      });
    }

    const blogImageFile = req.files.image[0];
    const ogImageFile = req.files.ogImage ? req.files.ogImage[0] : null;

    // ✅ Validate file exists locally
    if (!fs.existsSync(blogImageFile.path)) {
      console.error("❌ Uploaded blog image not found:", blogImageFile.path);
      return res.status(400).json({
        success: false,
        message: "Uploaded blog image not found. Please try again.",
      });
    }

    // ✅ Generate slug with better logic
    const finalSlug = slug ||
      `${title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")}-${Date.now()}`;

    console.log("✅ Generated slug:", finalSlug);

    // ✅ IMPROVED: Construct correct image URL
    const imageUrl = `/uploads/blogs/${blogImageFile.filename}`;
    const ogImageUrl = ogImageFile ? `/uploads/blogs/${ogImageFile.filename}` : null;

    console.log("✅ Image URL:", imageUrl);
    if (ogImageUrl) console.log("✅ OG Image URL:", ogImageUrl);

    // ✅ Parse tags with better error handling
    let parsedTags = [];
    if (tags) {
      if (typeof tags === "string") {
        try {
          parsedTags = JSON.parse(tags);
        } catch (jsonError) {
          // If not valid JSON, treat as comma-separated string
          parsedTags = tags.split(",")
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0);
        }
      } else if (Array.isArray(tags)) {
        parsedTags = tags;
      }
    }

    console.log("✅ Parsed tags:", parsedTags);

    // ✅ IMPORTANT: Check for duplicate slug BEFORE creating
    const existingBlog = await Blog.findOne({ slug: finalSlug });
    if (existingBlog) {
      // Delete uploaded files since blog won't be created
      if (fs.existsSync(blogImageFile.path)) {
        fs.unlinkSync(blogImageFile.path);
      }
      if (ogImageFile && fs.existsSync(ogImageFile.path)) {
        fs.unlinkSync(ogImageFile.path);
      }
      console.error("❌ Duplicate slug found:", finalSlug);
      return res.status(400).json({
        success: false,
        message: "Blog with same title/slug already exists",
      });
    }

    // ✅ Create blog data with improved defaults
    const blogData = {
      title: title.trim(),
      slug: finalSlug,
      excerpt: excerpt.trim(),
      content: content.trim(),
      image: imageUrl,
      imageAlt: (imageAlt && imageAlt.trim()) || "",
      category: category.trim(),
      author: (author && author.trim()) || "Design House Team",
      readTime: (readTime && readTime.trim()) || "5 min read",
      tags: parsedTags,
      status: status || "draft",
      featured: featured === "true" || featured === true || false,
      metaTitle: (metaTitle && metaTitle.trim()) || title.trim().substring(0, 60),
      metaDescription: (metaDescription && metaDescription.trim()) || excerpt.trim().substring(0, 160),
      ogTitle: (ogTitle && ogTitle.trim()) || "",
      ogDescription: (ogDescription && ogDescription.trim()) || "",
      ogImage: ogImageUrl || "",
      openGraphTags: (openGraphTags && openGraphTags.trim()) || "",
      canonicalTag: (canonicalTag && canonicalTag.trim()) || "",
      schemaMarkup: (schemaMarkup && schemaMarkup.trim()) || "",
      h1Title: (h1Title && h1Title.trim()) || "",
      metaKeywords: (metaKeywords && metaKeywords.trim()) || "",
      updatedBy: req.body.updatedBy || "Admin User",
    };

    console.log("✅ Blog data to create:", JSON.stringify(blogData, null, 2));

    // ✅ Create blog with transaction-like safety
    try {
      const blog = await Blog.create(blogData);

      console.log("✅ Blog created successfully! ID:", blog._id);
      console.log("✅ Image saved at:", imageUrl);

      await logActivity(req.body.updatedBy || "Admin User", "Created", "Blog", `Created blog: ${blog.title}`);

      return res.status(201).json({
        success: true,
        message: "Blog created successfully",
        data: blog,
      });
    } catch (createError) {
      // If blog creation fails, delete uploaded files
      if (fs.existsSync(blogImageFile.path)) {
        fs.unlinkSync(blogImageFile.path);
      }
      if (ogImageFile && fs.existsSync(ogImageFile.path)) {
        fs.unlinkSync(ogImageFile.path);
      }
      throw createError;
    }
  } catch (error) {
    console.error("❌ CREATE BLOG ERROR:");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error code:", error.code);

    // ✅ Better error handling for different error types
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors,
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate slug or title found",
        field: error.keyValue,
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create blog",
    });

  }
};

// ✅ Get All Blogs (ADMIN)
exports.getAllBlogs = async (req, res) => {
  try {
    const {
      status,
      category,
      featured,
      search,
      page = 1,
      limit = 10,
      sort = "-createdAt",
    } = req.query;

    const query = {};

    if (status) query.status = status;
    if (category) query.category = category;
    if (featured !== undefined) query.featured = featured === "true";

    if (search && search.trim() !== "") {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } },
      ];
    }

    const pageNumber = Math.max(1, parseInt(page));
    const limitNumber = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNumber - 1) * limitNumber;

    const blogs = await Blog.find(query)
      .sort(sort)
      .limit(limitNumber)
      .skip(skip)
      .select("-__v");

    const totalBlogs = await Blog.countDocuments(query);

    res.status(200).json({
      success: true,
      data: blogs,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(totalBlogs / limitNumber),
        totalBlogs,
        limit: limitNumber,
        hasNextPage: pageNumber < Math.ceil(totalBlogs / limitNumber),
        hasPrevPage: pageNumber > 1,
      },
    });
  } catch (error) {
    console.error("❌ Get all blogs error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch blogs",
    });
  }
};

// ✅ Get Published Blogs (PUBLIC)
exports.getPublishedBlogs = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 9 } = req.query;

    const query = { status: "published" };

    if (category && category.trim() !== "") {
      query.category = { $regex: new RegExp(category.trim(), "i") };
    }

    if (search && search.trim() !== "") {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } },
      ];
    }

    const pageNumber = Math.max(1, parseInt(page));
    const limitNumber = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNumber - 1) * limitNumber;

    const blogs = await Blog.find(query)
      .sort({ featured: -1, publishedAt: -1 })
      .limit(limitNumber)
      .skip(skip)
      .select("title slug excerpt image category author readTime tags publishedAt views featured metaTitle metaDescription");

    const totalBlogs = await Blog.countDocuments(query);

    res.status(200).json({
      success: true,
      data: blogs,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(totalBlogs / limitNumber),
        totalBlogs,
        limit: limitNumber,
      },
    });
  } catch (error) {
    console.error("❌ Get published blogs error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch published blogs",
    });
  }
};

// ✅ Get Single Blog by ID
exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    res.status(200).json({
      success: true,
      data: blog,
    });
  } catch (error) {
    console.error("❌ Get blog by ID error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid blog ID format",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch blog",
    });
  }
};

// ✅ Get Single Blog by Slug (PUBLIC)
exports.getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({
      slug: req.params.slug,
      status: "published",
    });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found or not published",
      });
    }

    // Increment views
    blog.views += 1;
    await blog.save();

    res.status(200).json({
      success: true,
      data: blog,
    });
  } catch (error) {
    console.error("❌ Get blog by slug error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch blog",
    });
  }
};

// ✅ Get Related Blogs
exports.getRelatedBlogs = async (req, res) => {
  try {
    const { slug } = req.params;
    const { limit = 3 } = req.query;

    const currentBlog = await Blog.findOne({ slug, status: "published" });

    if (!currentBlog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    const relatedBlogs = await Blog.find({
      _id: { $ne: currentBlog._id },
      category: currentBlog.category,
      status: "published",
    })
      .sort("-publishedAt -views")
      .limit(Math.min(parseInt(limit), 10))
      .select("title slug excerpt image category author readTime tags publishedAt views");

    res.status(200).json({
      success: true,
      data: relatedBlogs,
    });
  } catch (error) {
    console.error("❌ Get related blogs error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch related blogs",
    });
  }
};

// ✅ Update Blog
exports.updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      excerpt,
      content,
      category,
      author,
      readTime,
      tags,
      status,
      featured,
      metaTitle,
      metaDescription,
      imageAlt,
      ogTitle,
      ogDescription,
      openGraphTags,
      canonicalTag,
      schemaMarkup,
      h1Title,
      metaKeywords,
    } = req.body;

    console.log("🔄 Update Blog Started for ID:", id);
    console.log("Update data:", req.body);
    console.log("New files:", req.files);

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    // Handle new images upload
    if (req.files) {
      // Main image
      if (req.files.image) {
        const blogImageFile = req.files.image[0];
        console.log("📸 New blog image uploaded:", blogImageFile.filename);

        // Delete old image if exists
        if (blog.image && blog.image.startsWith("/uploads")) {
          const oldImagePath = path.join(__dirname, "../..", blog.image);
          if (fs.existsSync(oldImagePath)) {
            try {
              fs.unlinkSync(oldImagePath);
            } catch (unlinkError) {
              console.error("⚠️ Failed to delete old blog image:", unlinkError);
            }
          }
        }
        blog.image = `/uploads/blogs/${blogImageFile.filename}`;
      }

      // OG Image
      if (req.files.ogImage) {
        const ogImageFile = req.files.ogImage[0];
        console.log("📸 New OG image uploaded:", ogImageFile.filename);

        // Delete old OG image if exists
        if (blog.ogImage && blog.ogImage.startsWith("/uploads")) {
          const oldOgPath = path.join(__dirname, "../..", blog.ogImage);
          if (fs.existsSync(oldOgPath)) {
            try {
              fs.unlinkSync(oldOgPath);
            } catch (unlinkError) {
              console.error("⚠️ Failed to delete old OG image:", unlinkError);
            }
          }
        }
        blog.ogImage = `/uploads/blogs/${ogImageFile.filename}`;
      }
    }

    // Update fields
    const updates = {};
    if (title !== undefined) {
      blog.title = title.trim();
      updates.title = true;
    }
    if (excerpt !== undefined) {
      blog.excerpt = excerpt.trim();
      updates.excerpt = true;
    }
    if (content !== undefined) {
      blog.content = content.trim();
      updates.content = true;
    }
    if (category !== undefined) {
      blog.category = category.trim();
      updates.category = true;
    }
    if (author !== undefined) blog.author = author.trim();
    if (readTime !== undefined) blog.readTime = readTime.trim();
    if (status !== undefined) {
      blog.status = status;
      updates.status = true;
    }
    if (featured !== undefined) blog.featured = featured === "true" || featured === true;
    if (metaTitle !== undefined) blog.metaTitle = metaTitle.trim();
    if (metaDescription !== undefined) blog.metaDescription = metaDescription.trim();
    if (imageAlt !== undefined) blog.imageAlt = imageAlt.trim();
    if (ogTitle !== undefined) blog.ogTitle = ogTitle.trim();
    if (ogDescription !== undefined) blog.ogDescription = ogDescription.trim();
    if (openGraphTags !== undefined) blog.openGraphTags = openGraphTags.trim();
    if (canonicalTag !== undefined) blog.canonicalTag = canonicalTag.trim();
    if (schemaMarkup !== undefined) blog.schemaMarkup = schemaMarkup.trim();
    if (h1Title !== undefined) blog.h1Title = h1Title.trim();
    if (metaKeywords !== undefined) blog.metaKeywords = metaKeywords.trim();
    if (req.body.updatedBy !== undefined) blog.updatedBy = req.body.updatedBy;

    // Update tags
    if (tags !== undefined) {
      let parsedTags = [];
      if (typeof tags === "string") {
        try {
          parsedTags = JSON.parse(tags);
        } catch (error) {
          parsedTags = tags.split(",")
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0);
        }
      } else if (Array.isArray(tags)) {
        parsedTags = tags;
      }
      blog.tags = parsedTags;
    }

    // If status changed to published and no publishedAt date, set it
    if (blog.status === "published" && !blog.publishedAt) {
      blog.publishedAt = new Date();
    }

    await blog.save();

    console.log("✅ Blog updated successfully:", blog._id);

    await logActivity(req.body.updatedBy || "Admin User", "Updated", "Blog", `Updated blog: ${blog.title}`);

    res.status(200).json({
      success: true,
      message: "Blog updated successfully",
      data: blog,
      updates,
    });
  } catch (error) {
    console.error("❌ Update blog error:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors,
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate slug or title found",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Failed to update blog",
    });
  }
};

// ✅ Delete Blog
exports.deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedBy = req.query.updatedBy || req.body.updatedBy || "Admin User";
    console.log("🗑️ Delete Blog Request for ID:", id);

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    // Delete image if exists
    if (blog.image && blog.image.startsWith("/uploads")) {
      const imagePath = path.join(__dirname, "../..", blog.image);
      console.log("🗑️ Image to delete:", imagePath);

      if (fs.existsSync(imagePath)) {
        try {
          fs.unlinkSync(imagePath);
          console.log("✅ Image deleted successfully");
        } catch (unlinkError) {
          console.error("⚠️ Failed to delete image file:", unlinkError);
        }
      }
    }

    await blog.deleteOne();

    console.log("✅ Blog deleted successfully:", id);

    await logActivity(updatedBy, "Deleted", "Blog", `Deleted blog: ${blog.title}`);

    res.status(200).json({
      success: true,
      message: "Blog deleted successfully",
      deletedId: id,
    });
  } catch (error) {
    console.error("❌ Delete blog error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid blog ID format",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete blog",
    });
  }
};

// ✅ Get Categories
exports.getBlogCategories = async (req, res) => {
  try {
    const categories = await Blog.distinct("category", { status: "published" })
      .then(cats => cats.filter(cat => cat && cat.trim() !== ""))
      .then(cats => cats.sort());

    res.status(200).json({
      success: true,
      data: categories,
      count: categories.length,
    });
  } catch (error) {
    console.error("❌ Get categories error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch categories",
    });
  }
};

// ✅ Get Blog Stats (ADMIN)
exports.getBlogStats = async (req, res) => {
  try {
    console.log("📊 Fetching blog stats...");

    const [
      totalBlogs,
      publishedBlogs,
      draftBlogs,
      archivedBlogs,
      featuredBlogs,
      viewsResult,
      mostViewed,
      recentBlogs,
      categories
    ] = await Promise.all([
      Blog.countDocuments(),
      Blog.countDocuments({ status: "published" }),
      Blog.countDocuments({ status: "draft" }),
      Blog.countDocuments({ status: "archived" }),
      Blog.countDocuments({ featured: true }),
      Blog.aggregate([
        { $group: { _id: null, totalViews: { $sum: "$views" } } }
      ]),
      Blog.find({ status: "published" })
        .sort("-views")
        .limit(5)
        .select("title slug views publishedAt"),
      Blog.find()
        .sort("-createdAt")
        .limit(5)
        .select("title slug status createdAt"),
      Blog.distinct("category")
    ]);

    const totalViews = viewsResult.length > 0 ? viewsResult[0].totalViews : 0;

    // Get monthly stats for chart
    const monthlyStats = await Blog.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 },
          views: { $sum: "$views" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 12 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totals: {
          totalBlogs,
          publishedBlogs,
          draftBlogs,
          archivedBlogs,
          featuredBlogs,
          totalViews,
        },
        recentBlogs,
        mostViewed,
        categories: categories.filter(cat => cat && cat.trim() !== ""),
        monthlyStats,
      },
    });
  } catch (error) {
    console.error("❌ Get blog stats error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch blog stats",
    });
  }
};

// ✅ Increment Blog Views
exports.incrementBlogViews = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    blog.views += 1;
    await blog.save();

    res.status(200).json({
      success: true,
      message: "View count incremented",
      views: blog.views,
    });
  } catch (error) {
    console.error("❌ Increment views error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to increment views",
    });
  }
};