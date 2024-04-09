const mongoose = require('mongoose');

const Schema = mongoose.Schema;

function formatNumber(value) {
  return parseFloat(parseFloat(value).toFixed(2));
}

const analyticsDataSchema = {
  type: Schema.Types.Mixed,
  required: true,
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
      enum: ['totalSpend', 'spendingByCategory', 'netWorth', 'incomeVsExpenses', 'savingsRate'],
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
    analyticsData: analyticsDataSchema,
    analyticsLastCalculated: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Analytics', analyticsSchema);
