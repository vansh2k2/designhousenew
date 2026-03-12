const Admin = require("../models/Admin.model");
const Service = require("../models/Service.model");
const PortfolioGallery = require("../models/PortfolioGallery.model");
const HeroImage = require("../models/heroImage.model");
const Testimonial = require("../models/Testimonial.model");
const Client = require("../models/Client.model");
const Contact = require("../models/Contact.model");
const Blog = require("../models/Blog.model");
const Booking = require("../models/Booking.model");

exports.getDashboardStats = async (req, res) => {
    try {
        const [
            totalUsers,
            totalServices,
            totalProjects,
            totalHomeCarousel,
            totalTestimonials,
            totalClients,
            totalLeads,
            totalBlogs,
            totalBookings,
            recentContacts
        ] = await Promise.all([
            Admin.countDocuments(),
            Service.countDocuments(),
            PortfolioGallery.countDocuments(),
            HeroImage.countDocuments(),
            Testimonial.countDocuments(),
            Client.countDocuments(),
            Contact.countDocuments(),
            Blog.countDocuments(),
            Booking.countDocuments(),
            Contact.find().sort({ createdAt: -1 }).limit(5)
        ]);

        // Monthly data for charts
        const last6Months = [];
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            last6Months.push({
                month: date.toLocaleString('default', { month: 'short' }),
                year: date.getFullYear(),
                monthNum: date.getMonth(),
            });
        }

        const statsByMonth = await Promise.all(last6Months.map(async (m) => {
            const start = new Date(m.year, m.monthNum, 1);
            const end = new Date(m.year, m.monthNum + 1, 0, 23, 59, 59);

            const [servicesCount, projectsCount, leadsCount] = await Promise.all([
                Service.countDocuments({ createdAt: { $gte: start, $lte: end } }),
                PortfolioGallery.countDocuments({ createdAt: { $gte: start, $lte: end } }),
                Contact.countDocuments({ createdAt: { $gte: start, $lte: end } })
            ]);

            return {
                month: m.month,
                services: servicesCount,
                projects: projectsCount,
                leads: leadsCount
            };
        }));

        // Project Type Distribution (based on service categories)
        const services = await Service.find().select('category title');
        const distributionMap = {};
        services.forEach(s => {
            const cat = s.category || 'Other';
            distributionMap[cat] = (distributionMap[cat] || 0) + 1;
        });

        const projectTypeDistribution = Object.entries(distributionMap).map(([name, value]) => ({
            name,
            value,
            color: `#${Math.floor(Math.random() * 16777215).toString(16)}` // Random color for now
        }));

        res.status(200).json({
            success: true,
            data: {
                counts: {
                    totalUsers,
                    totalServices,
                    totalProjects,
                    totalHomeCarousel,
                    totalTestimonials,
                    totalClients,
                    totalLeads,
                    totalBlogs,
                    totalBookings
                },
                charts: {
                    trends: statsByMonth,
                    distribution: projectTypeDistribution
                },
                recentContacts
            }
        });
    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard stats"
        });
    }
};
