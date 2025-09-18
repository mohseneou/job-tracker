const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const morganMiddleware = require('./middlewares/morgan');

// Create an express app
const app = express();

// Configure express app
app.use(express.json());
app.use(cookieParser());
app.use(cors());

app.use(morganMiddleware);

module.exports = app;