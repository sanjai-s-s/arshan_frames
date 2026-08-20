// services/supabaseService.js
//
// Placeholder service layer for Supabase. Each method documents the
// contract the API routes will rely on. No implementation yet —
// wiring up @supabase/supabase-js happens in a later phase.

const { isSupabaseConfigured } = require('../config');

/**
 * NOT IMPLEMENTED YET.
 * Will insert a new order row (frame/colour/size/qty/photo/customer/total)
 * into Supabase and return the created record's id.
 * @param {object} orderPayload
 * @returns {Promise<{ id: string }>}
 */
async function createOrder(orderPayload) {
  guardConfigured();
  throw new Error('supabaseService.createOrder is not implemented yet.');
}

/**
 * NOT IMPLEMENTED YET.
 * Will fetch a single order by id.
 * @param {string} orderId
 * @returns {Promise<object|null>}
 */
async function getOrderById(orderId) {
  guardConfigured();
  throw new Error('supabaseService.getOrderById is not implemented yet.');
}

/**
 * NOT IMPLEMENTED YET.
 * Will update an order's payment status once Cashfree confirms payment.
 * @param {string} orderId
 * @param {string} status - e.g. 'PAID' | 'FAILED' | 'PENDING'
 */
async function updateOrderStatus(orderId, status) {
  guardConfigured();
  throw new Error('supabaseService.updateOrderStatus is not implemented yet.');
}

function guardConfigured() {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
    );
  }
}

module.exports = {
  createOrder,
  getOrderById,
  updateOrderStatus
};
