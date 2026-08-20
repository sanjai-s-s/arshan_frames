// config/cashfree.js
//
// Configuration placeholder for Cashfree (payment gateway). No order
// creation, signature verification, or webhook handling is implemented
// here yet — this only centralises environment-driven settings so the
// real integration has a single place to read them from.
//
// Required environment variables:
//   CASHFREE_APP_ID
//   CASHFREE_SECRET_KEY       (server-side only, NEVER expose)
//   CASHFREE_ENV              - 'TEST' or 'PROD' (defaults to 'TEST')
//   CASHFREE_WEBHOOK_SECRET   - used later to verify webhook signatures

const cashfreeConfig = {
  appId: process.env.CASHFREE_APP_ID || '',
  secretKey: process.env.CASHFREE_SECRET_KEY || '',
  env: process.env.CASHFREE_ENV || 'TEST',
  webhookSecret: process.env.CASHFREE_WEBHOOK_SECRET || '',
  baseUrl:
    process.env.CASHFREE_ENV === 'PROD'
      ? 'https://api.cashfree.com/pg'
      : 'https://sandbox.cashfree.com/pg'
};

/**
 * Confirms the required Cashfree environment variables are present.
 */
function isCashfreeConfigured() {
  return Boolean(cashfreeConfig.appId && cashfreeConfig.secretKey);
}

module.exports = {
  cashfreeConfig,
  isCashfreeConfigured
};
