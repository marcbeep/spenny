const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Helper function for formatting numbers to two decimal places
function formatNumber(value) {
  return parseFloat(parseFloat(value).toFixed(2));
}

// Subdocument schema for analytics data entries
const analyticsEntrySchema = new Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    value: {
      type: Number,
      required: true,
      set: formatNumber,
    },
  },
  { _id: false },
); // Disable _id for subdocument

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
      lowercase: true,
      enum: ['networth', 'spending'], // Restricts the value to 'networth' or 'spending'
    },
    analyticsData: [analyticsEntrySchema], // Use the subdocument schema for entries
    analyticsLastCalculated: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Analytics', analyticsSchema);
