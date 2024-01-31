const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');

const EMAIL_ALREADY_EXISTS = 'Email already exists';
const INVALID_EMAIL = 'Invalid email';
const INVALID_PASSWORD = 'Password must be at least 8 characters long and contain at least 1 lowercase, 1 uppercase, 1 number, and 1 symbol';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: validator.isEmail,
        message: INVALID_EMAIL,
      },
    },
    password: {
      type: String,
      required: true,
      validate: {
        validator: (password) => validator.isStrongPassword(password, { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 }),
        message: INVALID_PASSWORD,
      },
    },
  },
  { timestamps: true }
);

// static signup method
userSchema.statics.signup = async function (email, password) {
  const existingUser = await this.findOne({ email });

  if (existingUser) {
    throw new Error(EMAIL_ALREADY_EXISTS);
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const user = await this.create({ email, password: hashedPassword });
  return user;
};

module.exports = mongoose.model('User', userSchema);

// static login method
userSchema.statics.login = async function (email, password) {
  const user = await this.findOne({ email });

  if (!user) {
    throw new Error(INVALID_EMAIL);
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    throw new Error(INVALID_PASSWORD);
  }

  return user;
};