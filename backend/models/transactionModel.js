const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
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
    type: {
      type: String,
      required: false,
    },
    amount: {
      type: Number,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
    },
  },
  { timestamps: true },
);

transactionSchema.pre('save', function (next) {
  this.amount = parseFloat(this.amount.toFixed(2));
  next();
});

transactionSchema.pre(['update', 'findOneAndUpdate'], function (next) {
  const update = this.getUpdate();
  if (update.amount !== undefined) {
    update.amount = parseFloat(update.amount.toFixed(2));
  }
  this.setUpdate(update);
  next();
});

module.exports = mongoose.model('Transaction', transactionSchema);
