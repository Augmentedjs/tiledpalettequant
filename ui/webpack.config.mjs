import path from "path";
import HtmlWebPackPlugin from "html-webpack-plugin";
import FaviconsWebpackPlugin from "favicons-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import webpack from "webpack";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import WebpackPwaManifest from "webpack-pwa-manifest";
import { GenerateSW } from "workbox-webpack-plugin";

const env = process.env.NODE_ENV || "development";
dotenv.config({ path: `.env.${env}` });

console.info(`Base URL: ${process.env.API_URL}`);

import Package from "./package.json" with { type: "json" };

const DefinePlugin = webpack.DefinePlugin;

const isProd = process.argv[process.argv.indexOf("--mode") + 1] === "production";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputPath = process.env.IN_DOCKER === "true" ? "public" : "../public";

const LOGO = "src/images/logo.png";

console.info(`Mode: ${isProd ? "Production" : "Development"}`);
console.info(`Output Path: ${path.resolve(__dirname, outputPath)}`);

const build = {
  entry: "./src/index.tsx",
  context: __dirname,
  target: "web",
  output: {
    clean: true,
    filename: "index.js",
    path: path.resolve(__dirname, outputPath)
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".jsx"],
    fallback: {
      "react/jsx-dev-runtime": "react/jsx-dev-runtime.js",
      "react/jsx-runtime": "react/jsx-runtime.js"
    }
  },
  mode: env === "production" ? "production" : "development",
  devServer: {
    static: {
      directory: path.join(__dirname, "dist")
    },
    compress: true,
    port: 8080
  },
  module: {
    rules: [
      {
        test: /\.tsx|ts?$/,
        exclude: /node_modules/,
        use: {
          loader: "ts-loader"
        }
      },
      {
        test: /\.(jp(e*)g|png|svg|gif)$/,
        type: "asset/resource"
      },
      {
        test: /\.svg$/i,
        issuer: /\.[jt]sx?$/,
        use: ["@svgr/webpack"]
      },
      {
        test: /\.(eot|ttf|otf|woff|woff2)$/,
        type: "asset/resource",
        dependency: { not: ["url"] }
      },
      {
        test: /\.(css)$/,
        use: [
          {
            loader: "style-loader"
          },
          {
            loader: "css-loader",
            options: {
              sourceMap: isProd ? false : true
            }
          }
        ]
      }
    ]
  },
  stats: "errors-only",
  devtool: isProd ? false : "cheap-module-source-map",
  plugins: [
    // Meta Tags and Base HTML
    new HtmlWebPackPlugin({
      template: "./src/index.html",
      filename: "index.html",
      meta: {
        viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
        "mobile-web-app-capable": "yes",
        description: "A simple time tracking and reporting app for use with care givers."
      }
    }),

    // Generate Favicons and Apple Touch Icons
    new FaviconsWebpackPlugin({
      logo: LOGO,
      prefix: "images/",
      inject: true,
      cache: true,
      favicons: {
        appName: "Tile Palette Quant",
        appDescription: "Tile-aware palette quantization for retro consoles (e.g., Sega Genesis / Mega Drive).",
        developerName: "Bob Warren",
        developerURL: "https://www.augmentedjs.com",
        background: "#3A8B02", // Background color for icons
        theme_color: "#000000", // Theme color for the app
        icons: {
          android: true, // Generate Android homescreen icon
          appleIcon: true, // Generate Apple touch icons
          appleStartup: true, // Generate Apple splash screens
          favicons: true, // Generate regular favicons
          firefox: false,
          windows: false,
          yandex: false
        }
      }
    }),

    // Generate PWA Manifest
    new WebpackPwaManifest({
      name: "Tile Palette Quant",
      short_name: "tpq",
      description: "Tile-aware palette quantization for retro consoles (e.g., Sega Genesis / Mega Drive).",
      background_color: "#ffffff",
      theme_color: "#000000",
      crossorigin: "use-credentials",
      filename: "manifest.json",
      publicPath:"/",
      ios: true,
      icons: [
        {
          src: path.resolve(LOGO),
          sizes: [120, 152, 167, 180, 192, 512], // Icon sizes for PWA and iOS
          ios: true
        }
      ]
    }),

    // Generate Service Worker for Offline Support (conditionally added for production)
    ...(isProd
      ? [
          new GenerateSW({
            clientsClaim: true,
            skipWaiting: true,
            runtimeCaching: [
              {
                urlPattern: /^https?.*/, // Cache all HTTP(S) requests
                handler: "NetworkFirst",
                options: {
                  cacheName: "http-cache",
                  expiration: {
                    maxEntries: 50,
                    maxAgeSeconds: 7 * 24 * 60 * 60 // Cache for 7 days
                  }
                }
              }
            ]
          })
        ]
      : []),

    // Extract CSS into separate files
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[id].css"
    }),

    // Define environment variables
    new DefinePlugin({
      ENV: JSON.stringify(process.env.NODE_ENV),
      VERSION: JSON.stringify(Package.version),
      IN_DOCKER: JSON.stringify(process.env.IN_DOCKER),
      API_URL: JSON.stringify(process.env.API_URL)
    })
  ]
};

export default build;
