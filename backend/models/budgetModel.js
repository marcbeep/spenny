const mongoose = require('mongoose');

const Schema = mongoose.Schema;

function formatNumber(value) {
  return parseFloat(parseFloat(value).toFixed(2));
}

const budgetSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    budgetTotalAvailable: {
      type: Number,
      required: true,
      set: formatNumber,
    },
    budgetTotalAssigned: {
      type: Number,
      required: true,
      set: formatNumber,
    },
    budgetReadyToAssign: {
      type: Number,
      required: true,
      set: formatNumber,
    },
  },
  { timestamps: true },
);

budgetSchema.pre('save', function (next) {
  this.budgetTotalAvailable = formatNumber(this.budgetTotalAvailable);
  this.budgetTotalAssigned = formatNumber(this.budgetTotalAssigned);
  this.budgetReadyToAssign = formatNumber(this.budgetReadyToAssign);
  next();
});

budgetSchema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], function (next) {
  const update = this.getUpdate();

  if (update.budgetTotalAvailable !== undefined) {
    update.budgetTotalAvailable = formatNumber(update.budgetTotalAvailable);
  }
  if (update.budgetTotalAssigned !== undefined) {
    update.budgetTotalAssigned = formatNumber(update.budgetTotalAssigned);
  }
  if (update.budgetReadyToAssign !== undefined) {
    update.budgetReadyToAssign = formatNumber(update.budgetReadyToAssign);
  }

  this.setUpdate(update);
  next();
});

module.exports = mongoose.model('Budget', budgetSchema);

