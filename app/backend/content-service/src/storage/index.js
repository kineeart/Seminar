const mongoStore = require('./mongo-store');
const memoryStore = require('./memory-store');

const useMongo = Boolean(process.env.MONGODB_URI);

module.exports = useMongo ? mongoStore : memoryStore;
