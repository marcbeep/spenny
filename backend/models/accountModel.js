const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Helper function to format balance
function formatBalance(value) {
  return parseFloat(parseFloat(value).toFixed(2));
}

const accountSchema = new Schema(
  {
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
  },
  { timestamps: true },
);

// Pre-update hook to format balance
accountSchema.pre('findOneAndUpdate', function (next) {
  if (this._update.accountBalance) {
    this._update.accountBalance = formatBalance(this._update.accountBalance);
  }
  next();
});

module.exports = mongoose.model('Account', accountSchema);
