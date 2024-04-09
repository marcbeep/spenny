const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');

const Schema = mongoose.Schema;

const emailValidator = [validator.isEmail, 'Invalid email'];
const passwordValidator = {
  validator: (password) =>
    validator.isStrongPassword(password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    }),
  message:
    'Password must be at least 8 characters long and contain at least 1 lowercase, 1 uppercase, 1 number, and 1 symbol',
};

const userSchema = new Schema(
  {
    userEmail: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      validate: emailValidator,
    },
    userPassword: {
      type: String,
      required: true,
      validate: passwordValidator,
    },
    userProfilePicture: {
      type: String,
      required: false,
    },
  },
  { timestamps: true },
);

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

userSchema.statics.signup = async function (userEmail, userPassword, userProfilePicture) {
  if (await this.findOne({ userEmail })) {
    throw new Error('Email already exists');
  }

  const hashedPassword = await hashPassword(userPassword);
  const user = new this({ userEmail, userPassword: hashedPassword, userProfilePicture });
  await user.save();
  return user;
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
