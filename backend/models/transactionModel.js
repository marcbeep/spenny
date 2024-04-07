const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Helper function to format numbers to two decimal places
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
      required: false, // If no category, then ready to assign
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
      enum: ['debit', 'credit'], // Restricts the value to either 'debit' or 'credit'
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

// Pre-save hook to format the amount field for new documents
transactionSchema.pre('save', function (next) {
  this.transactionAmount = formatNumber(this.transactionAmount);
  next();
});

// Pre-update hooks to ensure amount is formatted on updates
transactionSchema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], function (next) {
  const update = this.getUpdate();
  if (update.transactionAmount !== undefined) {
    update.transactionAmount = formatNumber(update.transactionAmount);
  }
  this.setUpdate(update);
  next();
});

module.exports = mongoose.model('Transaction', transactionSchema);
