// Static hosting has no Node server, so this renders the page once at build
// time (same renderToString as server.js) and writes it next to client.js,
// which then hydrates it in the browser exactly like before.
//
//   BASE_PATH=/16-manual-ssr/ OUT_DIR=../dist/16-manual-ssr node build.js
const { mkdirSync, writeFileSync, copyFileSync } = require("fs");
const path = require("path");

process.env.PRERENDER = "true";
require("@babel/register")({ extensions: [".js", ".jsx"] });

const { renderPage } = require("./server.js");

const basePath = process.env.BASE_PATH || "/";
const outDir = path.resolve(process.env.OUT_DIR || "dist");

mkdirSync(outDir, { recursive: true });
writeFileSync(
  path.join(outDir, "index.html"),
  renderPage().replace('src="/client.js"', `src="${basePath}client.js"`)
);
copyFileSync(path.join(__dirname, "client.js"), path.join(outDir, "client.js"));

console.log(`Pre-rendered page written to ${outDir}`);
