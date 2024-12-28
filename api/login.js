import config from '../src/config.mjs';
import { Issuer, generators } from 'openid-client';
import * as crypto from 'crypto';

export default async function handler(req, res) {
  try {
    const singpassIssuer = await Issuer.discover(config.ISSUER_URL);
    const singpassClient = new singpassIssuer.Client(
      {
        client_id: config.CLIENT_ID,
        response_types: ['code'],
        token_endpoint_auth_method: 'private_key_jwt',
        id_token_signed_response_alg: config.KEYS.PRIVATE_SIG_KEY.alg,
        userinfo_encrypted_response_alg: config.KEYS.PRIVATE_ENC_KEY.alg,
        userinfo_encrypted_response_enc: 'A256GCM',
        userinfo_signed_response_alg: config.KEYS.PRIVATE_SIG_KEY.alg,
      },
      { keys: [config.KEYS.PRIVATE_SIG_KEY, config.KEYS.PRIVATE_ENC_KEY] }
    );

    const code_verifier = generators.codeVerifier();
    const code_challenge = generators.codeChallenge(code_verifier);
    const nonce = crypto.randomUUID();
    const state = crypto.randomBytes(16).toString('hex');

    const authorizationUrl = singpassClient.authorizationUrl({
      redirect_uri: config.REDIRECT_URI,
      code_challenge_method: 'S256',
      code_challenge,
      nonce,
      state,
      scope: config.SCOPES,
    });

    res.redirect(authorizationUrl);
  } catch (error) {
    console.error('Login Error:', error); // Log detailed errors
    res.status(500).json({ error: error.message }); // Return error response
  }
}
