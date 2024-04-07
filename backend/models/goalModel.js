const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Helper function for formatting numbers to two decimal places
function formatNumber(value) {
  return parseFloat(parseFloat(value).toFixed(2));
}

const goalSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  goalCategory: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  goalType: {
    type: String,
    required: true,
    lowercase: true, 
    enum: ['saving', 'spending'], // Restricts the value to 'saving' or 'spending'
  },
  goalTarget: {
    type: Number,
    required: true,
    set: formatNumber, 
  },
  goalCurrent: {
    type: Number,
    required: true,
    set: formatNumber, 
  },
  goalDeadline: {
    type: Date,
    required: true,
  },
  goalStatus: {
    type: String,
    required: true,
    lowercase: true, 
    enum: ['underfunded', 'funded'], // Restricts the value to 'underfunded' or 'funded'
  },
}, { timestamps: true });

module.exports = mongoose.model('Goal', goalSchema);
