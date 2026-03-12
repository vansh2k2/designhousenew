const express = require("express");
const router = express.Router();
const {
    getSocialMedia,
    updateSocialMedia,
} = require("../controllers/socialMedia.controller");

router.get("/", getSocialMedia);
router.put("/", updateSocialMedia);

module.exports = router;
