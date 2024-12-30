import config from './config.mjs';
import { Issuer, generators } from 'openid-client';
import * as crypto from 'node:crypto';
import Router from 'koa-router';

const router = new Router();

// Authorization endpoint
router.get('/login', async (ctx) => {
  try {
    const issuer = await Issuer.discover(config.ISSUER_URL);
    const client = new issuer.Client(
      {
        client_id: config.CLIENT_ID,
        response_types: ['code'],
        token_endpoint_auth_method: 'private_key_jwt',
        id_token_signed_response_alg: 'ES256',
        userinfo_encrypted_response_alg: 'ECDH-ES+A256KW',
        userinfo_encrypted_response_enc: 'A256GCM',
      },
      { keys: [config.KEYS.PRIVATE_SIG_KEY] }
    );

    const code_verifier = generators.codeVerifier();
    const code_challenge = generators.codeChallenge(code_verifier);
    const nonce = crypto.randomUUID();
    const state = crypto.randomBytes(16).toString('hex');

    ctx.session = ctx.session || {}; // Ensure session exists
    ctx.session.auth = { nonce, state, code_verifier };

    const authorizationUrl = client.authorizationUrl({
      redirect_uri: config.REDIRECT_URI,
      code_challenge_method: 'S256',
      code_challenge,
      nonce,
      state,
      scope: config.SCOPES,
    });

    ctx.redirect(authorizationUrl);
  } catch (err) {
    console.error('Login Error:', err);
    ctx.body = 'Failed to initiate login.';
  }
});

// Callback endpoint
router.get('/callback', async (ctx) => {
  try {
    const issuer = await Issuer.discover(config.ISSUER_URL);
    const client = new issuer.Client(
      {
        client_id: config.CLIENT_ID,
        response_types: ['code'],
        token_endpoint_auth_method: 'private_key_jwt',
        id_token_signed_response_alg: 'ES256',
        userinfo_encrypted_response_alg: 'ECDH-ES+A256KW',
        userinfo_encrypted_response_enc: 'A256GCM',
      },
      { keys: [config.KEYS.PRIVATE_SIG_KEY] }
    );

    const params = ctx.query; // Authorization code
    console.log('Callback Params:', params);

    const tokenSet = await client.callback(config.REDIRECT_URI, params, {
      code_verifier: ctx.session.auth.code_verifier,
    });

    console.log('TokenSet:', tokenSet);

    // Fetch user info
    const userinfo = await client.userinfo(tokenSet.access_token);
    console.log('Userinfo:', userinfo);

    ctx.body = userinfo; // Send user info as response
  } catch (err) {
    console.error('Callback Error:', err);
    ctx.body = 'Failed to process callback.';
  }
});

router.get('/health', (ctx) => {
  ctx.status = 200; // Return HTTP 200 OK
  ctx.body = { status: 'ok' };
});

router.get('/user', function getUser(ctx) {
  if (ctx.session.user) {
    ctx.body = ctx.session.user;
  } else {
    ctx.status = 401;
  }
});

router.get('/logout', function handleLogout(ctx) {
  ctx.session = null;
  ctx.redirect('/');
});

export { router };
