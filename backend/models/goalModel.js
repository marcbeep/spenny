const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Helper function for formatting numbers to two decimal places
function formatNumber(value) {
  return parseFloat(parseFloat(value).toFixed(2));
}

const goalSchema = new Schema(
  {
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
      enum: ['spending', 'saving', 'minimum'], // Updated to include all three goal types
    },
    goalTarget: {
      type: Number,
      required: false, // Not required for 'minimum' goal type
      set: formatNumber,
    },
    goalDeadline: {
      type: Date,
      required: false, // Only required for 'spending' goal type
    },
    goalStatus: {
      type: String,
      required: true,
      lowercase: true,
      enum: ['underfunded', 'funded'],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Goal', goalSchema);
