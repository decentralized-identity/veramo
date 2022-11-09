// const CracoLessPlugin = require('craco-less')
const webpack = require('webpack')

module.exports = {
  webpack: {
    plugins: [
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
      }),
    ],
    configure: {
        resolve: {
            fallback: {
                'crypto': require.resolve('crypto-browserify'),
                'stream': require.resolve('stream-browserify')
            }
        }
    }
  },
  babel: {
    "presets": [
      [
        "@babel/preset-env",
        {
          "targets": {
            "node": "current"
          }
        }
      ],
      "@babel/preset-typescript"
    ]
  },
//   plugins: [
//     {
//       plugin: CracoLessPlugin,
//       options: {
//         lessLoaderOptions: {
//           lessOptions: {
//             javascriptEnabled: true,
//           },
//         },
//       },
//     },
//   ],
}
