const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

const envPath = path.resolve(__dirname, '../../../.env');

const envResult = dotenv.config({
  path: envPath,
  override: true,
});

if (envResult.error) {
  console.error(`[CONFIG] Failed to load env from: ${envPath}`);
  throw envResult.error;
}

console.log(`[CONFIG] Loaded env from: ${envPath}`);

if (process.env.MONGODB_URI) {
  console.log('[CONFIG] MONGODB_URI detected');
}

if (!process.env.JWT_SECRET) {
  console.warn('[CONFIG] JWT_SECRET is missing');
}

const authRoutes = require('./routes/auth.routes');
const authController = require('./controllers/auth.controller');
const { connectWithRetry, registerGracefulShutdown } = require('../../shared/database');
const userRepository = require('./repositories/user.repository');
const { createId } = require('./utils/id');

const app = express();

const PORT = process.env.AUTH_SERVICE_PORT || process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.get('/health', authController.health);

function buildSafeUser(user) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    created_at: user.created_at,
  };
}

app.get('/admin/stats', async (req, res) => {
  try {
    const total = await userRepository.countAll();
    return res.json({ total });
  } catch (_error) {
    return res.json({ total: 0 });
  }
});

app.get('/admin/users', async (req, res) => {
  try {
    const users = await userRepository.listAll();
    const safe = users.map((user) => buildSafeUser(user));
    return res.json({ users: safe });
  } catch (_error) {
    return res.json({ users: [] });
  }
});

app.post('/admin/users', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password required' });
    }

    const existing = await userRepository.findByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    const user = await userRepository.createUser({
      id: createId('user'),
      email,
      passwordHash: password,
      role: role || 'user',
    });
    return res.json({
      success: true,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.patch('/admin/users/:id', async (req, res) => {
  try {
    const { role, password } = req.body;
    const updated = await userRepository.updateUser(req.params.id, { role, password });
    if (!updated) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      success: true,
      user: { id: updated.id, email: updated.email, role: updated.role },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.delete('/admin/users/:id', async (req, res) => {
  try {
    const deleted = await userRepository.deleteUser(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.use('/', authRoutes);

async function startServer() {
  try {
    console.log('[DB] Connecting to MongoDB Atlas...');

    await connectWithRetry({ appName: 'auth-service' });

    console.log('[DB] Connected successfully');

    registerGracefulShutdown();

    app.listen(PORT, () => {
      console.log(`auth-service running on port ${PORT}`);
      console.log(`http://localhost:${PORT}/health`);
    });
  } catch (err) {
    console.error('Failed to start auth-service:', err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = app;
