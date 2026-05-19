const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const routes = require('./routes');

const envPath = path.resolve(__dirname, '../../../.env');
dotenv.config({ path: envPath, override: true });

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.use('/', routes);

module.exports = app;
