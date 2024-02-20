const jwt = require('jsonwebtoken');

/**
 * Creates a JWT token for a user.
 * @param {string} _id - The user's database ID.
 * @returns {string} A JWT token.
 */
const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.JWT_SECRET, { expiresIn: '3d' });
};

/**
 * Handles user login requests.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.login(email, password);
    const token = createToken(user._id);
    res.status(200).json({ email: user.email, token });
  } catch (err) {
    // Use the model's error message
    res.status(401).json({ error: err.message || 'Authentication failed' });
  }
};

/**
 * Handles user signup requests.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
exports.signupUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.signup(email, password);
    const token = createToken(user._id);

    // Create generic categories and initial budget for the new user
    await createGenericCategoriesForUser(user._id);
    await createInitialBudgetForUser(user._id);

    res.status(201).json({ email: user.email, token });
  } catch (err) {
    const errorMessage = err.message || 'Signup failed due to an unexpected error.';

    if (err.code === 11000) {
      res.status(400).json({ error: 'Email already exists. Please try another one.' });
    } else {
      res.status(400).json({ error: errorMessage });
    }
  }
};

