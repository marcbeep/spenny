const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  balance: {
    type: Number,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Account', accountSchema);
