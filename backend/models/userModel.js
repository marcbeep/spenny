const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    }
  },
  { timestamps: true }
);

// static signup method
userSchema.statics.signup = async function (email, password) {
  
  const exists = await this.findOne({ email });
  
  if(exists) {
    throw new Error('Email already exists');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const user = await this.create({ email, password: hashedPassword });
  return user;
};

module.exports = mongoose.model('User', userSchema);
