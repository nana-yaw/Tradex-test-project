const http = require('http');
const { WebSocket } = require('ws');
const { createWebSocketServer } = require('../src/services/websocket');

jest.mock('../src/services/marketService', () => ({
  getPrices: jest.fn(),
}));

const { getPrices } = require('../src/services/marketService');

const mockPrices = [
  { symbol: 'BTC', name: 'Bitcoin', price: 67000, change24h: 2.1 },
  { symbol: 'ETH', name: 'Ethereum', price: 3500, change24h: -1.3 },
];

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer();
    const wss = createWebSocketServer(server);
    server.listen(0, () => {
      const port = server.address().port;
      resolve({ server, wss, port });
    });
  });
}

function connectClient(port) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://localhost:${port}`);
    const messages = [];
    let messageResolve = null;

    ws.on('message', (data) => {
      const parsed = JSON.parse(data);
      if (messageResolve) {
        messageResolve(parsed);
        messageResolve = null;
      } else {
        messages.push(parsed);
      }
    });

    ws.nextMessage = () => {
      if (messages.length > 0) return Promise.resolve(messages.shift());
      return new Promise((r) => { messageResolve = r; });
    };

    ws.on('open', () => resolve(ws));
    ws.on('error', reject);
  });
}

describe('WebSocket server', () => {
  let server, wss, port;
  const clients = [];

  beforeEach(async () => {
    getPrices.mockResolvedValue(mockPrices);
    ({ server, wss, port } = await startServer());
  });

  afterEach(async () => {
    for (const c of clients) c.close();
    clients.length = 0;

    await new Promise((resolve) => {
      wss.close(() => server.close(resolve));
    });
  });

  it('sends prices on connection', async () => {
    const client = await connectClient(port);
    clients.push(client);
    const msg = await client.nextMessage();

    expect(msg).toEqual({ type: 'prices', data: mockPrices });
  });

  it('does not crash when getPrices fails on connection', async () => {
    getPrices.mockRejectedValueOnce(new Error('provider down'));

    const client = await connectClient(port);
    clients.push(client);

    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(client.readyState).toBe(WebSocket.OPEN);
  });
});
