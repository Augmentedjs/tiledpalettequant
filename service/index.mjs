import express from "express";
import bodyParser from "body-parser";
import path from "path";
import compression from "compression";
import partials from "express-partials";
import methodOverride from "method-override";
import favicon from "serve-favicon";
import helmet from "helmet";
import { fileURLToPath } from "url";
import cache from "cache-express";
import * as CONSTANTS from "./constants.mjs";
import About from "./about.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

const shouldCompress = (req, res) =>
  req.headers["x-no-compression"] ? false : compression.filter(req, res);

app.use(
  helmet({
    frameguard: false,
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "manifest-src": [
          "'self'",
          "*",
          "data:",
          "https://www.augmentedjs.com",
        ],
        "img-src": [
          "'self'",
          "*",
          "data:",
          "https://www.augmentedjs.com",
        ]
      }
    }
  })
);

app.use(favicon(path.join(__dirname, "images", "logo.png")));
app.use(partials());
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(compression({ filter: shouldCompress }));
app.use(methodOverride());

// Enable CORS
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (CONSTANTS.ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Authorization,X-Requested-With,content-type,access-control-allow-headers,access-control-allow-methods,access-control-allow-origin"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .send(`<html><body><h1>Ugly error page!</h1><p>${JSON.stringify(err)}</p></body></html>`);
});

app.get("/about", cache({ timeOut: 60000 }), (req, res) => {
  res.status(200).send(About.toHTML());
});

// API

// The UI
app.use("/", express.static(path.join(__dirname, "../public")));

// Start the server
app.listen(process.env.PORT, async () => {
  console.info(
    `${CONSTANTS.ABOUT} listening at port ${process.env.PORT} in Env: ${process.env.NODE_ENV}`
  );
});
