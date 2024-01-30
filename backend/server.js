require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const transactionRoutes = require('./routes/transaction');

const app = express();

// Middleware
app.use(express.json());

app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

// Routes
app.use('/transaction', transactionRoutes);

// Connect to MongoDB & listen for requests
async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    app.listen(process.env.PORT, () => {
      console.log('Listening on Port ' + process.env.PORT);
    });
  } catch (err) {
    console.error(err);
  }
}

startServer();

