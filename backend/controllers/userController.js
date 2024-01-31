const User = require('../models/userModel');

// login user
const loginUser = async (req, res) => {
    res.json({ message: 'Login route' });
}

// signup user
const signupUser = async (req, res) => {
    res.json({ message: 'Signup route' });
}

module.exports = {  loginUser, signupUser };