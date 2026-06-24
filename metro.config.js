const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Prefer CommonJS builds so web bundles don't ship bare `import.meta`
// (e.g. zustand middleware) which crashes in classic script tags.
config.resolver.unstable_conditionNames = ['browser', 'require', 'react-native'];

module.exports = config;
