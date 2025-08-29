export const PORT = process.env.PORT ? process.env.PORT : 8080;

export const ALLOWED_ORIGINS = process.env.IN_DOCKER
  ? [
      "http://localhost",
      "https://www.augmentedjs.com"
    ]
  : [
      "https://www.augmentedjs.com"
    ];

export const ABOUT = "Tiled Palette Quant";
export const ENVIRONMENT = process.env.NODE_ENV || "development";
