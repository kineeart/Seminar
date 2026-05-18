const http = require('http');
const https = require('https');

function getQuizServiceBaseUrl() {
  return process.env.QUIZ_SERVICE_URL || 'http://localhost:5004';
}

function postJson(url, payload) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const client = parsedUrl.protocol === 'https:' ? https : http;
    const body = JSON.stringify(payload);

    const req = client.request(
      {
        method: 'POST',
        hostname: parsedUrl.hostname,
        port: parsedUrl.port,
        path: `${parsedUrl.pathname}${parsedUrl.search}`,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
        timeout: 5000,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(data ? JSON.parse(data) : {});
            } catch (err) {
              resolve({});
            }
            return;
          }

          reject(new Error(`Progress API failed with status ${res.statusCode}`));
        });
      },
    );

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy(new Error('Progress API request timed out'));
    });
    req.write(body);
    req.end();
  });
}

async function recordChatActivity({ userId, messageCount, activityAt }) {
  if (!userId) {
    return null;
  }

  const response = await postJson(`${getQuizServiceBaseUrl()}/progress/chat-activity`, {
    userId,
    messageCount,
    activityAt,
  });

  return response.progress || null;
}

module.exports = {
  recordChatActivity,
};
