import Koa from 'koa';
import logger from 'koa-logger';
import session from 'koa-session';
import cors from 'koa2-cors';
import { router } from './router.mjs';
import crypto from 'node:crypto';

const app = new Koa();
const PORT = process.env.PORT || 8080;

app.use(logger());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);

app.keys = [crypto.randomBytes(8).toString('hex')];
app.use(session({}, app));
app.use(router.routes());

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
