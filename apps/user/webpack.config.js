const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')
const { join, resolve } = require('path')

module.exports = {
  output: {
    path: join(__dirname, '../../dist/apps/user'),  // 수정됨
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.mjs', '.js', '.jsx', '.json', '.cjs'],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: resolve(__dirname, '../../tsconfig.base.json'),
      }),
    ],
    symlinks: true,
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
      includeLibsInBundle: true,  // 내부 라이브러리 번들링
    }),
  ],
  externals: [],  // 모든 모듈을 번들에 포함
  mode: 'production',
  devtool: 'source-map',
}