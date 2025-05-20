const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')
const { join, resolve } = require('path')

module.exports = {
  output: {
    path: join(__dirname, '../../dist/apps/event'),
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.mjs', '.js', '.jsx', '.json', '.cjs'],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: resolve(__dirname, '../../tsconfig.base.json'),
      }),
    ],
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      assets: ['./src/assets'],
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: true,
    }),
  ]
}
