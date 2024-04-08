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
    enum: ['spending', 'saving'], 
  },
  goalTarget: {
    type: Number,
    required: true, 
    set: formatNumber,
  },
  goalStatus: {
    type: String,
    required: true,
    lowercase: true,
    enum: ['underfunded', 'funded'], 
  },
  goalResetDay: {
    type: String,
    enum: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
    required: function() {
      // Required only for 'spending' goal type
      return this.goalType === 'spending';
    },
    default: null, // Specifies the day the 'spending' goal resets. This stays unchanged.
  },
}, { timestamps: true });

module.exports = mongoose.model('Goal', goalSchema);
