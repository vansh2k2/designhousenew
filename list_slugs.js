const mongoose = require('mongoose');
require('dotenv').config();

const PortfolioGallery = require('./src/models/PortfolioGallery.model');

async function listSlugs() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const galleries = await PortfolioGallery.find({}, 'slug title description highlightText');
        console.log('--- ALL GALLERIES ---');
        galleries.forEach(g => {
            console.log(`- Slug: "${g.slug}", Title: "${g.title}", Desc: "${g.description}", Highlight: "${g.highlightText}"`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

listSlugs();
