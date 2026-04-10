const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const discussionRoutes = require('./routes/discussion');
const strategyRoutes = require('./routes/strategy');
const marketRoutes = require('./routes/market');
const { errorHandler } = require('./middleware/errorHandler');
const logger = require('./middleware/logger');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(logger.logRequest);

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/discussions', discussionRoutes);
app.use('/api/strategies', strategyRoutes);
app.use('/api/market', marketRoutes);

// Error handling
app.use(errorHandler);

 module.exports = app;