const webpack = require('webpack')

module.exports = {
  babel: {
    plugins: ['@babel/plugin-syntax-import-assertions'],
  },
  devServer: {
    port: 4269,
  },
  webpack: {
    configure: (webpackConfig) => {
      // Add ProvidePlugin for global process availability
      webpackConfig.plugins = [
        ...webpackConfig.plugins,
        new webpack.ProvidePlugin({
          process: 'process/browser',
        }),
      ]

      return webpackConfig
    },
  },
}
