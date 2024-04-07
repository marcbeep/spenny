const User = require('../models/userModel');
const Category = require('../models/categoryModel');
const Budget = require('../models/budgetModel');
const jwt = require('jsonwebtoken');

// Utility to create JWT token
const createToken = _id => jwt.sign({ _id }, process.env.JWT_SECRET, { expiresIn: '3d' });

// Utility to initialize essential user data
const initializeUserData = async userId => {
  const genericCategories = ['Groceries', 'Rent', 'Eating Out', 'Fun Money', 'Savings'];
  const categories = genericCategories.map(title => ({ title, user: userId }));
  
  try {
    await Category.create(categories);
    await Budget.create({ user: userId, totalAvailable: 0, totalAssigned: 0, readyToAssign: 0 });
    // TODO: create a generic spending account or other initial setups here
  } catch (err) {
    console.error('Error initializing data for user:', err);
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
  // Generate profile picture URL for the user
  const profilePictureUrl = `https://api.randomuser.me/portraits/lego/${Math.floor(Math.random() * 10) + 1}.jpg`;

  try {
    const user = await User.signup(email, password, profilePictureUrl);
    const token = createToken(user._id);

    await initializeUserData(user._id); // Generic categories and initial budget setup

    res.status(201).json({ email: user.userEmail, token, profilePicture: user.userProfilePicture });
  } catch (err) {
    const errorMessage = err.code === 11000 ? 'Email already exists. Please try another one.' : err.message || 'Signup failed due to an unexpected error.';
    res.status(400).json({ error: errorMessage });
  }
};

