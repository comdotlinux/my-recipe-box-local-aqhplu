
const { getDefaultConfig } = require('expo/metro-config');
const { FileStore } = require('metro-cache');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Use turborepo to restore the cache when possible
config.cacheStores = [
  new FileStore({ root: path.join(__dirname, 'node_modules', '.cache', 'metro') }),
];

// Add support for WASM files and better web compatibility
config.resolver.assetExts.push('wasm');

// Add platform-specific extensions
config.resolver.platforms = ['native', 'web', 'ios', 'android'];

// Handle WASM module resolution for web
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Transform configuration for better web support
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

module.exports = config;
