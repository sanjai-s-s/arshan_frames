// config/cloudinary.js
//
// Configuration placeholder for Cloudinary (used later for storing
// customer-uploaded frame photos). No upload/transform logic here yet —
// just centralised, environment-driven settings.
//
// Required environment variables:
//   CLOUDINARY_CLOUD_NAME
//   CLOUDINARY_API_KEY
//   CLOUDINARY_API_SECRET       (server-side only, NEVER expose)
//   CLOUDINARY_UPLOAD_FOLDER    - optional, defaults to 'cadre/orders'

const cloudinaryConfig = {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
  apiKey: process.env.CLOUDINARY_API_KEY || '',
  apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  uploadFolder: process.env.CLOUDINARY_UPLOAD_FOLDER || 'cadre/orders'
};

/**
 * Confirms the required Cloudinary environment variables are present.
 */
function isCloudinaryConfigured() {
  return Boolean(
    cloudinaryConfig.cloudName &&
    cloudinaryConfig.apiKey &&
    cloudinaryConfig.apiSecret
  );
}

module.exports = {
  cloudinaryConfig,
  isCloudinaryConfigured
};
