import { router } from './router.mjs';
import * as crypto from 'crypto';
import config from './config.mjs';
import Koa from 'koa';
import logger from 'koa-logger';
import serve from 'koa-static';
import session from 'koa-session';
import cors from 'koa2-cors';

function createInMemorySessionStore() {
  const map = new Map();
  return {
    get: map.get.bind(map),
    set: map.set.bind(map),
    destroy: map.delete.bind(map),
  };
}

const app = new Koa();

// (Optional) Log all requests to this server
app.use(logger());
// Enable CORS
app.use(
  cors({
    origin: 'https://edwinlau-first-webapp.netlify.app',
    // Allow requests from your frontend
    credentials: true, // Allow cookies to be sent along with the requests
  })
);
// Serve the static frontend
// app.use(serve('../frontend'));

// Manage sessions using an in-memory session store and signed, SameSite=Lax, HttpOnly cookies
app.keys = [crypto.randomBytes(8).toString('hex')];
app.use(session({ store: createInMemorySessionStore(), sameSite: 'lax', httpOnly: true }, app));

// Serve the backend routes
import { router } from './router.mjs';
export default async (req, res) => {
  const response = await app.callback()(req, res);
  return response;
};
