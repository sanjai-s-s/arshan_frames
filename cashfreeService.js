// services/cashfreeService.js
//
// Placeholder service layer for Cashfree. Will eventually create
// payment sessions and verify webhook signatures. The checkout page's
// "Proceed to Secure Payment" button will call an /api route that
// delegates to this service once implemented.

const { isCashfreeConfigured } = require('../config');

/**
 * NOT IMPLEMENTED YET.
 * Will create a Cashfree payment session for an order and return the
 * payment_session_id / redirect URL the frontend uses to launch checkout.
 * @param {{ orderId: string, amount: number, customer: object }} params
 * @returns {Promise<{ paymentSessionId: string }>}
 */
async function createPaymentSession(params) {
  guardConfigured();
  throw new Error('cashfreeService.createPaymentSession is not implemented yet.');
}

/**
 * NOT IMPLEMENTED YET.
 * Will verify an incoming Cashfree webhook's signature against
 * CASHFREE_WEBHOOK_SECRET before trusting its payload.
 * @param {string} rawBody
 * @param {string} signatureHeader
 * @returns {boolean}
 */
function verifyWebhookSignature(rawBody, signatureHeader) {
  guardConfigured();
  throw new Error('cashfreeService.verifyWebhookSignature is not implemented yet.');
}

function guardConfigured() {
  if (!isCashfreeConfigured()) {
    throw new Error(
      'Cashfree is not configured. Set CASHFREE_APP_ID and CASHFREE_SECRET_KEY.'
    );
  }
}

module.exports = {
  createPaymentSession,
  verifyWebhookSignature
};
