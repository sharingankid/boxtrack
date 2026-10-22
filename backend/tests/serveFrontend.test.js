const fs = require('fs');
const os = require('os');
const path = require('path');
const express = require('express');
const request = require('supertest');
const serveFrontend = require('../src/middleware/serveFrontend');

describe('serveFrontend', () => {
  let distDir;
  let app;

  beforeAll(() => {
    distDir = fs.mkdtempSync(path.join(os.tmpdir(), 'boxtrack-dist-'));
    fs.writeFileSync(path.join(distDir, 'index.html'), '<!doctype html><div id="root"></div>');
    fs.mkdirSync(path.join(distDir, 'assets'));
    fs.writeFileSync(path.join(distDir, 'assets', 'index-abc123.js'), 'console.log(1)');

    app = express();
    app.use(serveFrontend(distDir));
    app.use((req, res) => res.status(404).json({ error: { code: 'NOT_FOUND' } }));
  });

  afterAll(() => {
    fs.rmSync(distDir, { recursive: true, force: true });
  });

  it('serves the SPA shell on client-side routes, never cached', async () => {
    for (const route of ['/', '/screen', '/coach/sessions/12/edit']) {
      const res = await request(app).get(route);
      expect(res.status).toBe(200);
      expect(res.text).toContain('<div id="root">');
      expect(res.headers['cache-control']).toBe('no-cache');
    }
  });

  it('caches fingerprinted assets for good', async () => {
    const res = await request(app).get('/assets/index-abc123.js');
    expect(res.status).toBe(200);
    expect(res.headers['cache-control']).toBe('public, max-age=31536000, immutable');
  });

  it('leaves /api and /health to the JSON 404', async () => {
    for (const route of ['/api', '/api/unknown', '/health']) {
      const res = await request(app).get(route);
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    }
  });

  it('refuses to start without a build', () => {
    expect(() => serveFrontend(path.join(distDir, 'missing'))).toThrow(/build the frontend first/);
  });
});
