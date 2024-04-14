require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('./jobs/goalEvaluation');

const accountRoutes = require('./routes/account');
const budgetRoutes = require('./routes/budget');
const categoryRoutes = require('./routes/category');
const transactionRoutes = require('./routes/transaction');
const userRoutes = require('./routes/user');
const goalRoutes = require('./routes/goal');
const analyticsRoutes = require('./routes/analytics');

const app = express();

// const allowedOrigins = [
//   'https://spenny.reeflink.org',
//   'https://getspenny.com',
//   'https://www.getspenny.com',
//   'http://localhost:4000',
// ];

// app.use(cors({
//   origin: (origin, callback) => {
//       if (!origin) return callback(null, true);
//       if (allowedOrigins.includes(origin)) {
//           return callback(null, true);
//       } else {
//           const message = 'The CORS policy for this site does not allow access from the specified Origin.';
//           return callback(new Error(message), false);
//       }
//   },
//   credentials: true,
//   allowedHeaders: 'Content-Type,Authorization',
//   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE'
// }));

app.use(
  cors({
    origin: '*', // Allow all origins
    credentials: true,
    allowedHeaders: 'Content-Type,Authorization',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  }),
);

app.use(express.json());

app.use((req, res, next) => {
  next();
});

app.use('/accounts', accountRoutes);
app.use('/budget', budgetRoutes);
app.use('/categories', categoryRoutes);
app.use('/transactions', transactionRoutes);
app.use('/users', userRoutes);
app.use('/goals', goalRoutes);
app.use('/analytics', analyticsRoutes);

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    app.listen(process.env.PORT, () => {
      console.log(`Listening on Port ${process.env.PORT}`);
    });
  } catch (err) {
    console.error(err);
    process.exit(1); // Exit with error code
  }
}

startServer();
