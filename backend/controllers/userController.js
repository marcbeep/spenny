const User = require('../models/userModel');
const Account = require('../models/accountModel');
const Category = require('../models/categoryModel');
const Budget = require('../models/budgetModel');
const Analytics = require('../models/analyticsModel');
const jwt = require('jsonwebtoken');
const moment = require('moment');

const createToken = (_id) => jwt.sign({ _id }, process.env.JWT_SECRET, { expiresIn: '3d' });

const initializeAnalyticsData = async (userId) => {
  const weekStart = moment().startOf('isoWeek').toDate();
  const weekEnd = moment().endOf('isoWeek').toDate();

  const analyticsTypes = [
    'totalSpend',
    'spendingByCategory',
    'netWorth',
    'incomeVsExpenses',
    'savingsRate',
  ];

  const promises = analyticsTypes.map((type) =>
    Analytics.create({
      user: userId,
      analyticsType: type,
      period: 'weekly',
      periodStart: weekStart,
      periodEnd: weekEnd,
      analyticsData: 0,
      analyticsLastCalculated: new Date(),
    }),
  );

  await Promise.all(promises);
};

const initializeUserData = async (userId) => {
  try {
    const genericCategories = ['groceries', 'rent', 'eating out', 'fun money', 'savings'];

    const genericAccountTitle = 'example spending account';
    const genericAccount = await Account.create({
      user: userId,
      accountTitle: genericAccountTitle,
      accountType: 'spending',
      accountBalance: 0.0,
    });

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

    await Budget.create({
      user: userId,
      budgetTotalAvailable: 0.0,
      budgetTotalAssigned: 0.0,
      budgetReadyToAssign: 0.0,
    });

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
    res.status(200).json({ email: user.userEmail, token, profilePicture: user.userProfilePicture });
  } catch (err) {
    res.status(401).json({ error: err.message || 'Authentication failed' });
  }
};

exports.signupUser = async (req, res) => {
  const { email, password } = req.body;
  const profilePictureUrl = `https://api.dicebear.com/8.x/notionists-neutral/svg?seed=${email}`;

  try {
    // Use the signup static method defined on the User model
    const user = await User.signup(email, password, profilePictureUrl);
    const token = createToken(user._id);

    const initDataResult = await initializeUserData(user._id);
    if (initDataResult.error) {
      throw new Error(initDataResult.error);
    }

    res.status(201).json({ email: user.userEmail, token, profilePicture: user.userProfilePicture });
  } catch (err) {
    let errorMessage = 'Signup failed due to an unexpected error.';
    if (err.code === 11000) {
      errorMessage = 'Email already exists. Please try another one.';
    } else if (err.message) {
      errorMessage = err.message;
    }
    res.status(400).json({ error: errorMessage });
  }
};
