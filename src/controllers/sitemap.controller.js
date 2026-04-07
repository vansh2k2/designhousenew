const { SitemapStream, streamToPromise } = require("sitemap");
const { Readable } = require("stream");
const path = require("path");
const fs = require("fs");
const Blog = require("../models/Blog.model");
const CustomPage = require("../models/CustomPage.model");
const PortfolioCategory = require("../models/PortfolioCategory.model");
const ServiceDetail = require("../models/ServiceDetail.model");
const Settings = require("../models/Settings.model");

/**
 * @desc    Generate and serve sitemap.xml
 * @route   GET /sitemap.xml
 * @access  Public
 */
exports.getSitemap = async (req, res) => {
  try {
    const hostname = process.env.FRONTEND_URL || "https://www.designhouse.co.in";
    const links = [
      { url: "/", changefreq: "daily", priority: 1.0 },
      { url: "/about", changefreq: "monthly", priority: 0.8 },
      { url: "/portfolio", changefreq: "weekly", priority: 0.9 },
      { url: "/blogs", changefreq: "daily", priority: 0.9 },
      { url: "/contact", changefreq: "monthly", priority: 0.8 },
      { url: "/career", changefreq: "monthly", priority: 0.7 },
      { url: "/clients", changefreq: "monthly", priority: 0.7 },
      { url: "/downloads", changefreq: "monthly", priority: 0.6 },
    ];

    // Dynamic Blogs
    const blogs = await Blog.find({ status: "published" }).select("slug updatedAt");
    blogs.forEach((blog) => {
      links.push({
        url: `/blogs/${blog.slug}`,
        changefreq: "weekly",
        priority: 0.7,
        lastmod: blog.updatedAt,
      });
    });

    // Dynamic Custom Pages (Dynamic Location Pages)
    const customPages = await CustomPage.find({ status: "active" }).select("permalink updatedAt");
    customPages.forEach((page) => {
      links.push({
        url: `/${page.permalink}`,
        changefreq: "weekly",
        priority: 0.7,
        lastmod: page.updatedAt,
      });
    });

    // Dynamic Portfolio Categories
    const categories = await PortfolioCategory.find({ status: "Active" });
    categories.forEach((cat) => {
      const catSlug = cat.name.toLowerCase().replace(/\s+/g, '-');
      links.push({ url: `/portfolio/${catSlug}`, changefreq: "weekly", priority: 0.6 });
      
      cat.subcategories.forEach((sub) => {
        if (sub.slug) {
          links.push({
            url: `/portfolio/${catSlug}/${sub.slug}`,
            changefreq: "weekly",
            priority: 0.6,
          });
        }
      });
    });

    const stream = new SitemapStream({ hostname });
    res.set("Content-Type", "application/xml");
    const xml = await streamToPromise(Readable.from(links).pipe(stream));
    return res.status(200).send(xml.toString());
  } catch (error) {
    console.error("Sitemap Generation Error:", error);
    return res.status(500).json({ success: false, message: "Error generating sitemap", error: error.message });
  }
};

/**
 * @desc    Serve robots.txt
 * @route   GET /robots.txt
 * @access  Public
 */
exports.getRobots = async (req, res) => {
  try {
    const settings = await Settings.findOne();
    const robotsFile = settings?.seoFiles?.find(f => f.originalName === 'robots.txt');

    if (robotsFile) {
        const filePath = path.join(__dirname, '../../', 'uploads/seo', robotsFile.filename);
        if (fs.existsSync(filePath)) {
            return res.sendFile(filePath);
        }
    }

    // Default: 404 if none uploaded or file doesn't exist
    return res.status(404).send("Robots.txt not found");
  } catch (error) {
    console.error("Robots Error:", error);
    return res.status(500).send("Error fetching robots.txt");
  }
};

