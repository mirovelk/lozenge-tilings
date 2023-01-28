import ESLintPlugin from 'eslint-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';

import path from 'path';
import StylelintPlugin from 'stylelint-webpack-plugin';
import webpack from 'webpack';

enum WebpackMode {
  Development = 'development',
  Production = 'production',
}

interface Argv {
  mode: WebpackMode;
}

export interface WebpackConfigurationGenerator {
  (env?: unknown, argv?: Argv):
    | webpack.Configuration
    | Promise<webpack.Configuration>;
}

const generateConfig: WebpackConfigurationGenerator = (_env, argv) => {
  const mode =
    argv?.mode === WebpackMode.Production
      ? WebpackMode.Production
      : WebpackMode.Development;
  const isProduction = mode === WebpackMode.Production;

  return {
    mode: isProduction ? 'production' : 'development',
    stats: { errorDetails: true },
    entry: path.join(__dirname, 'src', 'index.tsx'),
    target: ['browserslist'],
    devtool: 'source-map',
    output: {
      path: path.resolve(__dirname, 'build'),
      filename: 'resources/js/[chunkhash].bundle.js',
      clean: true,
      assetModuleFilename: 'resources/assets/[hash].[name][ext]',
      publicPath: isProduction ? './' : '/',
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx|ts|tsx)$/,
          enforce: 'pre',
          loader: 'source-map-loader',
        },
        {
          test: /\.(js|jsx|ts|tsx)$/,
          exclude: /node_modules/,
          use: [
            {
              loader: require.resolve('babel-loader'),
              options: {
                plugins: [
                  !isProduction && require.resolve('react-refresh/babel'),
                ].filter(Boolean),
              },
            },
          ],
        },
        {
          test: /\.css$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
          ],
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: 'asset/resource',
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource',
        },
      ],
    },
    ignoreWarnings: [/Failed to parse source map/], // paper js causes troubles
    plugins: [
      ...(isProduction
        ? [
            new MiniCssExtractPlugin({
              filename: 'resources/css/[chunkhash].[name].css',
            }),
          ]
        : [new ReactRefreshWebpackPlugin()]),
      new ESLintPlugin({
        extensions: ['js', 'jsx', 'ts', 'tsx'],
        exclude: 'node_modules',
        failOnError: isProduction,
      }),
      new StylelintPlugin({
        extensions: ['js', 'jsx', 'ts', 'tsx'],
        exclude: 'node_modules',
      }),
      new HtmlWebpackPlugin({
        template: './src/index.html',
      }),
      new ForkTsCheckerWebpackPlugin({
        async: true,
        typescript: {
          configFile: path.join(__dirname, 'tsconfig.json'),
        },
        devServer: false,
      }),
    ],
    devServer: {
      hot: true,
      client: {
        overlay: false,
      },
    },
  };
};

export default generateConfig;
