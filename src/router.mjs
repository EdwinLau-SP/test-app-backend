import config from './config.mjs';
import { Issuer, generators, custom } from 'openid-client';
import * as crypto from 'crypto';
import Router from 'koa-router';

// This demo uses panva/node-openid-client, an off-the-shelf OIDC client.

const singpassIssuer = await Issuer.discover(config.ISSUER_URL);

const singpassClient = new singpassIssuer.Client(
  {
    client_id: config.CLIENT_ID,
    response_types: ['code'],
    token_endpoint_auth_method: 'private_key_jwt',
    id_token_signed_response_alg: 'ES256', // Use signed tokens, NOT encrypted
    id_token_encrypted_response_alg: config.KEYS.PRIVATE_ENC_KEY.alg, // Algorithm for encryption
    id_token_encrypted_response_enc: 'A256GCM', // Encryption encoding
    userinfo_encrypted_response_alg: config.KEYS.PRIVATE_ENC_KEY.alg,
    userinfo_encrypted_response_enc: 'A256GCM',
    userinfo_signed_response_alg: config.KEYS.PRIVATE_SIG_KEY.alg,
  },
  { keys: [config.KEYS.PRIVATE_SIG_KEY, config.KEYS.PRIVATE_ENC_KEY] }
);

custom.setHttpOptionsDefaults({
  timeout: 15000,
});

// This demo uses Koa for routing.

const router = new Router();

router.get('/.well-known/jwks.json', function getJwks(ctx) {
  ctx.body = { keys: [config.KEYS.PUBLIC_SIG_KEY, config.KEYS.PUBLIC_ENC_KEY] };
});

router.get('/login', async function handleLogin(ctx) {
  const code_verifier = generators.codeVerifier();
  const code_challenge = generators.codeChallenge(code_verifier);
  const nonce = crypto.randomUUID();
  const state = crypto.randomBytes(16).toString('hex');
  ctx.session.auth = { code_verifier, nonce, state };

  // Authorization request
  const authorizationUrl = singpassClient.authorizationUrl({
    redirect_uri: config.REDIRECT_URI,
    code_challenge_method: 'S256',
    code_challenge,
    nonce,
    state,
    scope: config.SCOPES,
  });
  ctx.redirect(authorizationUrl);
});

router.get('/callback', async function handleSingpassCallback(ctx) {
  try {
    const receivedQueryParams = ctx.request.query;
    console.error('receivedQueryParams', receivedQueryParams);
    const { code_verifier, nonce, state } = ctx.session.auth; // Could possibly be hardcoded.
    console.error('ctx.session.auth', ctx.session.auth);
    console.error('config.KEYS.PRIVATE_ENC_KEY', config.KEYS.PRIVATE_ENC_KEY);
    // Token request
    const tokenSet = await singpassClient.callback(config.REDIRECT_URI, receivedQueryParams, {
      code_verifier,
      nonce,
      state,
      key: config.KEYS.PRIVATE_ENC_KEY, // Decrypt using the private encryption key
    });
    //additional line for decryption
    const decryptedToken = await singpassClient.decryptIdToken(tokenSet.id_token, config.KEYS.PRIVATE_ENC_KEY);
    console.error('Decrypted ID Token:', decryptedToken);
    //end of additional line for decryption

    console.error('These are the claims in the ID token:');
    console.error('Raw ID Token:', tokenSet.id_token);
    console.error(tokenSet.claims());

    // Userinfo request (available only to apps with additional allowed scopes, beyond just 'openid').
    // const userInfo = await singpassClient.userinfo(tokenSet); // -- OG
    const userInfo = await singpassClient.userinfo(tokenSet.access_token, {
      key: config.KEYS.PRIVATE_ENC_KEY, // Decrypt using the private encryption key
    });

    console.error('This is the user info returned:');
    console.error(userInfo);

    ctx.session.user = { ...tokenSet.claims(), ...userInfo };
    ctx.redirect('/');
  } catch (err) {
    console.error('[ACTUAL ERROR]', err);
    ctx.status = 401;
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

// import config from './config.mjs';
// import { Issuer, generators } from 'openid-client';
// import * as crypto from 'node:crypto';
// import Router from 'koa-router';

// const router = new Router();

// // Authorization endpoint
// router.get('/login', async (ctx) => {
//   try {
//     console.log('Start of /login');
//     const issuer = await Issuer.discover(config.ISSUER_URL);
//     const client = new issuer.Client(
//       {
//         client_id: config.CLIENT_ID,
//         response_types: ['code'],
//         token_endpoint_auth_method: 'private_key_jwt',
//         id_token_signed_response_alg: 'ES256',
//         userinfo_encrypted_response_alg: 'ECDH-ES+A256KW',
//         userinfo_encrypted_response_enc: 'A256GCM',
//       },
//       { keys: [config.KEYS.PRIVATE_SIG_KEY] }
//     );

//     const code_verifier = generators.codeVerifier();
//     const code_challenge = generators.codeChallenge(code_verifier);
//     const nonce = crypto.randomUUID();
//     const state = crypto.randomBytes(16).toString('hex');

//     ctx.session = ctx.session || {}; // Ensure session exists
//     ctx.session.auth = { nonce, state, code_verifier };

//     const authorizationUrl = client.authorizationUrl({
//       redirect_uri: config.REDIRECT_URI,
//       code_challenge_method: 'S256',
//       code_challenge,
//       nonce,
//       state,
//       scope: config.SCOPES,
//     });

//     console.log('End of /login');

//     ctx.redirect(authorizationUrl);
//   } catch (err) {
//     console.error('Login Error:', err);
//     ctx.body = 'Failed to initiate login.';
//   }
// });

// // Callback endpoint
// router.get('/callback', async (ctx) => {
//   try {
//     console.log('Start of /callback');
//     const issuer = await Issuer.discover(config.ISSUER_URL);
//     const client = new issuer.Client(
//       {
//         client_id: config.CLIENT_ID,
//         response_types: ['code'],
//         token_endpoint_auth_method: 'private_key_jwt',
//         id_token_signed_response_alg: 'ES256',
//         userinfo_encrypted_response_alg: 'ECDH-ES+A256KW',
//         userinfo_encrypted_response_enc: 'A256GCM',
//       },
//       { keys: [config.KEYS.PRIVATE_SIG_KEY] }
//     );

//     const params = ctx.query; // Authorization code
//     console.log('Callback Params:', params);

//     const tokenSet = await client.callback(config.REDIRECT_URI, params, {
//       code_verifier: ctx.session.auth.code_verifier,
//     });

//     console.log('TokenSet:', tokenSet);

//     // Fetch user info
//     const userinfo = await client.userinfo(tokenSet.access_token);
//     console.log('Userinfo:', userinfo);

//     ctx.body = userinfo; // Send user info as response
//     console.log('End of /callback');
//   } catch (err) {
//     console.error('Callback Error:', err);
//     ctx.body = 'Failed to process callback.';
//   }
// });

// router.get('/health', (ctx) => {
//   ctx.status = 200; // Return HTTP 200 OK
//   ctx.body = { status: 'ok' };
// });

// router.get('/user', function getUser(ctx) {
//   console.log('Start of /user');
//   if (ctx.session.user) {
//     ctx.body = ctx.session.user;
//   } else {
//     ctx.status = 401;
//   }
//   console.log('End of /user');
// });

// router.get('/logout', function handleLogout(ctx) {
//   ctx.session = null;
//   ctx.redirect('/');
// });

// export { router };
