const path = require('path');
const webpack = require('webpack');
const dotenv = require('dotenv');
const fs = require('fs');

//plugin definitions
const HtmlPlugin = require('html-webpack-plugin');
const HtmlHarddiskPlugin = require('html-webpack-harddisk-plugin');
const LoadableComponentsPlugin = require('@loadable/webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ReactRefreshPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const { HotModuleReplacementPlugin } = webpack;

module.exports = env => {
    //DEFINE ENVIRONMENT
    const isDevelopment = ( env.NODE_ENV && env.NODE_ENV === 'dev' ) ||  ( process.env.NODE_ENV && process.env.NODE_ENV === 'dev' );
    console.log(`Running in ${ isDevelopment ? 'development' : 'production' } mode`);

    function generateEnvKeys() {
        const envConfig = dotenv.config({ 
            path: path.join(__dirname, isDevelopment ? `/.env.dev` : `/.env`) 
        }).parsed;
        
        const envKeys = Object.keys(envConfig).reduce((acc, next) => {
            acc[`process.env.${next}`] = JSON.stringify(envConfig[next]);
            return acc;
        }, {});

        return envKeys;
    }

    //config object start
    return {
        //ENVIRONMENTAL OPTIONS AND TOOLS
        mode: isDevelopment ? 'development' : 'production',
        devtool: isDevelopment ? 'cheap-module-source-map' : 'hidden-source-map',
        devServer: {
            contentBase: './dist/public',
            publicPath: '/static/',
            historyApiFallback: true,
            compress: true,
            hot: true,
            //host: '0.0.0.0',
            port: 3000
        },

        //INPUT AND OUTPUT
        target: 'web',
        entry: path.join(__dirname, 'src/app.js'),
        output: {
            filename: isDevelopment ? 'js/[name].js' : 'js/[name].[hash].js',
            chunkFilename: isDevelopment ? 'js/[name].js' : 'js/[name].[hash].js',
            path: path.join(__dirname,'dist/public/'),
            publicPath: '/static/'
        },

        //RESOLVE
        resolve: {
            alias: {
                assets: path.join(__dirname, 'src/assets'),
                app: path.join(__dirname, 'src/app'),
                features: path.join(__dirname, 'src/features'),
                pages: path.join(__dirname, 'src/pages'),
            },
            mainFiles: ['index']
        },
        
        //PLUGINS
        plugins: [
            !isDevelopment && new MiniCssExtractPlugin({
                filename: isDevelopment ? 'css/[name].css' : 'css/[name].[contenthash].css',
                chunkFilename: isDevelopment ? 'css/[name].css' : 'css/[name].[contenthash].css',
            }),
            new LoadableComponentsPlugin({
                writeToDisk: { filename: './dist' }
            }),
            isDevelopment && new HotModuleReplacementPlugin(),
            isDevelopment && new ReactRefreshPlugin(),
            new HtmlPlugin({
                title: 'Matoon',
                template: './template.html',
                alwaysWriteToDisk: true,
            }),
            new HtmlHarddiskPlugin(),
            new webpack.DefinePlugin(generateEnvKeys())
        ].filter(Boolean),

        //MODULE
        module: {
            rules: [
                {
                    test: /\.js?$/,
                    loader: 'babel-loader',
                    options: {
                        presets: [ '@babel/preset-env', '@babel/preset-react' ],
                        plugins: [ '@loadable/babel-plugin' ]
                    }
                },
                //
                {
                    test: /\.s[ac]ss$/i,
                    use: [
                        isDevelopment ? 'style-loader' :
                        {
                            loader: MiniCssExtractPlugin.loader,
                            options: { publicPath: '../' }
                        },
                        'css-loader',
                        {
                            loader: 'postcss-loader',
                            options: { plugins: [ require('autoprefixer') ] }
                        },
                        {
                            loader: 'sass-loader',
                            options: {
                                sourceMap: true,
                                sassOptions: { includePaths: [ 'src/assets' ] }
                            }
                        }
                    ]
                },
                //
                {
                    test: /\.(jpg|png|svg)$/,
                    loader: 'file-loader',
                    options: { outputPath: './images' }
                },
                //
                {
                    test: /\.(ttf|eot|woff|woff2)$/,
                    loader: 'file-loader',
                    options: { outputPath: './fonts' }
                }
            ]
        }
        //config object end
    }
}