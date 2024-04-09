require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('./jobs/goalEvaluation'); // Initialize the scheduled task

// Routes
const accountRoutes = require('./routes/account');
const budgetRoutes = require('./routes/budget');
const categoryRoutes = require('./routes/category');
const transactionRoutes = require('./routes/transaction');
const userRoutes = require('./routes/user');
const goalRoutes = require('./routes/goal');
const analyticsRoutes = require('./routes/analytics');

const app = express();

// Global CORS Configuration
const allowedOrigins = [
  'https://spenny.reeflink.org',
  'https://getspenny.com',
  'https://www.getspenny.com',
  'http://localhost:4000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // Allow requests with no origin (like mobile apps or curl requests)

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        const message =
          'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(message), false);
      }
    },
  }),
);

// Middleware
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/account', accountRoutes);
app.use('/budget', budgetRoutes);
app.use('/category', categoryRoutes);
app.use('/transaction', transactionRoutes);
app.use('/user', userRoutes);
app.use('/goal', goalRoutes);
app.use('/analytics', analyticsRoutes);

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
