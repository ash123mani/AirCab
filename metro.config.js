const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration for Aircab.
 * @see https://reactnative.dev/docs/metro
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  // The watchman daemon is denied by macOS privacy controls on this machine
  // (TCC: open ~/Documents → Operation not permitted), so Metro uses the
  // Node crawler instead. Re-enable (delete this block) after granting
  // Full Disk Access to watchman/Terminal in System Settings → Privacy.
  resolver: {useWatchman: false},
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
