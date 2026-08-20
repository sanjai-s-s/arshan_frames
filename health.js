// api/health.js
//
// GET /api/health
//
// Simple Vercel serverless function to confirm the backend scaffold is
// deployed correctly and to report (without ever exposing values) which
// provider environment variables are still missing. No Supabase,
// Cloudinary, or Cashfree calls happen here — this only reads env vars.

const { getMissingEnv } = require('../utils/env');
const { sendSuccess } = require('../utils/response');

module.exports = function handler(req, res) {
  const missing = {
    supabase: getMissingEnv(['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']),
    cloudinary: getMissingEnv([
      'CLOUDINARY_CLOUD_NAME',
      'CLOUDINARY_API_KEY',
      'CLOUDINARY_API_SECRET'
    ]),
    cashfree: getMissingEnv(['CASHFREE_APP_ID', 'CASHFREE_SECRET_KEY'])
  };

  sendSuccess(res, {
    status: 'ok',
    message: 'Backend scaffold is deployed. Providers are not yet implemented.',
    missingEnvVars: missing
  });
};
