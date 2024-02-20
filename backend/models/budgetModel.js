const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
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
  },
  { timestamps: true },
);

budgetSchema.pre('save', function (next) {
  this.totalAvailable = parseFloat(this.totalAvailable.toFixed(2));
  this.totalAssigned = parseFloat(this.totalAssigned.toFixed(2));
  this.readyToAssign = parseFloat(this.readyToAssign.toFixed(2));

  next();
});

budgetSchema.pre(['update', 'findOneAndUpdate'], function (next) {
  const update = this.getUpdate();

  if (update.totalAvailable !== undefined) {
    update.totalAvailable = parseFloat(update.totalAvailable.toFixed(2));
  }
  if (update.totalAssigned !== undefined) {
    update.totalAssigned = parseFloat(update.totalAssigned.toFixed(2));
  }
  if (update.readyToAssign !== undefined) {
    update.readyToAssign = parseFloat(update.readyToAssign.toFixed(2));
  }

  this.setUpdate(update);

  next();
});

module.exports = mongoose.model('Budget', budgetSchema);
