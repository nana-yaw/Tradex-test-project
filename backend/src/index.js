require('dotenv').config();
const app = require('./app');
const { createWebSocketServer } = require('./services/websocket');

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

createWebSocketServer(server);
console.log(`WebSocket server attached on ws://localhost:${PORT}`);
