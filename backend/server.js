require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const transactionRoutes = require('./routes/transaction');
const userRoutes = require('./routes/user');
const accountRoutes = require('./routes/account');

const app = express();

// Global CORS Configuration
const allowedOrigins = ['https://spenny.reeflink.org', 'https://getspenny.com', 'http://localhost:4000'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // Allow requests with no origin (like mobile apps or curl requests)

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      const message = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(message), false);
    }
  }
}));

// Middleware
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/transaction', transactionRoutes);
app.use('/user', userRoutes);
app.use('/account', accountRoutes);

// Connect to MongoDB & listen for requests
async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    app.listen(process.env.PORT, () => {
      console.log(`Listening on Port ${process.env.PORT}`);
    });
  } catch (err) {
    console.error(err);
  }
}

startServer();
