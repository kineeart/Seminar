const dotenv = require('dotenv');
const app = require('./app');

dotenv.config();

const PORT = process.env.QUIZ_SERVICE_PORT || process.env.PORT || 5004;

if (require.main === module) {
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`quiz-service running on port ${PORT}`);
    // eslint-disable-next-line no-console
    console.log(`http://localhost:${PORT}/health`);
  });
}

module.exports = app;
