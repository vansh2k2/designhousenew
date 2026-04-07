const express = require("express");
const router = express.Router();
const sitemapController = require("../controllers/sitemap.controller");

router.get("/sitemap.xml", sitemapController.getSitemap);
router.get("/robots.txt", sitemapController.getRobots);

module.exports = router;
