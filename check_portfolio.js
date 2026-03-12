const mongoose = require('mongoose');

const uri = "mongodb+srv://designhouse:designhouse%40123@cluster0.je0urmy.mongodb.net/design_house?retryWrites=true&w=majority";

const PortfolioSchema = new mongoose.Schema({
    title: String,
    category: String,
    subCategory: String,
    galleryImages: [{ image: String, altText: String }]
});

const PortfolioGallery = mongoose.model('PortfolioGallery', PortfolioSchema, 'portfoliogalleries');

async function run() {
    try {
        await mongoose.connect(uri);
        console.log("Connected to MongoDB");

        const gallery = await PortfolioGallery.findOne({
            $or: [
                { subCategory: 'Retail Interior' },
                { title: 'Retail Interior' },
                { category: 'Retail Interior' }
            ]
        });

        if (gallery) {
            console.log("PORTFOLIO GALLERY FOUND");
            console.log("TITLE:", gallery.title);
            console.log("IMAGES COUNT:", gallery.galleryImages.length);
            console.log("IMAGES:", JSON.stringify(gallery.galleryImages.map(i => i.image), null, 2));
        } else {
            console.log("No PortfolioGallery found for 'Retail Interior'");
        }

    } catch (err) {
        console.error("ERROR:", err.message);
    } finally {
        await mongoose.disconnect();
    }
}

run();
