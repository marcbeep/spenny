const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
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
    required: true,
  },
  balance: {
    type: Number,
    required: true,
  },
}, { timestamps: true });

accountSchema.pre('save', function(next) {
  this.balance = parseFloat(this.balance.toFixed(2));
  next();
});

accountSchema.pre(['update', 'findOneAndUpdate'], function(next) {
  const update = this.getUpdate();
  if (update.balance !== undefined) {
    update.balance = parseFloat(update.balance.toFixed(2));
  }
  this.setUpdate(update);
  next();
});

module.exports = mongoose.model('Account', accountSchema);
