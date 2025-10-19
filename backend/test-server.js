// Simple test to check if server can start
require('dotenv').config();

console.log('=== Environment Variables ===');
console.log('DB_SERVER:', process.env.DB_SERVER);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER ? '***' : 'NOT SET');
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : 'NOT SET');
console.log('PORT:', process.env.PORT || 5000);
console.log('=============================\n');

// Try to start the server
console.log('Starting server...');
require('./src/server.ts');
