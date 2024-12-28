import * as dotenv from 'dotenv';
dotenv.config(); // Load environment variables

export default {
  ISSUER_URL: process.env.ISSUER_URL || 'https://stg-id.singpass.gov.sg',
  CLIENT_ID: process.env.CLIENT_ID,
  REDIRECT_URI: process.env.REDIRECT_URI || 'http://localhost:3000/callback',
  SCOPES: process.env.SCOPES || 'openid uinfin name',

  // Private Signing Key
  KEYS: {
    PRIVATE_SIG_KEY: {
      alg: 'ES256',
      kty: 'EC',
      crv: 'P-256',
      d: process.env.PRIVATE_SIG_KEY_D, // Private Key for signing
      x: process.env.PRIVATE_SIG_KEY_X,
      y: process.env.PRIVATE_SIG_KEY_Y,
      kid: process.env.PRIVATE_SIG_KEY_ID,
      use: 'sig',
    },
    PRIVATE_ENC_KEY: {
      alg: 'ECDH-ES+A256KW',
      kty: 'EC',
      crv: 'P-256',
      d: process.env.PRIVATE_ENC_KEY_D, // Private Key for encryption
      x: process.env.PRIVATE_ENC_KEY_X,
      y: process.env.PRIVATE_ENC_KEY_Y,
      kid: process.env.PRIVATE_ENC_KEY_ID,
      use: 'enc',
    },
  },
};
