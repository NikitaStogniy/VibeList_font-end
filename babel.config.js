module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        'babel-preset-expo',
        {
          // Disable the React Compiler for now as it may cause issues with the new architecture
          unstable_transformProfile: 'hermes-stable',
        },
      ],
    ],
    plugins: [
      // Reanimated plugin needs to be listed last
      'react-native-reanimated/plugin',
    ],
  };
};
