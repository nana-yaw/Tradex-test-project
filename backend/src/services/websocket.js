const { WebSocketServer } = require('ws');
const { getPrices } = require('./marketService');

const BROADCAST_INTERVAL = 30000;

function createWebSocketServer(httpServer) {
  const wss = new WebSocketServer({ server: httpServer });

  wss.on('connection', async (ws) => {
    try {
      const prices = await getPrices();
      if (prices.length > 0) {
        ws.send(JSON.stringify({ type: 'prices', data: prices }));
      }
    } catch (err) {
      console.error('WS: failed to send initial prices', err.message);
    }
  });

  const interval = setInterval(async () => {
    if (wss.clients.size === 0) return;

    try {
      const prices = await getPrices();
      if (prices.length === 0) return;

      const message = JSON.stringify({ type: 'prices', data: prices });
      for (const client of wss.clients) {
        if (client.readyState === client.OPEN) {
          client.send(message);
        }
      }
    } catch (err) {
      console.error('WS: broadcast failed', err.message);
    }
  }, BROADCAST_INTERVAL).unref();

  wss.on('close', () => clearInterval(interval));

  return wss;
}

module.exports = { createWebSocketServer };
