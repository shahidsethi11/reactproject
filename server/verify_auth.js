const axios = require('axios');

const API_URL = 'http://localhost:5000/api/auth';

const uniqueUser = `testuser_${Date.now()}`;
const uniqueEmail = `test_${Date.now()}@example.com`;

async function testAuth() {
    try {
        console.log('Testing Registration with Role...');
        // We need to fetch the 'User' role ID first or assume we want just default (which we haven't implemented to default yet, but we updated register to take roles)
        // Let's try to register without roles (should be empty roles array) and with roles if we knew IDs.
        // For this test, let's just register.

        const registerRes = await axios.post(`${API_URL}/register`, {
            username: uniqueUser,
            email: uniqueEmail,
            password: 'password123',
            // roles: [] // Optional
        });
        console.log('Registration Successful:', registerRes.data);

        console.log('Testing Login...');
        const loginRes = await axios.post(`${API_URL}/login`, {
            email: uniqueEmail,
            password: 'password123',
        });
        console.log('Login Successful:', loginRes.data);

        const token = loginRes.data.token;

        console.log('Testing Protected Route (Me)...');
        const meRes = await axios.get(`${API_URL}/me`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        console.log('Protected Route Access Successful:', meRes.data);

        // Test Role Protection (if we had a route protected by 'Admin')
        // We haven't created a specific protected route yet other than 'me' which is just 'protect'.
        // Let's create a temporary route in server.ts or just rely on 'me' working means 'protect' works.
        // To test 'authorize', we need a route that uses it.
        // I'll add a route to roles.ts that requires 'Admin' and try to access it with this new user (who shouldn't have it).


    } catch (error) {
        console.error('Verification Failed:', error.response ? error.response.data : error.message);
        process.exit(1);
    }
}

testAuth();
