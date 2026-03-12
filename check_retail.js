const mongoose = require('mongoose');

const uri = "mongodb+srv://designhouse:designhouse%40123@cluster0.je0urmy.mongodb.net/design_house?retryWrites=true&w=majority";

const serviceDetailSchema = new mongoose.Schema({
    serviceName: String,
    bgImage: String,
    bgTitle: String,
    galleryImages: [{ url: String, altText: String }]
});

const ServiceDetail = mongoose.model('ServiceDetail', serviceDetailSchema, 'servicedetails');

async function run() {
    try {
        await mongoose.connect(uri);
        console.log("Connected to MongoDB");

        const retail = await ServiceDetail.findOne({ serviceName: 'Retail Interior' });
        if (retail) {
            console.log("RETAIL INTERIOR DATA FOUND");
            console.log("BG IMAGE:", retail.bgImage);
            console.log("BG TITLE:", retail.bgTitle);
            console.log("GALLERY IMAGES COUNT:", retail.galleryImages.length);
            console.log("GALLERY IMAGES:", JSON.stringify(retail.galleryImages, null, 2));
        } else {
            console.log("No ServiceDetail found for 'Retail Interior'");
            const allNames = await ServiceDetail.find().select('serviceName');
            console.log("AVAILABLE SERVICES:", allNames.map(s => s.serviceName));
        }

        // Also check HeroImage collection if it exists
        const HeroSchema = new mongoose.Schema({ pageName: String, backgroundImage: String, title: String });
        const HeroImage = mongoose.model('HeroImage', HeroSchema, 'heroimages');
        const hero = await HeroImage.findOne({ pageName: 'Retail Interior' });
        if (hero) {
            console.log("HERO IMAGE ENTRY FOUND");
            console.log("TITLE:", hero.title);
            console.log("IMAGE:", hero.backgroundImage);
        } else {
            console.log("No HeroImage entry found for 'Retail Interior'");
        }

    } catch (err) {
        console.error("ERROR:", err.message);
    } finally {
        await mongoose.disconnect();
    }
}

run();
