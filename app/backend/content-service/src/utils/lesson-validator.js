function normalizeString(value) {
  return String(value || '').trim();
}

function normalizeArray(value) {
  if (!Array.isArray(value)) {
    return null;
  }
  return value;
}

function validateLessonPayload(payload, { partial = false } = {}) {
  const errors = [];
  const value = {};

  if (!partial || payload.title !== undefined) {
    const title = normalizeString(payload.title);
    if (!title) {
      errors.push('Title is required');
    } else {
      value.title = title;
    }
  }

  if (!partial || payload.topic !== undefined) {
    const topic = normalizeString(payload.topic);
    if (!topic) {
      errors.push('Topic is required');
    } else {
      value.topic = topic;
    }
  }

  if (payload.summary !== undefined) {
    value.summary = normalizeString(payload.summary);
  }

  if (payload.target_exam !== undefined) {
    value.target_exam = normalizeString(payload.target_exam);
  }

  if (payload.level_tag !== undefined) {
    value.level_tag = normalizeString(payload.level_tag);
  }

  if (payload.examples !== undefined) {
    const examples = normalizeArray(payload.examples);
    if (!examples) {
      errors.push('Examples must be an array');
    } else {
      value.examples = examples.map((entry) => normalizeString(entry)).filter(Boolean);
    }
  }

  if (payload.vocabulary !== undefined) {
    const vocabulary = normalizeArray(payload.vocabulary);
    if (!vocabulary) {
      errors.push('Vocabulary must be an array');
    } else {
      const normalized = vocabulary
        .map((entry) => ({
          term: normalizeString(entry.term),
          meaning: normalizeString(entry.meaning),
          example: normalizeString(entry.example),
        }))
        .filter((entry) => entry.term && entry.meaning);

      if (vocabulary.length && !normalized.length) {
        errors.push('Vocabulary items need term and meaning');
      }

      value.vocabulary = normalized;
    }
  }

  if (payload.grammar_points !== undefined) {
    const grammarPoints = normalizeArray(payload.grammar_points);
    if (!grammarPoints) {
      errors.push('Grammar points must be an array');
    } else {
      value.grammar_points = grammarPoints
        .map((entry) => ({
          rule: normalizeString(entry.rule),
          example: normalizeString(entry.example),
        }))
        .filter((entry) => entry.rule);
    }
  }

  return { value, errors };
}

module.exports = {
  validateLessonPayload,
};
