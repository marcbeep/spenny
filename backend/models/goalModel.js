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
    enum: ['spending', 'saving', 'minimumbalance'], // Define allowed goal types
  },
  goalTarget: {
    type: Number,
    required: function() {
      // Required only for 'spending' and 'saving' goal types
      return this.goalType === 'spending' || this.goalType === 'saving';
    },
    set: formatNumber,
  },
  // Removed goalDeadline as it's not used in the new specs
  goalStatus: {
    type: String,
    required: true,
    lowercase: true,
    enum: ['underfunded', 'funded'], // Status of the goal
  },
  goalResetDay: {
    type: String,
    enum: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
    required: function() {
      // Required only for 'spending' goal type
      return this.goalType === 'spending';
    },
    default: null, // Specifies the day the 'spending' goal resets
  },
}, { timestamps: true });

module.exports = mongoose.model('Goal', goalSchema);
