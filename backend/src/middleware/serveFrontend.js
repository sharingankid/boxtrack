const fs = require('fs');
const path = require('path');
const express = require('express');

const DEFAULT_DIST = path.join(__dirname, '../../../frontend/dist');

// Single-service deployment: the API also serves the built React app, so the
// box gets one HTTPS URL (public view, /coach, /screen and /api together),
// no CORS to configure, and one instance to keep awake. Enabled with
// SERVE_FRONTEND=true after `npm run build` in frontend/ - see render.yaml.
function serveFrontend(distDir = process.env.FRONTEND_DIST || DEFAULT_DIST) {
  const root = path.resolve(distDir);
  const indexFile = path.join(root, 'index.html');
  // Fail at boot, not on the first visitor: a missing build would otherwise
  // only show up as a 404 on the TV in the middle of a class.
  if (!fs.existsSync(indexFile)) {
    throw new Error(`SERVE_FRONTEND is on but ${indexFile} does not exist - build the frontend first`);
  }

  const router = express.Router();

  // Vite fingerprints everything under assets/, so those can be cached for
  // good; index.html must always be revalidated or a redeploy would keep
  // serving the old bundle names to the TV until its cache expired.
  router.use(
    express.static(root, {
      index: false,
      setHeaders(res, filePath) {
        const immutable = filePath.startsWith(path.join(root, 'assets') + path.sep);
        res.setHeader('Cache-Control', immutable ? 'public, max-age=31536000, immutable' : 'no-cache');
      },
    })
  );

  // Client-side routes (/screen, /coach/sessions/12/edit...) all resolve to
  // the SPA shell. /api and /health keep their JSON 404s.
  router.get(/^\/(?!api(\/|$)|health$).*/, (req, res) => {
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(indexFile);
  });

  return router;
}

module.exports = serveFrontend;
