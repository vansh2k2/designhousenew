const axios = require('axios');

const API_URL = 'http://localhost:5000/api/social-media';

const runTest = async () => {
    try {
        console.log('1. Testing GET /api/social-media...');
        const getRes = await axios.get(API_URL);
        console.log('GET Response:', getRes.data);

        console.log('\n2. Testing PUT /api/social-media...');
        const updateData = {
            facebook: 'https://facebook.com/test',
            instagram: 'https://instagram.com/test',
            whatsappNumber: '1234567890',
            whatsappMessage: 'Test Message',
        };
        const putRes = await axios.put(API_URL, updateData);
        console.log('PUT Response:', putRes.data);

        console.log('\n3. Verifying Update...');
        const verifyRes = await axios.get(API_URL);
        console.log('Verify Response:', verifyRes.data);

        if (
            verifyRes.data.data.facebook === updateData.facebook &&
            verifyRes.data.data.whatsappNumber === updateData.whatsappNumber
        ) {
            console.log('\n✅ TEST PASSED');
        } else {
            console.log('\n❌ TEST FAILED: Data mismatch');
        }
    } catch (error) {
        console.error('❌ TEST FAILED:', error.message);
        if (error.code) console.error('Error Code:', error.code);
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', error.response.data);
        } else if (error.request) {
            console.error('No response received from server');
        }
    }
};

runTest();
