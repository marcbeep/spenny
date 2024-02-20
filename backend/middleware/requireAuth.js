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
  console.log('Auth Header:', authorization); // Log the full authorization header

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded JWT:', decoded); // Log the decoded JWT payload

    // Find the user by ID from the decoded token
    const user = await User.findById(decoded._id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('User making request:', user); // Log user details

    // Attach the user to the request object
    req.user = user;

    // Proceed to the next middleware/function
    next();
  } catch (error) {
    console.error('Error in requireAuth middleware:', error);
    res.status(401).json({ error: 'Request is not authorized' });
  }
};

module.exports = requireAuth;
