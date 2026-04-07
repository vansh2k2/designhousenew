const axios = require('axios');
async function checkSitemap() {
    try {
        const response = await axios.get('http://localhost:5000/sitemap.xml');
        const xml = response.data;
        const links = [
            '/services/retail-interior',
            '/portfolio/interior/retail-interior',
            '/about/brand-approach'
        ];
        console.log("Checking for links in sitemap...");
        links.forEach(link => {
            if (xml.includes(link)) {
                console.log(`✅ Found: ${link}`);
            } else {
                console.log(`❌ NOT Found: ${link}`);
            }
        });
        if (xml.includes('<urlset')) {
            console.log("✅ XML structure looks valid.");
        }
    } catch (e) {
        console.error("Error:", e.message);
    }
}
checkSitemap();
