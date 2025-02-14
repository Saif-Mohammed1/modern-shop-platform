import { NextRequest, NextResponse } from "next/server";

const { createServer } = require("https");
const { parse } = require("url");
const next = require("next");
const fs = require("fs");
const path = require("path");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const httpsOptions = {
  key: fs.readFileSync(path.join(__dirname, "config/localhost-key.pem")),
  cert: fs.readFileSync(path.join(__dirname, "config/localhost.pem")),
};
const port = parseInt(process.env.PORT || "3000", 10);
app.prepare().then(() => {
  createServer(httpsOptions, (req: NextRequest, res: NextResponse) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, (err: any) => {
    if (err) throw err;
    console.log(
      `> Server listening at https://localhost:${port} as ${
        dev ? "development" : process.env.NODE_ENV
      }`
    );
    // console.log("> Server started on https://localhost:" + Port);
  });
});
