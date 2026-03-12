const axios = require('axios');

const seedQuickLinks = async () => {
    try {
        const res = await axios.get('http://localhost:5000/api/settings');
        const settings = res.data.data;

        const quickLinks = [
            { label: "Retail Interiors", href: "/services/retail-interior" },
            { label: "Corporate Interiors", href: "/services/corporate-interior" },
            { label: "Restaurant Interior", href: "/services/restaurant-interior" },
            { label: "Shop In Shops", href: "/services/shop-in-shop" },
            { label: "Retail Display Merchandising", href: "/services/retail-display" },
            { label: "Retail Kiosk", href: "/services/retail-kiosk" },
            { label: "Exhibition & Events", href: "/services/exhibitions" },
            { label: "Interior Design Company", href: "/about" },
        ];

        const formData = {
            quickLinks: JSON.stringify(quickLinks),
            emails: JSON.stringify(settings.emails.map(({ _id, ...rest }) => rest)),
            phones: JSON.stringify(settings.phones.map(({ _id, ...rest }) => rest)),
            addresses: JSON.stringify(settings.addresses.map(({ _id, ...rest }) => rest))
        };

        const updateRes = await axios.put('http://localhost:5000/api/settings', formData);
        console.log('Update Success:', updateRes.data.success);
        console.log('Quick Links Seeded:', updateRes.data.data.quickLinks.length);
    } catch (err) {
        console.error('Error:', err.response?.data || err.message);
    }
};

seedQuickLinks();
