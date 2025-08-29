import * as CONSTANTS from "./constants.mjs";
import Package from "./package.json" with { type: "json" };
const pad = (s) => {
  return (s < 10 ? "0" : "") + s;
},
format = (seconds) => {
  const hours = Math.floor(seconds / (60*60)),
        minutes = Math.floor(seconds % (60*60) / 60),
        s = Math.floor(seconds % 60);
  return pad(hours) + ":" + pad(minutes) + ":" + pad(s);
},
parseList = (obj) => {
  let html = "", i = 0;
  if (obj) {
    const keys = Object.keys(obj), l = keys.length;
    for (i; i < l; i++) {
      html += `<li><strong>${keys[i]}</strong>: ${obj[keys[i]]}</li>`;
    }
  }
  return html;
} ;

class About {
  constructor() {
  };

  static toJSON() {
    return {
      "name": CONSTANTS.ABOUT,
      "description": Package.description,
      "version": Package.version,
      "author": Package.author,
      "port": CONSTANTS.PORT,
      "libraries": process.versions,
      "dependencies": Package.dependencies,
      "uptime": format(process.uptime()),
      "environment": (process.env.NODE_ENV) ? (process.env.NODE_ENV) : "development"
    };
  };

  static toHTML() {
    const json = this.toJSON();
    return /*html*/`<!DOCTYPE html>
      <html lang="en">
        <head>
          <title>Uptime and Configuration</title>
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
      		<meta name="apple-mobile-web-app-capable" content="yes"/>
      		<meta name="apple-mobile-web-app-status-bar-style" content="black"/>
          <meta name="viewport" content="user-scalable=no, initial-scale=1, maximum-scale=1, minimum-scale=1, width=device-width, viewport-fit=cover"/>
          <meta name="theme-color" content="#e0e0e0"/>
          <style>
            body {
              background-color: #e0e0e0;
              font-family: "Roboto Mono", "Noto Mono", "Ubuntu Mono", "Monoco", "Andale Mono", "monospace";
              font-size: 16px;
              font-weight: 300;
              color: rgba(0, 0, 0, 0.85);
            }
            h1 {
              text-align: center;
              font-size: 1.5rem;
            }
            h2 {
              font-size: 1.25rem;
            }
            h3 {
              text-indent: 0.5rem;
              font-size: 1rem;
            }
            p {
              text-indent: 1rem;
            }
            main {
              display: block;
              background-color: #eeeeee;
              border-radius: 0.25rem;
              padding: 1rem;
              margin: 1rem auto;
              width: 30rem;
            }
            @media (prefers-color-scheme: dark) {
              body {
                background-color: #101010;
                color: rgba(255, 255, 255, 0.85);
              }
              main {
                background-color: #303030;
              }
            }
          </style>
        </head>
        <body>
          <article>
            <section>
              <main>
                <h1>Basic Information<h1>
                <h2>Name</h2>
                <p>${json.name}</p>
                <h2>Description</h2>
                <p>${json.description}</p>
                <h2>Author</h2>
                <p>${json.author}</p>
                <h2>Version</h2>
                <p>${json.version}</p>
                <h1>Service</h1>
                <h2>Config</h2>
                <h3>Port</h3>
                <p>${json.port}</p>
                <h3>Environment</h3>
                <p>${json.environment}</p>
                <h3>Uptime</h3>
                <p>${json.uptime}</p>
                <h2>Libraries &amp; Dependencies</h2>
                <h3>Libraries</h3>
                <ul>${parseList(json.libraries)}</ul>
                <h3>Dependencies</h3>
                <ul>${parseList(json.dependencies)}</ul>
              </main>
            </section>
          </article>
        </body>
      </html>`;
  };
};

export default About;
