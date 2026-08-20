// api/webhooks/cashfree.js
//
// POST /api/webhooks/cashfree
//
// Placeholder webhook receiver. Will eventually verify the signature
// via services/cashfreeService.verifyWebhookSignature() and update the
// order's payment status via services/supabaseService.updateOrderStatus().
// Reserved for a later phase.

const { sendError } = require('../../utils/response');

module.exports = function handler(req, res) {
  sendError(
    res,
    501,
    'Cashfree webhook handling is not implemented yet.'
  );
};
