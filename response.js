// utils/response.js
//
// Small helpers to keep every /api route returning the same JSON shape.
// Usage inside a Vercel serverless function:
//   const { sendSuccess, sendError } = require('../utils/response');
//   sendSuccess(res, { orderId: '123' });
//   sendError(res, 400, 'Missing required field: email');

function sendSuccess(res, data, statusCode) {
  res.status(statusCode || 200).json({
    success: true,
    data: data || null
  });
}

function sendError(res, statusCode, message, details) {
  res.status(statusCode || 500).json({
    success: false,
    error: {
      message: message || 'Something went wrong.',
      details: details || undefined
    }
  });
}

module.exports = {
  sendSuccess,
  sendError
};
