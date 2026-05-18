const crypto = require('crypto');

function createId(prefix = 'flashcard') {
  return `${prefix}_${crypto.randomUUID()}`;
}

module.exports = {
  createId,
};
