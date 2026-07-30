import http from 'http';
import { PORT } from '../config/env.js';

let botClient = null;
const startTime = new Date();

/**
 * Initializes and starts the HTTP status server.
 *
 * @param {import('discord.js').Client} client - The Discord client instance.
 */
export function startWebServer(client) {
  botClient = client;

  const server = http.createServer((req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    if (req.url === '/health' || req.url === '/api/status') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'online',
        bot: botClient?.user?.tag || 'Tulalit Bot',
        uptimeSeconds: Math.floor((Date.now() - startTime.getTime()) / 1000),
        timestamp: new Date().toISOString(),
        domain: 'tulalit.farrasazhary.my.id'
      }));
      return;
    }

    // Default HTML Landing Page for tulalit.farrasazhary.my.id
    const htmlResponse = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tulalit Bot Status</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: #0f172a;
      color: #f8fafc;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }
    .card {
      background: rgba(30, 41, 59, 0.7);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 1.5rem;
      padding: 2.5rem;
      max-width: 480px;
      width: 100%;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      text-align: center;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(34, 197, 94, 0.15);
      color: #4ade80;
      border: 1px solid rgba(34, 197, 94, 0.3);
      padding: 0.4rem 1rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
    }
    .status-dot {
      width: 8px;
      height: 8px;
      background-color: #22c55e;
      border-radius: 50%;
      box-shadow: 0 0 10px #22c55e;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(1.2); }
      100% { opacity: 1; transform: scale(1); }
    }
    h1 {
      font-size: 1.875rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      background: linear-gradient(135deg, #ff9f43 0%, #ff5252 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    p {
      color: #94a3b8;
      font-size: 0.975rem;
      line-height: 1.6;
      margin-bottom: 2rem;
    }
    .info-grid {
      background: #1e293b;
      border-radius: 1rem;
      padding: 1rem;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      text-align: left;
    }
    .info-item {
      font-size: 0.825rem;
    }
    .info-label {
      color: #64748b;
      margin-bottom: 0.25rem;
    }
    .info-val {
      color: #f1f5f9;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">
      <span class="status-dot"></span> System Operational
    </div>
    <h1>Tulalit Discord Bot</h1>
    <p>Bot motivasi, curhat privat, & confession anonim untuk komunitas Discord.</p>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Domain</div>
        <div class="info-val">tulalit.farrasazhary.my.id</div>
      </div>
      <div class="info-item">
        <div class="info-label">Port Active</div>
        <div class="info-val">${PORT}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Bot Tag</div>
        <div class="info-val">${botClient?.user?.tag || 'Online'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Uptime</div>
        <div class="info-val">${Math.floor((Date.now() - startTime.getTime()) / 1000)}s</div>
      </div>
    </div>
  </div>
</body>
</html>`;

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(htmlResponse);
  });

  server.listen(PORT, () => {
    console.log(`[Web Server] Status HTTP server running at http://localhost:${PORT} (Domain: tulalit.farrasazhary.my.id)`);
  });

  return server;
}
