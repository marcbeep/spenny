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
    amount: {
      type: Number,
      required: true,
    },
    category: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: false,
    },
  },
  { timestamps: true }
);


module.exports = mongoose.model('Transaction', transactionSchema);
