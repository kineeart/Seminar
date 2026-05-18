const path = require('path');

// Load .env from backend root directory
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

console.log('Jest setup: MONGODB_URI =', process.env.MONGODB_URI ? 'SET' : 'NOT SET');
console.log('Jest setup: DATABASE_NAME =', process.env.DATABASE_NAME ? 'SET' : 'NOT SET');
