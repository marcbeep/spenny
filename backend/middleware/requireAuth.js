// middleware/requireAuth.js
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const requireAuth = async (req, res, next) => {
  // Check for token in authorization header
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization token required' });
  }

  // Extract the token
  const token = authorization.split(' ')[1];

  try {
    // Verify the token
    const { _id } = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user by ID
    const user = await User.findById(_id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Attach the user to the request object
    req.user = user;

    // Proceed to the next middleware/function
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ error: 'Request is not authorized' });
  }
};

module.exports = requireAuth;
