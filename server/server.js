const { createServer } = require('http');
const { parse } = require('url');
const path = require('path');
const next = require('next/dist/server/next');
const httpProxy = require('http-proxy');
const send = require('send');
const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const frontendPort = 8000;
const port = 3000;

send.mime.define({
  'image/avif': ['avif'],
});

function startServer(opts) {
  let requestHandler;
  const proxy = new httpProxy.createProxyServer({
    target: {
      host: 'localhost',
      port: frontendPort,
    },
  });
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    const { pathname, query } = parsedUrl;
    if (pathname === '/api' || pathname.startsWith('/api/')) {
      return requestHandler(req, res);
    } else if (dev) {
      return proxy.web(req, res);
    } else {
      return send(req, pathname, {
        root: path.resolve(__dirname, '../frontend/dist'),
      })
        .on('directory', () => {
          // We don't allow directories to be read.
          const err = new Error('No directory access');
          err.code = 'ENOENT';
          res.statusCode = err.status || 500;
          res.end(err.message);
        })
        .on('error', function (err) {
          res.statusCode = err.status || 500;
          res.end(err.message);
        })
        .pipe(res);
    }
  });

  if (opts.keepAliveTimeout) {
    server.keepAliveTimeout = opts.keepAliveTimeout;
  }

  return new Promise((resolve, reject) => {
    let port = opts.port;
    let retryCount = 0;

    server.on('error', (err) => {
      if (
        port &&
        opts.allowRetry &&
        err.code === 'EADDRINUSE' &&
        retryCount < 10
      ) {
        console.warn(`Port ${port} is in use, trying ${port + 1} instead.`);
        port += 1;
        retryCount += 1;
        server.listen(port, opts.hostname);
      } else {
        reject(err);
      }
    });

    server.on('upgrade', function (req, socket, head) {
      proxy.ws(req, socket, head);
    });

    server.on('listening', () => {
      const addr = server.address();
      const hostname =
        !opts.hostname || opts.hostname === '0.0.0.0'
          ? 'localhost'
          : opts.hostname;

      const app = next({
        ...opts,
        // dev: true,
        hostname,
        customServer: false,
        httpServer: server,
        port: addr && typeof addr === 'object' ? addr.port : port,
      });

      requestHandler = app.getRequestHandler();
      resolve(app);
    });

    server.listen(port, opts.hostname);
  });
}

startServer({
  port,
  hostname,
  dev,
})
  .then(async (app) => {
    const appUrl = `http://${app.hostname}:${app.port}`;
    console.log(
      `started server on ${app.hostname}:${app.port}, url: ${appUrl}`,
    );
    await app.prepare();
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
