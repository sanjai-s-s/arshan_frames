// utils/env.js
//
// Tiny helper for reading required environment variables with a clear
// error message if one is missing, instead of routes failing with a
// confusing "undefined" deep inside a provider SDK.

/**
 * @param {string} name - environment variable name
 * @param {{ required?: boolean, fallback?: string }} [options]
 */
function getEnv(name, options) {
  const opts = options || {};
  const value = process.env[name];

  if (!value && opts.required) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value || opts.fallback || '';
}

/**
 * Checks a list of env var names and returns which ones are missing.
 * Useful for a health-check route.
 * @param {string[]} names
 * @returns {string[]} missing variable names
 */
function getMissingEnv(names) {
  return names.filter(function (name) {
    return !process.env[name];
  });
}

module.exports = {
  getEnv,
  getMissingEnv
};
