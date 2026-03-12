
async function verify() {
    try {
        const response = await fetch('http://localhost:5000/api/youtube/latest');
        if (response.ok) {
            const data = await response.json();
            console.log('Endpoint verified successfully!');
            console.log('Success:', data.success);
            console.log('Videos found:', data.data.length);
            console.log('First video:', data.data[0]);
        } else {
            console.log('Endpoint verification failed:', response.status, response.statusText);
        }
    } catch (err) {
        console.error('Error connecting to backend:', err.message);
    }
}

verify();
