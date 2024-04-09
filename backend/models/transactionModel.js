const mongoose = require('mongoose');
const Schema = mongoose.Schema;

function formatNumber(value) {
  return parseFloat(parseFloat(value).toFixed(2));
}

const transactionSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    transactionCategory: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: false,
    },
    transactionAccount: {
      type: Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
    },
    transactionType: {
      type: String,
      required: true,
      lowercase: true,
      enum: ['debit', 'credit'],
    },
    transactionTitle: {
      type: String,
      required: true,
      lowercase: true,
    },
    transactionAmount: {
      type: Number,
      required: true,
      set: formatNumber,
    },
  },
  { timestamps: true },
);

transactionSchema.pre('save', function (next) {
  this.transactionAmount = formatNumber(this.transactionAmount);
  next();
});

transactionSchema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], function (next) {
  const update = this.getUpdate();
  if (update.transactionAmount !== undefined) {
    update.transactionAmount = formatNumber(update.transactionAmount);
  }
  this.setUpdate(update);
  next();
});

module.exports = mongoose.model('Transaction', transactionSchema);

