import type { Request, Response } from 'express';

import fs from 'node:fs';
import path from 'node:path';
import 'reflect-metadata';
import { InversifyExpressServer } from 'inversify-express-utils';
import cookieParser from 'cookie-parser';
import serveFavicon from 'serve-favicon';
import serveStatic from 'serve-static';
import bodyParser from 'body-parser';
import express from 'express';
import { container } from './inversify-container';

/**
 * Normalize the assets to ensure they are returned as an array.
 * @param assets - The assets object or array.
 * @returns An array of assets.
 */
function normalizeAssets(assets: unknown) {
  if (typeof assets === 'object') {
    return Object.values(assets as Object);
  }
  return Array.isArray(assets) ? assets : [assets];
}

let indexHtml: string | null = null;

/**
 * Main function to create and configure the Express server.
 */
async function createServer() {
  let app = express();

  new InversifyExpressServer(container, null, { rootPath: '/api/v1' }, app)
    .setConfig(app => {
      // Middleware to parse incoming request bodies
      app.use(bodyParser.urlencoded({ extended: true }));
      app.use(bodyParser.json());
      app.use(cookieParser());
    })
    .build();

  // Setup for development environment
  if (process.env.MODE === 'development') {
    const [
      { default: webpack },
      { default: devMiddleware },
      { default: hotMiddleware },
      { config },
    ] = await Promise.all([
      import('webpack'),
      import('webpack-dev-middleware'),
      import('webpack-hot-middleware'),
      import('./webpack.config'),
    ]);

    // Create a webpack compiler instance
    const compiler = webpack(config);

    // Use webpack dev middleware to serve webpack bundles from memory
    app.use(
      devMiddleware(compiler, {
        stats: { colors: true }, // Display colored stats in console
        serverSideRender: true, // Enable server-side rendering
      }),
    );

    // Hot Module Replacement (HMR) middleware for real-time updates
    app.use(
      hotMiddleware(compiler, {
        log: console.log,
        path: '/__webpack_hmr', // Path for HMR updates
        heartbeat: 10 * 1000, // Keep-alive heartbeat
      }),
    );

    // Serve favicon
    app.use(serveFavicon(path.join(process.cwd(), 'shinobou.png')));
  } else {
    // Serve static files from the production build directory
    app.use(
      '/assets',
      serveStatic(path.resolve(process.cwd(), 'dist/release/browser')),
    );

    // Use compression for optimizing performance
    const compression = await import('compression');
    app.use(compression.default());
  }

  // Catch-all route to handle SSR and return HTML template
  app.use('*', async (req: Request, res: Response) => {
    let template: string;

    if (process.env.MODE === 'development') {
      // In development, use the in-memory filesystem
      const { devMiddleware } = res.locals.webpack;
      const outputFileSystem = devMiddleware.outputFileSystem;
      const jsonWebpackStats = devMiddleware.stats.toJson();
      const { assetsByChunkName, outputPath } = jsonWebpackStats;

      // Build the HTML template dynamically
      template = `
        <html>
          <head>
            <title>My App</title>
            <style>
            ${normalizeAssets(assetsByChunkName.main)
              .filter(assetPath => assetPath.endsWith('.css'))
              .map(assetPath =>
                outputFileSystem.readFileSync(path.join(outputPath, assetPath)),
              )
              .join('\n')}
            </style>
          </head>
          <body>
            <div id="root"></div>
            ${normalizeAssets(assetsByChunkName.main)
              .filter(assetPath => assetPath.endsWith('.js'))
              .map(assetPath => `<script src="${assetPath}"></script>`)
              .join('\n')}
          </body>
        </html>
      `;
    } else {
      // In production, read from the pre-compiled index.html
      if (!indexHtml) {
        indexHtml = fs.readFileSync(
          './dist/release/browser/index.html',
          'utf-8',
        );
      }
      template = indexHtml;
    }

    // Render the final HTML with SSR
    const { render } = await import('./entry-server');
    render({ req, res, template });
  });

  // Start the server on the specified port
  const port = parseInt(process.env.PORT || '8080');
  return app.listen(port, () =>
    console.log(`Server is listening at http://localhost:${port}`),
  );
}

// Create and start the server
createServer()
  .then(server => server.on('error', console.error))
  .catch(err => console.error(err));
