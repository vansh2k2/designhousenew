const mongoose = require('mongoose');
require('dotenv').config();

const PortfolioGallery = require('./src/models/PortfolioGallery.model');

async function checkSlug() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const slug = 'window-display-images';
        const gallery = await PortfolioGallery.findOne({ slug });

        if (gallery) {
            console.log('--- GALLERY FOUND ---');
            console.log('ID:', gallery._id);
            console.log('Title:', gallery.title);
            console.log('Description:', gallery.description);
            console.log('Highlight Text:', gallery.highlightText);
            console.log('Banner Title:', gallery.bannerTitle);
            console.log('Banner Highlight:', gallery.bannerHighlightText);
        } else {
            console.log('Gallery with slug "window-display-images" not found.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkSlug();
