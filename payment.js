// api/payment.js
//
// POST /api/payment
//
// Placeholder route for future Cashfree payment session creation. Will
// eventually call services/cashfreeService.createPaymentSession() and
// return a payment_session_id for the checkout page's "Proceed to
// Secure Payment" button to use. Reserved for a later phase.

const { sendError } = require('../utils/response');

module.exports = function handler(req, res) {
  sendError(
    res,
    501,
    'Payment session creation is not implemented yet. This route is reserved for Cashfree integration.'
  );
};
