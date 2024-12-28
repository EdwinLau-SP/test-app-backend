import { router } from './router.mjs';
import * as crypto from 'crypto';
import config from './config.mjs';
import Koa from 'koa';
import logger from 'koa-logger';
import session from 'koa-session';
import cors from 'koa2-cors';

// Create Koa app FIRST
const app = new Koa();

// Define dynamic PORT
const PORT = process.env.PORT || 8080;

// Logging and CORS
app.use(logger());
app.use(
  cors({
    origin: 'https://edwinlau-first-webapp.netlify.app', // Update to your frontend URL
    credentials: true,
  })
);

// Session Store
function createInMemorySessionStore() {
  const map = new Map();
  return {
    get: map.get.bind(map),
    set: map.set.bind(map),
    destroy: map.delete.bind(map),
  };
}

// Setup session
app.keys = [crypto.randomBytes(8).toString('hex')];
app.use(session({ store: createInMemorySessionStore(), sameSite: 'lax', httpOnly: true }, app));

// Routes
app.use(router.routes());

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
