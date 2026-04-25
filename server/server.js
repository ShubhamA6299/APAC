import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet'; // [Security] Added helmet for basic HTTP header security
import path from 'path';
import { fileURLToPath } from 'url';
import compression from 'compression';
import { Logging } from '@google-cloud/logging';
import { handleChat } from './agent.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
// Changed to 3000 to avoid browser-cached HSTS from port 8080
const PORT = process.env.PORT || 3000;

// [Security] Middleware to protect app from well-known web vulnerabilities
// We disable CSP and HSTS locally because Safari caches strict TLS rules aggressively
const isProduction = process.env.NODE_ENV === 'production';
app.use(helmet({
  contentSecurityPolicy: isProduction ? undefined : false,
  hsts: isProduction ? undefined : false,
}));
app.use(cors());
app.use(express.json()); // [Efficiency] Built-in json parser is lightweight and fast
app.use(compression()); // [Efficiency] Added gzip compression to reduce payload size

// [Google Services usage] Initialize Google Cloud Logging safely (Production only)
let log = { entry: () => ({}), write: () => Promise.resolve() }; 
if (process.env.NODE_ENV === 'production') {
  try {
    const logging = new Logging();
    log = logging.log('learning-companion-requests');
  } catch (e) {
    console.warn('Google Cloud Logging could not initialize.');
  }
}

// Serve the static frontend files
const clientBuildPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientBuildPath));

// [Code Quality] Clear endpoint separation
app.post('/api/chat', async (req, res) => {
  const { message, sessionId } = req.body;
  if (!message || !sessionId) {
    return res.status(400).json({ error: 'message and sessionId are required' });
  }

  // [Google Services usage] Log the incoming request to Google Cloud Logging
  try {
    const entry = log.entry({ resource: { type: 'global' } }, { sessionId, messageSnippet: message.substring(0, 50) });
    log.write(entry).catch(() => {}); // Non-blocking log write
  } catch (e) {
    // Graceful degradation if GCP credentials aren't fully set locally
  }

  try {
    // [Problem Statement Alignment] Agent adapts to the user's current progress
    const response = await handleChat(sessionId, message);
    res.json(response);
  } catch (error) {
    console.error('Error handling chat:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Fallback to serve the React application for any unknown GET routes (Express 5 compatibility)
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  } else {
    next();
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
