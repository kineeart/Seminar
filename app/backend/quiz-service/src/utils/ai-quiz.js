const fs = require('fs/promises');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const DEFAULT_PROMPT_PATH = path.resolve(__dirname, '../../../../Prompt/quiz_prompt.md');
const DEFAULT_BASE_URL = 'https://api.openai.com/v1';
const DEFAULT_MODEL = 'gpt-4o-mini';
const DEFAULT_TIMEOUT_MS = 30000;
const DEFAULT_FLASHCARD_TIMEOUT_MS = 90000;

const FALLBACK_PROMPT = [
  'Ban la AI tao quiz tieng Anh. Nhiem vu: tao quiz theo context JSON duoi day.',
  '',
  'CONTEXT (JSON):',
  '{{context_json}}',
  '',
  'Yeu cau output:',
  '- Chi tra ve JSON object hop le, khong markdown, khong giai thich.',
  '- Schema:',
  '{',
  '  "title": "...",',
  '  "target_exam": "...",',
  '  "level_tag": "...",',
  '  "difficulty": "easy|medium|hard",',
  '  "questions": [',
  '    {',
  '      "type": "MCQ|fill_in_the_blank|grammar_correction|vocabulary_meaning",',
  '      "question": "...",',
  '      "options": ["..."],',
  '      "correct_answer": "...",',
  '      "explanation": "...",',
  '      "source": "ai",',
  '      "skill_tag": "...",',
  '      "difficulty": "easy|medium|hard"',
  '    }',
  '  ]',
  '}',
  '',
  'Rules:',
  '- So cau = count trong context.',
  '- Khong trung/na na bat ky cau trong recent_questions hoac exclude_questions.',
  '- Voi MCQ/vocabulary_meaning/grammar_correction: options >= 2.',
  '- Voi fill_in_the_blank: options chua dap an dung.',
  '- Cau hoi + options bang tieng Anh theo target_exam; explanation ngan bang tieng Viet.',
  '- Khong trick question.',
  '- Difficulty phai khop difficulty trong context.',
  '- Uu tien bam theo vocabulary/grammar_points/examples neu co.',
].join('\n');

function normalizeString(value) {
  return String(value || '').trim();
}

function isAiConfigured(options = {}) {
  const mode = normalizeString(options.mode || options.providerPreference).toLowerCase();
  const hasOpenAi = Boolean(process.env.LLM_API_KEY || process.env.OPENAI_API_KEY);
  const hasFlashcardModel = Boolean(process.env.FLASHCARD_LLM_MODEL);
  const hasGemini = Boolean(process.env.GEMINI_API_KEY);

  if (mode === 'flashcard-only') {
    return hasOpenAi && hasFlashcardModel;
  }

  if (hasFlashcardModel && hasOpenAi) {
    return true;
  }
  return hasOpenAi || hasGemini;
}

function extractRuntimePrompt(content) {
  if (!content) {
    return null;
  }
  const match = content.match(/##\s*Runtime Quiz Generation Prompt[\s\S]*?```text\s*([\s\S]*?)```/i);
  return match ? match[1].trim() : null;
}

async function loadPromptTemplate() {
  const promptPath = process.env.QUIZ_PROMPT_PATH || DEFAULT_PROMPT_PATH;
  try {
    const content = await fs.readFile(promptPath, 'utf8');
    const extracted = extractRuntimePrompt(content);
    return {
      promptPath,
      template: extracted || content,
    };
  } catch (err) {
    return {
      promptPath,
      template: FALLBACK_PROMPT,
    };
  }
}

function buildPrompt(template, context) {
  const contextJson = JSON.stringify(context, null, 2);
  if (template.includes('{{context_json}}')) {
    return template.replace(/{{\s*context_json\s*}}/g, contextJson);
  }
  return `${template}\n\nContext JSON:\n${contextJson}`;
}

function stripCodeFences(text) {
  if (!text) {
    return '';
  }
  return text
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();
}

function extractJsonObject(text) {
  const cleaned = stripCodeFences(text);
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start < 0 || end < 0 || end <= start) {
    throw new Error('AI output does not contain JSON object');
  }
  return cleaned.slice(start, end + 1);
}

async function callOpenAICompatible(prompt, options = {}) {
  const apiKey = process.env.LLM_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('LLM_API_KEY or OPENAI_API_KEY is not set');
  }

  const baseUrl = process.env.LLM_BASE_URL || process.env.OPENAI_BASE_URL || DEFAULT_BASE_URL;
  const model = options.model || process.env.LLM_MODEL || process.env.OPENAI_MODEL || DEFAULT_MODEL;
  const temperatureRaw = Number(
    process.env.QUIZ_AI_TEMPERATURE
    || process.env.LLM_TEMPERATURE
    || process.env.OPENAI_TEMPERATURE
    || 0.7,
  );
  const temperature = Number.isFinite(temperatureRaw) ? temperatureRaw : 0.7;
  const timeoutMs = Number(
    options.timeoutMs
    || process.env.QUIZ_AI_TIMEOUT_MS
    || DEFAULT_TIMEOUT_MS,
  );
  const maxTokens = Number(options.maxTokens || 1200);

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature,
      max_tokens: maxTokens,
      response_format: { type: 'json_object' },
    }),
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    const error = new Error(`OpenAI-compatible API error: ${response.status} ${errorText}`.trim());
    error.status = response.status;
    throw error;
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content || '';

  return {
    text,
    model,
    provider: options.provider || 'openai-compatible',
    usage: data?.usage || null,
  };
}

function createGeminiModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }

  const modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  const genAI = new GoogleGenerativeAI(apiKey);
  return {
    model: genAI.getGenerativeModel({ model: modelName }),
    modelName,
  };
}

async function callGemini(prompt) {
  const modelConfig = createGeminiModel();
  if (!modelConfig) {
    throw new Error('GEMINI_API_KEY is not set');
  }

  const timeoutMs = Number(process.env.QUIZ_AI_TIMEOUT_MS || DEFAULT_TIMEOUT_MS);
  const result = await Promise.race([
    modelConfig.model.generateContent(prompt),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Gemini timeout')), timeoutMs)
    ),
  ]);

  const response = result?.response;
  const text = response && typeof response.text === 'function' ? response.text() : '';

  return {
    text: text.trim(),
    model: modelConfig.modelName,
    provider: 'gemini',
    usage: null,
  };
}

async function generateAiQuiz(context, options = {}) {
  const { template, promptPath } = await loadPromptTemplate();
  const prompt = buildPrompt(template, context);

  const hasOpenAi = Boolean(process.env.LLM_API_KEY || process.env.OPENAI_API_KEY);
  const hasGemini = Boolean(process.env.GEMINI_API_KEY);
  const flashcardModel = process.env.FLASHCARD_LLM_MODEL;
  const mode = normalizeString(options.mode || options.providerPreference).toLowerCase();

  let providers = [
    {
      enabled: Boolean(flashcardModel && hasOpenAi),
      call: (inputPrompt) => callOpenAICompatible(inputPrompt, {
        model: flashcardModel,
        provider: 'flashcard-llm',
        timeoutMs: Number(process.env.QUIZ_FLASHCARD_TIMEOUT_MS || DEFAULT_FLASHCARD_TIMEOUT_MS),
        maxTokens: Number(process.env.QUIZ_FLASHCARD_MAX_TOKENS || 900),
      }),
    },
    { enabled: hasGemini, call: callGemini },
    { enabled: hasOpenAi, call: callOpenAICompatible },
  ].filter((item) => item.enabled);

  if (mode === 'flashcard-only') {
    providers = providers.filter((item) => item.call !== callGemini && item.call !== callOpenAICompatible);
  }

  let response = null;
  let lastError = null;

  for (const provider of providers) {
    try {
      response = await provider.call(prompt);
      if (response && response.text) {
        break;
      }
    } catch (err) {
      lastError = err;
    }
  }

  if (!response || !response.text) {
    throw lastError || new Error('AI quiz generation failed');
  }

  const jsonText = extractJsonObject(response.text);
  const quiz = JSON.parse(jsonText);

  return {
    quiz,
    rawText: response.text,
    model: response.model,
    provider: response.provider,
    usage: response.usage,
    promptPath,
    prompt,
  };
}

module.exports = {
  isAiConfigured,
  generateAiQuiz,
};
