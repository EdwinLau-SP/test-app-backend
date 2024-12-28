import { router } from '../src/router.mjs';
import * as crypto from 'crypto';
import config from '../src/config.mjs';
import Koa from 'koa';
import logger from 'koa-logger';
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

// Logging and CORS
app.use(logger());
app.use(
  cors({
    origin: 'https://edwinlau-first-webapp.netlify.app', // Update to your frontend URL
    credentials: true,
  })
);

app.keys = [crypto.randomBytes(8).toString('hex')];
app.use(session({ store: createInMemorySessionStore(), sameSite: 'lax', httpOnly: true }, app));
app.use(router.routes());

// Export as handler for Vercel
export default async function handler(req, res) {
  await app.callback()(req, res);
}
