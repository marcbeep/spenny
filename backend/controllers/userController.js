const User = require('../models/userModel');
const Account = require('../models/accountModel');
const Category = require('../models/categoryModel');
const Budget = require('../models/budgetModel');
const Analytics = require('../models/analyticsModel'); 
const jwt = require('jsonwebtoken');

// Utility to create JWT token
const createToken = (_id) => jwt.sign({ _id }, process.env.JWT_SECRET, { expiresIn: '3d' });

const initializeAnalyticsData = async (userId) => {
  const analyticsTypes = [
    'totalSpend',
    'spendingByCategory',
    'netWorth',
    'incomeVsExpenses',
    'savingsRate',
  ];

  // For simplicity, we're not setting initial data for these analytics
  // since they depend on user transactions and account balances.
  // They will be calculated as the user starts using the app.
  const promises = analyticsTypes.map((type) =>
    Analytics.create({
      user: userId,
      analyticsType: type,
      period: 'weekly', // Assuming all are set to 'weekly' initially
      // For other fields like periodStart, periodEnd, and analyticsData,
      // set defaults or leave them to be populated based on actual data.
    }),
  );

  await Promise.all(promises);
};

// Utility to initialize essential user data
const initializeUserData = async (userId) => {
  try {
    // Define some generic categories for a new user
    const genericCategories = ['groceries', 'rent', 'eating out', 'fun money', 'savings'];

    // Create a generic spending account for the new user
    const genericAccountTitle = 'example spending account';
    const genericAccount = await Account.create({
      user: userId,
      accountTitle: genericAccountTitle,
      accountType: 'spending',
      accountBalance: 0.0,
    });

    // Create the categories for the new user
    await Promise.all(
      genericCategories.map((categoryTitle) =>
        Category.create({
          user: userId,
          categoryTitle,
          categoryAssigned: 0.0,
          categoryAvailable: 0.0,
          categoryActivity: 0.0,
        }),
      ),
    );

    // Initialize the budget for the new user
    await Budget.create({
      user: userId,
      budgetTotalAvailable: 0.0,
      budgetTotalAssigned: 0.0,
      budgetReadyToAssign: 0.0,
    });

    // Initialize analytics data for the new user
    await initializeAnalyticsData(userId);
    
    return { success: true };
  } catch (err) {
    console.error('Error initializing data for user:', err);
    return { error: err.message || 'Failed to initialize user data' };
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.login(email, password);
    const token = createToken(user._id);
    res.status(200).json({ email: user.userEmail, token });
  } catch (err) {
    res.status(401).json({ error: err.message || 'Authentication failed' });
  }
};

exports.signupUser = async (req, res) => {
  const { email, password } = req.body;
  const profilePictureUrl = `https://api.randomuser.me/portraits/lego/${
    Math.floor(Math.random() * 10) + 1
  }.jpg`;

  try {
    const user = await User.signup(email, password, profilePictureUrl);
    const token = createToken(user._id);

    // Attempt to initialize user data
    const initDataResult = await initializeUserData(user._id);
    if (initDataResult.error) {
      throw new Error(initDataResult.error); // Propagate initialization error if exists
    }

    res.status(201).json({ email: user.userEmail, token, profilePicture: user.userProfilePicture });
  } catch (err) {
    let errorMessage = 'Signup failed due to an unexpected error.';
    if (err.code === 11000) {
      errorMessage = 'Email already exists. Please try another one.';
    } else if (err.message) {
      errorMessage = err.message; // Use the specific error message if available
    }
    res.status(400).json({ error: errorMessage });
  }
};
