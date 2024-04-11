const mongoose = require('mongoose');
const Schema = mongoose.Schema;

function formatNumber(value) {
  return Number(value);
}

const goalSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    goalCategory: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    goalType: {
      type: String,
      required: true,
      lowercase: true,
      enum: ['spending', 'saving'],
    },
    goalTarget: {
      type: Number,
      required: true,
      set: formatNumber,
    },
    goalStatus: {
      type: String,
      required: true,
      lowercase: true,
      enum: ['underfunded', 'funded'],
    },
    goalResetDay: {
      type: String,
      enum: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
      required: function () {
        return this.goalType === 'spending';
      },
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Goal', goalSchema);
