// services/cloudinaryService.js
//
// Placeholder service layer for Cloudinary. Will eventually receive the
// customer's uploaded photo (currently kept as a base64 data URL in
// sessionStorage on the frontend) and persist it to Cloudinary instead,
// returning a hosted URL to store against the order.

const { isCloudinaryConfigured } = require('../config');

/**
 * NOT IMPLEMENTED YET.
 * Will upload a base64/data-URL image to Cloudinary and return the
 * resulting secure URL + public_id.
 * @param {string} dataUrl - base64-encoded image data
 * @param {{ orderId?: string }} [options]
 * @returns {Promise<{ url: string, publicId: string }>}
 */
async function uploadImage(dataUrl, options) {
  guardConfigured();
  throw new Error('cloudinaryService.uploadImage is not implemented yet.');
}

/**
 * NOT IMPLEMENTED YET.
 * Will delete a previously uploaded image, e.g. if an order is cancelled.
 * @param {string} publicId
 */
async function deleteImage(publicId) {
  guardConfigured();
  throw new Error('cloudinaryService.deleteImage is not implemented yet.');
}

function guardConfigured() {
  if (!isCloudinaryConfigured()) {
    throw new Error(
      'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.'
    );
  }
}

module.exports = {
  uploadImage,
  deleteImage
};
