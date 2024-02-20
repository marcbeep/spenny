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

categorySchema.pre('save', function (next) {
  this.assignedAmount = parseFloat(this.assignedAmount.toFixed(2));
  this.available = parseFloat(this.available.toFixed(2));
  this.activity = parseFloat(this.activity.toFixed(2));
  next();
});

categorySchema.pre(['update', 'findOneAndUpdate'], function (next) {
  const update = this.getUpdate();
  if (update.assignedAmount !== undefined) {
    update.assignedAmount = parseFloat(update.assignedAmount.toFixed(2));
  }
  if (update.available !== undefined) {
    update.available = parseFloat(update.available.toFixed(2));
  }
  if (update.activity !== undefined) {
    update.activity = parseFloat(update.activity.toFixed(2));
  }
  this.setUpdate(update);
  next();
});

module.exports = mongoose.model('Category', categorySchema);
