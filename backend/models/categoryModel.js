const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    assignedAmount: {
      type: Number,
      default: 0,
      required: true,
    },
    available: {
      type: Number,
      default: 0,
      required: true,
    },
    activity: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Category', categorySchema);
