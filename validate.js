// utils/validate.js
//
// Lightweight, dependency-free validation helpers shared across API
// routes. Intentionally simple — mirrors the same rules already used
// client-side in customer-details.js so backend validation stays
// consistent with what the customer sees.

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isValidMobile(value) {
  return typeof value === 'string' && /^[6-9]\d{9}$/.test(value.trim());
}

function isValidEmail(value) {
  if (!value) return true; // email is optional
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
}

function isValidPincode(value) {
  return typeof value === 'string' && /^\d{6}$/.test(value.trim());
}

/**
 * Validates a customer details payload shaped like the object built in
 * customer-details.js. Returns { valid, errors } instead of throwing,
 * so routes can decide how to respond.
 */
function validateCustomerPayload(customer) {
  const errors = {};
  if (!customer) {
    return { valid: false, errors: { _base: 'Missing customer payload.' } };
  }

  if (!isNonEmptyString(customer.fullName)) errors.fullName = 'Full name is required.';
  if (!isValidMobile(customer.mobile)) errors.mobile = 'Enter a valid 10-digit mobile number.';
  if (!isValidEmail(customer.email)) errors.email = 'Enter a valid email address.';
  if (!isNonEmptyString(customer.address)) errors.address = 'Address is required.';
  if (!isNonEmptyString(customer.city)) errors.city = 'City is required.';
  if (!isNonEmptyString(customer.state)) errors.state = 'State is required.';
  if (!isValidPincode(customer.pincode)) errors.pincode = 'Enter a valid 6-digit pincode.';

  return { valid: Object.keys(errors).length === 0, errors };
}

module.exports = {
  isNonEmptyString,
  isValidMobile,
  isValidEmail,
  isValidPincode,
  validateCustomerPayload
};
