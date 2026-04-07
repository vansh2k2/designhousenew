const mongoose = require('mongoose');
require('dotenv').config();

const PortfolioGallery = require('./src/models/PortfolioGallery.model');

async function checkAll() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const galleries = await PortfolioGallery.find({}, 'slug title description highlightText category subCategory status heroImage galleryImages');
        console.log('--- ALL GALLERIES ---');
        galleries.forEach(g => {
            console.log(`Slug: "${g.slug}"`);
            console.log(`  Category: "${g.category}" | SubCategory: "${g.subCategory}"`);
            console.log(`  Title: "${g.title}" | Status: "${g.status}"`);
            console.log(`  Description: "${g.description}"`);
            console.log(`  Hero Image: "${g.heroImage}"`);
            console.log(`  Gallery Images: ${g.galleryImages?.length || 0}`);
            console.log('---');
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkAll();
