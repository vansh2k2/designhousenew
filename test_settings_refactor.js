const axios = require('axios');
const FormData = require('form-data');

const API_URL = 'http://localhost:5000/api/settings';

async function testRefactoredSettings() {
    try {
        console.log('1. Testing PUT /api/settings with new flags...');
        const formData = new FormData();

        // Mock data with new flags
        const emails = JSON.stringify([
            { id: 1, email: 'topbar@example.com', forTopbar: true, forContact: false },
            { id: 2, email: 'contact@example.com', forTopbar: false, forContact: true }
        ]);
        const phones = JSON.stringify([
            { id: 1, phone: '111-111-1111', forTopbar: true, forContact: true },
            { id: 2, phone: '222-222-2222', forTopbar: false, forContact: false }
        ]);
        const addresses = JSON.stringify([]);

        formData.append('emails', emails);
        formData.append('phones', phones);
        formData.append('addresses', addresses);

        const putRes = await axios.put(API_URL, formData, {
            headers: { ...formData.getHeaders() }
        });

        console.log('PUT Response Status:', putRes.status);

        console.log('\n2. Verifying Update (GET)...');
        const verifyRes = await axios.get(API_URL);
        const newData = verifyRes.data.data;

        console.log('Emails:', JSON.stringify(newData.emails, null, 2));
        console.log('Phones:', JSON.stringify(newData.phones, null, 2));

        const email1 = newData.emails.find(e => e.email === 'topbar@example.com');
        const email2 = newData.emails.find(e => e.email === 'contact@example.com');

        if (email1.forTopbar === true && email1.forContact === false &&
            email2.forTopbar === false && email2.forContact === true) {
            console.log('✅ SUCCESS: Topbar and Contact flags saved correctly!');
        } else {
            console.error('❌ FAILURE: Flags mismatch.');
        }

    } catch (error) {
        console.error('❌ Error:', error.response ? error.response.data : error.message);
    }
}

testRefactoredSettings();
