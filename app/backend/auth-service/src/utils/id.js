const crypto = require('crypto');

function createId(prefix = 'user') {
  return `${prefix}_${crypto.randomUUID()}`;
}

module.exports = {
  createId,
};
