const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');

const Schema = mongoose.Schema;

const emailValidator = {
  validator: validator.isEmail,
  message: 'Invalid email format',
};

// Simplified password validator
const passwordValidator = {
  validator: (password) => password.length >= 8,
  message: 'Password must be at least 8 characters long',
};

const userSchema = new Schema(
  {
    userEmail: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      validate: emailValidator,
    },
    userPassword: {
      type: String,
      required: [true, 'Password is required'],
      validate: passwordValidator,
    },
    userProfilePicture: {
      type: String,
    },
  },
  { timestamps: true },
);

userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('userPassword')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.userPassword = await bcrypt.hash(this.userPassword, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.statics.signup = async function (userEmail, userPassword, userProfilePicture) {
  // Check if the email already exists
  const existingUser = await this.findOne({ userEmail: userEmail.toLowerCase() });
  if (existingUser) {
    throw new Error('Email already exists. Please try another one.');
  }

  const user = new this({ userEmail, userPassword, userProfilePicture });

  try {
    await user.save();
    return user;
  } catch (error) {
    let errorMessage = 'Signup failed due to an unexpected error.';
    if (error.errors) {
      errorMessage = Object.values(error.errors)
        .map((val) => val.message)
        .join(', ');
    }
    throw new Error(errorMessage);
  }
};

userSchema.statics.login = async function (userEmail, userPassword) {
  const user = await this.findOne({ userEmail });

  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isPasswordCorrect = await bcrypt.compare(userPassword, user.userPassword);
  if (!isPasswordCorrect) {
    throw new Error('Invalid email or password');
  }

  return user;
};

module.exports = mongoose.model('User', userSchema);
