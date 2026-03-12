const mongoose = require("mongoose");
const PortfolioCategory = require("./src/models/PortfolioCategory.model");

const categories = [
    {
        name: "Interiors Portfolio",
        subcategories: [
            { name: "Retail Interior Images", slug: "retail-interior" },
            { name: "Corporate Interior Images", slug: "corporate-interior" },
            { name: "Restaurant Interior Images", slug: "restaurant-interior" },
            { name: "Shop in Shop Images", slug: "shops-in-shops" },
        ],
        status: "Active",
    },
    {
        name: "Merchandising Portfolio",
        subcategories: [
            { name: "Retail Merchandising Images", slug: "merchandising-images" },
            { name: "Acrylic Table Tops Images", slug: "acrylic-images" },
            { name: "Gondola Displays Images", slug: "gandola-images" },
            { name: "Window Displays Images", slug: "window-display-images" },
        ],
        status: "Active",
    },
    {
        name: "Kiosk Portfolio",
        subcategories: [
            { name: "Retail Kiosks Images", slug: "kiosk-images" },
            { name: "Mobile Booths Images", slug: "booth-images" },
        ],
        status: "Active",
    },
    {
        name: "Signage Portfolio Images",
        subcategories: [],
        status: "Active",
    },
    {
        name: "Exhibition & Events Portfolio",
        subcategories: [],
        status: "Active",
    },
    {
        name: "Office Interior Portfolio",
        subcategories: [
            { name: "Modular Work Station Images", slug: "modular-images" },
            { name: "MD Cabin Images", slug: "md-cabin-images" },
            { name: "Office Chairs Images", slug: "office-chairs-images" },
        ],
        status: "Active",
    },
    {
        name: "Furniture Portfolio",
        subcategories: [
            { name: "Modular Wardrobes Images", slug: "wardrobes-images" },
            { name: "Modular Kitchen Images", slug: "kitchen-images" },
            { name: "Modular LCD Units Images", slug: "lcd-unit-images" },
            { name: "Sofas Images", slug: "sofas-images" },
        ],
        status: "Active",
    },
    {
        name: "Videos",
        subcategories: [],
        status: "Active",
    },
];

async function seedCategories() {
    try {
        require("dotenv").config();
        const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/design-house";
        await mongoose.connect(mongoURI);

        console.log("Connected to MongoDB");

        // Clear existing categories
        await PortfolioCategory.deleteMany({});
        console.log("Cleared existing categories");

        // Insert new categories with subcategories
        await PortfolioCategory.insertMany(categories);
        console.log("Portfolio categories seeded successfully!");

        mongoose.connection.close();
    } catch (error) {
        console.error("Error seeding categories:", error);
        process.exit(1);
    }
}

seedCategories();
