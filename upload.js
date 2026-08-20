// api/upload.js
//
// POST /api/upload
//
// Placeholder route for future photo uploads. Will eventually call
// services/cloudinaryService.uploadImage() to move the customer's
// photo off sessionStorage/base64 and onto Cloudinary. Reserved for a
// later phase — returns 501 for now.

const { sendError } = require('../utils/response');

module.exports = function handler(req, res) {
  sendError(
    res,
    501,
    'Photo upload is not implemented yet. This route is reserved for Cloudinary integration.'
  );
};
