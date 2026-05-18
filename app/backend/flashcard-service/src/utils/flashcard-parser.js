function tryParseJson(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (e) {
    // Prefer extracting an array block first, then an object block
    const arr = text.match(/\[[\s\S]*\]/m);
    if (arr) {
      try {
        return JSON.parse(arr[0]);
      } catch (err) {
        // continue to object fallback
      }
    }
    const m = text.match(/\{[\s\S]*\}/m);
    if (m) {
      try {
        return JSON.parse(m[0]);
      } catch (err) {
        return null;
      }
    }
    return null;
  }
}

function validateCard(obj) {
  if (!obj) return false;
  const has = (k) => Object.prototype.hasOwnProperty.call(obj, k) && obj[k];
  return has('word') && has('ipa') && has('meaning') && has('example');
}

function parseAndValidate(aiOutput) {
  const result = { valid: [], invalid: [] };
  const parsed = tryParseJson(aiOutput);
  if (!parsed) {
    return result;
  }

  const items = Array.isArray(parsed) ? parsed : parsed.items || [];

  const seen = new Set();
  for (let i = 0; i < items.length; i += 1) {
    const it = items[i];
    if (validateCard(it)) {
      const key = String(it.word).toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        result.valid.push({
          word: it.word,
          ipa: it.ipa,
          meaning: it.meaning,
          example: it.example,
        });
      }
    } else {
      result.invalid.push(it);
    }
  }
  return result;
}

module.exports = { parseAndValidate, tryParseJson, validateCard };
