// config/index.js
//
// Single entry point for all backend configuration. Import from here
// rather than reaching into individual files, e.g.:
//   const { supabaseConfig, cashfreeConfig } = require('../config');

const { supabaseConfig, isSupabaseConfigured } = require('./supabase');
const { cloudinaryConfig, isCloudinaryConfigured } = require('./cloudinary');
const { cashfreeConfig, isCashfreeConfigured } = require('./cashfree');

module.exports = {
  supabaseConfig,
  isSupabaseConfigured,
  cloudinaryConfig,
  isCloudinaryConfigured,
  cashfreeConfig,
  isCashfreeConfigured
};
