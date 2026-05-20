const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../../.env'), override: true });

console.log(`[CONFIG] Loaded env from: ${path.resolve(__dirname, '../../../.env')}`);

const app = require('./app');

const PORT = process.env.ANALYSIS_SERVICE_PORT || 5005;

app.listen(PORT, () => {
  console.log(`analysis-service listening on port ${PORT}`);
});
