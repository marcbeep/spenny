const User = require('../models/userModel');
const Category = require('../models/categoryModel');
const jwt = require('jsonwebtoken');

// Helper function to create JWT tokens
const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.JWT_SECRET, { expiresIn: '3d' });
};

// Function to create generic categories for a new user
const createGenericCategoriesForUser = async (userId) => {
    const genericCategories = [
      { name: 'Groceries', user: userId },
      { name: 'Rent', user: userId },
      { name: 'Eating Out', user: userId },
      { name: 'Fun Money', user: userId },
      { name: 'Savings', user: userId },
    ];
  
    try {
      // Use Promise.all to create all categories in parallel
      await Promise.all(genericCategories.map(category => Category.create(category)));
    } catch (err) {
      console.error("Error creating generic categories for user:", err);
    }
  };

// Login user
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.login(email, password);
    const token = createToken(user._id);
    res.status(200).json({ email: user.email, token }); // Ensure to return the email from the user object for security
  } catch (err) {
    res.status(401).json({ error: 'Authentication failed' }); // Use more generic error messages for authentication failures
  }
};

// Signup user
exports.signupUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.signup(email, password);
    const token = createToken(user._id);

    // After successfully signing up the user, create generic categories for them
    await createGenericCategoriesForUser(user._id);

    res.status(201).json({ email: user.email, token }); // Return 201 for successful creation, ensure to return the email from the user object
  } catch (err) {
    res.status(400).json({ error: 'Signup failed' }); // Provide a generic error message to avoid giving details that could be used for malicious purposes
  }
};
