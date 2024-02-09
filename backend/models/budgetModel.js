const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  totalAvailable: {
    type: Number,
    required: true,
  },
  totalAssigned: {
    type: Number,
    required: true,
  },
  readyToAssign: {
    type: Number,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Budget', budgetSchema);
