module.exports = (api) => {
  api.cache(() => process.env.NODE_ENV);

  const presets = [ "minify" ];
  const plugins = [ "lodash" ];

  return {
    presets,
    plugins
  };
};
