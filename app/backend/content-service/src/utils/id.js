let counter = 0;

function createId(prefix) {
  counter += 1;
  return `${prefix}_${Date.now()}_${counter}`;
}

module.exports = {
  createId,
};
