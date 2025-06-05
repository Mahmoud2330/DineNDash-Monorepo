const NodeCache = require('node-cache');

// Default TTL in seconds
const DEFAULT_TTL = 60;

// Create a cache instance
const cache = new NodeCache();

// Get value from cache
function get(key) {
  return cache.get(key);
}

// Set value in cache
function set(key, value, ttl = DEFAULT_TTL) {
  return cache.set(key, value, ttl);
}

// Delete value from cache
function del(key) {
  return cache.del(key);
}

// For future: swap this implementation for Redis client with same interface
module.exports = {
  get,
  set,
  del,
  DEFAULT_TTL
}; 