const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

app.use('/api', routes);

app.use((req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } });
});

app.use(errorHandler);

module.exports = app;
