const app = require('./app');

const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`flashcard-service listening on port ${PORT}`);
});
