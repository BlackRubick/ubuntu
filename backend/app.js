require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { sequelize } = require('./models');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();


app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Servir archivos de resultados
const path = require('path');
app.use('/uploads/results', express.static(path.join(__dirname, 'uploads/results')));

// API routes
app.use('/api', routes);

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
