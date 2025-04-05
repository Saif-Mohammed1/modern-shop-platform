import fs from "fs";
import type { IncomingMessage, ServerResponse } from "http";
import { createServer } from "https";
import path from "path";
import { parse } from "url";

// Add to server.ts
import heapdump from "heapdump";
import next from "next";

// Take a heap dump when memory exceeds 1GB
setInterval(() => {
  if (process.memoryUsage().heapUsed > 1e9) {
    const filename = `./config/heapdump-${Date.now()}.heapsnapshot`;
    heapdump.writeSnapshot(filename, (err) => {
      if (err) console.error("Heap dump failed:", err);
      else console.log(`Heap dump saved to: ${filename}`);
    });
  }
}, 10000);
// Check if running in debug mode
const dev = process.env.NODE_ENV !== "production";

// Allow passing port via command line argument (e.g., `node server.js 4000`)
const args = process.argv.slice(2);
const port = parseInt(args[0] || process.env.PORT || "3000", 10);

const app = next({ dev });
const handle = app.getRequestHandler();

const httpsOptions = {
  key: fs.readFileSync(path.join(__dirname, "config/localhost-key.pem")),
  cert: fs.readFileSync(path.join(__dirname, "config/localhost.pem")),
};

app
  .prepare()
  .then(() => {
    // Add to server.ts

    createServer(httpsOptions, (req: IncomingMessage, res: ServerResponse) => {
      const parsedUrl = parse(req.url!, true);
      void handle(req, res, parsedUrl);
    }).listen(port, (err?: any) => {
      if (err) throw err;
      console.log(
        `> Server listening at https://localhost:${port} as ${
          dev ? "development" : process.env.NODE_ENV
        }`
      );
    });
  })
  .catch((ex: any) => {
    console.error(ex.stack);
    process.exit(1);
  });
