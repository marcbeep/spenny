const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Helper function to format balance
function formatBalance(value) {
  return parseFloat(parseFloat(value).toFixed(2));
}

const accountSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  accountTitle: {
    type: String,
    required: true,
    lowercase: true,
  },
  accountType: {
    type: String,
    required: true,
    lowercase: true,
    enum: ['spending', 'tracking'], // Restrict to 'spending' or 'tracking'
  },
  accountBalance: {
    type: Number,
    required: true,
    set: formatBalance, // Use setter to format balance
  },
}, { timestamps: true });

// Pre-save hook to format balance for new documents
accountSchema.pre('save', function (next) {
  this.accountBalance = formatBalance(this.accountBalance);
  next();
});

// Pre-update hooks to ensure balance is formatted on updates
// Note: 'update' is deprecated in favor of 'updateOne' and 'updateMany'
accountSchema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], function (next) {
  if (this._update.accountBalance) {
    this._update.accountBalance = formatBalance(this._update.accountBalance);
  }
  next();
});

module.exports = mongoose.model('Account', accountSchema);
