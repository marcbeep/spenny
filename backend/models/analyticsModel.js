const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Helper function for formatting numbers to two decimal places
function formatNumber(value) {
  return parseFloat(parseFloat(value).toFixed(2));
}

// Adjusted to support a mixed type for various analytics data structures
const analyticsDataSchema = {
  type: Schema.Types.Mixed,
  required: true,
  // For numerical data, apply the formatNumber setter
  set: function (data) {
    if (typeof data === 'number') {
      return formatNumber(data);
    }
    return data;
  },
};

const analyticsSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    analyticsType: {
      type: String,
      required: true,
      lowercase: false,
      enum: ['totalSpend', 'spendingByCategory', 'netWorth', 'incomeVsExpenses', 'savingsRate'], // Expanded to include all analytics types
    },
    period: {
      type: String,
      required: true,
      lowercase: true,
      enum: ['weekly', 'monthly'],
    },
    periodStart: {
      type: Date,
      required: true,
    },
    periodEnd: {
      type: Date,
      required: true,
    },
    analyticsData: analyticsDataSchema, // Adjusted for flexible data structure
    analyticsLastCalculated: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Analytics', analyticsSchema);
