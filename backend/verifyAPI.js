import axios from 'axios';

async function verifyAPI() {
    try {
        const response = await axios.get('http://localhost:5000/api/students/verify/7376232CB156');
        console.log('API Response Status:', response.status);
        console.log('History found:', response.data.history ? response.data.history.length : 'MISSING');
        if (response.data.history) {
            console.log('Sample Event:', response.data.history[0].message);
        }
        process.exit(0);
    } catch (err) {
        console.error('API Check Failed:', err.message);
        process.exit(1);
    }
}

verifyAPI();
