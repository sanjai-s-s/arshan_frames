// api/orders.js
//
// POST /api/orders
//
// Placeholder route for future order creation. Will eventually call
// services/supabaseService.createOrder(). Left intentionally
// unimplemented for this phase — returns 501 so the frontend/team can
// tell "not built yet" apart from "server error".

const { sendError } = require('../utils/response');

module.exports = function handler(req, res) {
  sendError(
    res,
    501,
    'Order creation is not implemented yet. This route is reserved for Supabase integration.'
  );
};
