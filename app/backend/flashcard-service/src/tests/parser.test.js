const parser = require('../utils/flashcard-parser');

test('tryParseJson handles malformed JSON and extracts array', () => {
  const bad = 'Some text before [ {"word":"w","ipa":"/w/","meaning":"m","example":"e"} ] trailing';
  const parsed = parser.tryParseJson(bad);
  expect(parsed).toBeTruthy();
  expect(Array.isArray(parsed)).toBe(true);
});

test('parseAndValidate dedupes and separates invalid', () => {
  const ai = JSON.stringify([
    {
      word: 'maintain', ipa: '/meɪnˈteɪn/', meaning: 'duy trì', example: 'Keep it.',
    },
    {
      word: 'maintain', ipa: '/meɪnˈteɪn/', meaning: 'duy trì', example: 'Keep it.',
    },
    { foo: 'bar' },
  ]);
  const out = parser.parseAndValidate(ai);
  expect(out.valid.length).toBe(1);
  expect(out.invalid.length).toBe(1);
});
