require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const fs = require("fs");

const connectDB = require("./src/config/db");

// ✅ ROUTES
const authRoutes = require("./src/routes/auth.routes");
const blogRoutes = require("./src/routes/blog.routes");
const heroRoutes = require("./src/routes/hero.routes");
const bookingRoutes = require("./src/routes/booking.routes");
const clientRoutes = require("./src/routes/client.routes");
const testimonialRoutes = require("./src/routes/testimonial.routes");
const seoRoutes = require("./src/routes/seo.routes");
const adminRoutes = require("./src/routes/admin.routes");
const vacancyRoutes = require("./src/routes/vacancy.routes");
const careerRoutes = require("./src/routes/career.routes");
const aboutRoutes = require("./src/routes/about.routes");
const contactRoutes = require("./src/routes/contact.routes");
const serviceRoutes = require("./src/routes/service.routes");
const howWeWorkRoutes = require("./src/routes/howWeWork.routes");
const statsCounterRoutes = require("./src/routes/statsCounter.routes");
const whyChooseUsRoutes = require("./src/routes/whyChooseUs.routes");
const whatWeDoRoutes = require("./src/routes/whatWeDo.routes");
const ourTeamRoutes = require("./src/routes/ourTeam.routes");
const heroImageRoutes = require("./src/routes/heroImage.routes");
const youtubeRoutes = require("./src/routes/youtube.routes");
const socialMediaRoutes = require("./src/routes/socialMedia.routes"); // ✅ SOCIAL MEDIA ROUTES
const customPageRoutes = require("./src/routes/customPage.routes");
const galleryRoutes = require("./src/routes/gallery.routes");
const portfolioGalleryRoutes = require("./src/routes/portfolioGallery.routes"); // ✅ NEW PORTFOLIO GALLERY ROUTES
const serviceDetailRoutes = require("./src/routes/serviceDetail.routes");
const dashboardRoutes = require("./src/routes/dashboard.routes");
const sidebarThemeRoutes = require("./src/routes/sidebarTheme.routes");
const videoPortfolioRoutes = require("./src/routes/videoPortfolio.routes");
const sitemapRoutes = require("./src/routes/sitemap.routes");
const emailLogRoutes = require("./src/routes/emailLog.routes");
const whatsAppLogRoutes = require("./src/routes/whatsAppLog.routes");
const faqRoutes = require("./src/routes/faq.routes");
const messageTemplateRoutes = require("./src/routes/messageTemplate.routes");
const messageTemplateController = require("./src/controllers/messageTemplate.controller");
const roleRoutes = require("./src/routes/role.routes");
const roleController = require("./src/controllers/role.controller");

const errorHandler = require("./src/middleware/error.middleware");

const app = express();

// ==============================
//  UPLOADS FOLDER SETUP
// ==============================
const uploadsDir = path.join(__dirname, "uploads");
const blogsDir = path.join(uploadsDir, "blogs");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(blogsDir)) {
  fs.mkdirSync(blogsDir, { recursive: true });
}

// ==============================
//  MIDDLEWARE
// ==============================
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(morgan("dev"));

app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',')
      : [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:3000",
        "http://localhost:8080",
        "http://localhost:8081",
      ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


// ==============================
//  STATIC FILES
// ==============================
app.use("/uploads", express.static(uploadsDir));

// ==============================
//  TEST ROUTES
// ==============================
app.get("/", (req, res) => {
  res.send(" Backend is running...");
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date(),
  });
});

// ==============================
//  API ROUTES
// ==============================
app.use("/api/auth", authRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/hero", heroRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/client", clientRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/vacancies", vacancyRoutes);
app.use("/api/career", careerRoutes);
app.use("/api/about", aboutRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/otp", require("./src/routes/otp.routes"));
app.use("/api/featured-services", serviceRoutes);
app.use("/api/how-we-work", howWeWorkRoutes);
app.use("/api/stats-counter", statsCounterRoutes);
app.use("/api/seo", seoRoutes);
app.use("/api/why-choose-us", whyChooseUsRoutes);
app.use("/api/what-we-do", whatWeDoRoutes);
app.use("/api/our-team", ourTeamRoutes);
app.use("/api/hero-images", heroImageRoutes);
app.use("/api/youtube", youtubeRoutes);
app.use("/api/social-media", socialMediaRoutes);
app.use("/api/settings", require("./src/routes/settings.routes"));
app.use("/api/seo-settings", require("./src/routes/seoSettings.routes"));
app.use("/api/custom-pages", customPageRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/portfolio-gallery", portfolioGalleryRoutes);
app.use("/api/service-details", serviceDetailRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/sidebar-theme", sidebarThemeRoutes);
app.use("/api/video-portfolio", videoPortfolioRoutes);
app.use("/api/analytics", require("./src/routes/analytics.routes"));
app.use("/api/email-logs", emailLogRoutes);
app.use("/api/whatsapp-logs", whatsAppLogRoutes);
app.use("/api/faq", faqRoutes);
app.use("/api/message-templates", messageTemplateRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/activity-logs", require("./src/routes/activityLog.routes"));
// ✅ SERVE SEO FILES (Sitemap, Robots, etc.) FROM ROOT
app.use((req, res, next) => {
  const rootFiles = ['.xml', '.txt', '.html'];
  const ext = path.extname(req.path).toLowerCase();

  if (rootFiles.includes(ext)) {
    const filename = path.basename(req.path);
    // Skip sitemap and robots so they fall through to our dynamic routes
    if (filename === 'sitemap.xml' || filename === 'robots.txt') return next();
    const filePath = path.join(__dirname, 'uploads/seo', filename);

    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    }
  }
  next();
});

app.use("/", sitemapRoutes);


// ==============================
//  ERROR HANDLER
// ==============================
app.use(errorHandler);

// ==============================
//  SERVER START
// ==============================
const PORT = process.env.PORT || 5000;

connectDB()
  .then(async () => {
    // ✅ Seed initial templates if they don't exist
    await messageTemplateController.seedTemplates();
    // ✅ Seed default roles
    await roleController.seedDefaultRoles();
    
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`📁 Uploads directory: ${uploadsDir}`);
    });
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err);
    process.exit(1);
  });
