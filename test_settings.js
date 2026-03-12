const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:5000/api/settings';

async function testSettings() {
    try {
        console.log('1. Testing GET /api/settings...');
        const getRes = await axios.get(API_URL);
        console.log('GET Response Status:', getRes.status);
        console.log('GET Data:', JSON.stringify(getRes.data.data, null, 2));

        console.log('\n2. Testing PUT /api/settings...');
        const formData = new FormData();

        // Mock data
        const emails = JSON.stringify([{ id: 1, email: 'test@example.com', isPrimary: true }]);
        const phones = JSON.stringify([{ id: 1, phone: '1234567890', isPrimary: true }]);
        const addresses = JSON.stringify([{ id: 1, title: 'Test HQ', street: '123 Test St', city: 'Test City', country: 'Testland' }]);

        formData.append('emails', emails);
        formData.append('phones', phones);
        formData.append('addresses', addresses);

        // Optional: Append a test image if you have one, skipping for now to test data update
        // const logoPath = path.join(__dirname, 'test_logo.png');
        // if (fs.existsSync(logoPath)) {
        //     formData.append('logo', fs.createReadStream(logoPath));
        // }

        const putRes = await axios.put(API_URL, formData, {
            headers: {
                ...formData.getHeaders()
            }
        });

        console.log('PUT Response Status:', putRes.status);
        console.log('PUT Message:', putRes.data.message);

        console.log('\n3. Verifying Update (GET again)...');
        const verifyRes = await axios.get(API_URL);
        const newData = verifyRes.data.data;

        if (newData.emails[0].email === 'test@example.com' && newData.addresses[0].title === 'Test HQ') {
            console.log('✅ SUCCESS: Settings updated and verified!');
        } else {
            console.error('❌ FAILURE: Data mismatch.');
            console.log('Received:', JSON.stringify(newData, null, 2));
        }

    } catch (error) {
        console.error('❌ Error:', error.response ? error.response.data : error.message);
    }
}

testSettings();
