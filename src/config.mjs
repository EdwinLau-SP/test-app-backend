import * as dotenv from 'dotenv';
dotenv.config(); // Load environment variables

export default {
  ISSUER_URL: process.env.ISSUER_URL || 'https://stg-id.singpass.gov.sg',
  CLIENT_ID: process.env.CLIENT_ID,
  REDIRECT_URI: process.env.REDIRECT_URI || 'https://test-app-backend-bib7.onrender.com/callback',
  SCOPES: process.env.SCOPES || 'openid uinfin name',

  // // Private Signing Key
  // KEYS: {
  //   PRIVATE_SIG_KEY: JSON.parse(process.env.PRIVATE_SIG_KEY),
  //   PRIVATE_ENC_KEY: JSON.parse(process.env.PRIVATE_ENC_KEY),
  //   PUBLIC_SIG_KEY: JSON.parse(process.env.PUBLIC_SIG_KEY),
  //   PUBLIC_ENC_KEY: JSON.parse(process.env.PUBLIC_ENC_KEY),
  // },

  KEYS: {
    PRIVATE_SIG_KEY: {
      alg: 'ES256',
      kty: 'EC',
      x: 'tqG7PiAPD0xTBKdxDd4t8xAjJleP3Szw1CZiBjogmoc',
      y: '256TjvubWV-x-C8lptl7eSbMa7pQUXH9LY1AIHUGINk',
      crv: 'P-256',
      d: 'PgL1UKVpvg_GeKdxV-oUEPIDhGBP2YYZLGiZ5HXDZDI',
      kid: 'my-sig-key',
    },
    PRIVATE_ENC_KEY: {
      alg: 'ECDH-ES+A256KW',
      kty: 'EC',
      x: '_TSrfW3arG1Ebc8pCyT-r5lAFvCh_rJvC5HD5-y8yvs',
      y: 'Sr2vpuU6gzdUiXddGnRJIroXCfdameaR1mgU49H5h9A',
      crv: 'P-256',
      d: 'AEabUwi3VjOOfiyoOtSGrqpl8cfhcUhNtj-xh1l-UYE',
      kid: 'my-enc-key',
    },
    PUBLIC_SIG_KEY: {
      alg: 'ES256',
      kty: 'EC',
      x: 'tqG7PiAPD0xTBKdxDd4t8xAjJleP3Szw1CZiBjogmoc',
      y: '256TjvubWV-x-C8lptl7eSbMa7pQUXH9LY1AIHUGINk',
      crv: 'P-256',
      use: 'sig',
      kid: 'my-sig-key',
    },
    PUBLIC_ENC_KEY: {
      alg: 'ECDH-ES+A256KW',
      kty: 'EC',
      x: '_TSrfW3arG1Ebc8pCyT-r5lAFvCh_rJvC5HD5-y8yvs',
      y: 'Sr2vpuU6gzdUiXddGnRJIroXCfdameaR1mgU49H5h9A',
      crv: 'P-256',
      use: 'enc',
      kid: 'my-enc-key',
    },
  },

  validateConfig: () => {
    if (!process.env.CLIENT_ID) throw new Error('CLIENT_ID is missing');
    if (!process.env.PRIVATE_SIG_KEY || !process.env.PRIVATE_ENC_KEY) {
      throw new Error('Private keys are missing in environment variables');
    }
  },
};

// export default {
//   ISSUER_URL: process.env.ISSUER_URL || 'https://stg-id.singpass.gov.sg',
//   CLIENT_ID: process.env.CLIENT_ID,
//   REDIRECT_URI: process.env.REDIRECT_URI || 'https://test-app-backend-bib7.onrender.com/callback',
//   SCOPES: process.env.SCOPES || 'openid uinfin name',

//   // Private Signing Key
//   KEYS: {
//     PRIVATE_SIG_KEY: {
//       alg: 'ES256',
//       kty: 'EC',
//       crv: 'P-256',
//       d: process.env.PRIVATE_SIG_KEY_D, // Private Key for signing
//       x: process.env.PRIVATE_SIG_KEY_X,
//       y: process.env.PRIVATE_SIG_KEY_Y,
//       kid: process.env.PRIVATE_SIG_KEY_ID,
//       use: 'sig',
//     },
//     PRIVATE_ENC_KEY: {
//       alg: 'ECDH-ES+A256KW',
//       kty: 'EC',
//       crv: 'P-256',
//       d: process.env.PRIVATE_ENC_KEY_D, // Private Key for encryption
//       x: process.env.PRIVATE_ENC_KEY_X,
//       y: process.env.PRIVATE_ENC_KEY_Y,
//       kid: process.env.PRIVATE_ENC_KEY_ID,
//       use: 'enc',
//     },
//   },

//   validateConfig: () => {
//     if (!process.env.CLIENT_ID) throw new Error('CLIENT_ID is missing');
//     if (!process.env.PRIVATE_SIG_KEY_D || !process.env.PRIVATE_ENC_KEY_D) {
//       throw new Error('Private keys are missing in environment variables');
//     }
//   },
// };
