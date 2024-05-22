const mongoose = require('mongoose');

const Schema = mongoose.Schema;

function formatNumber(value) {
  return Number(value);
}

const categorySchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    categoryTitle: {
      type: String,
      required: true,
      lowercase: true,
    },
    // categoryAssigned: {
    //   type: Number,
    //   default: 0,
    //   required: true,
    //   set: formatNumber,
    // },
    categoryAvailable: {
      type: Number,
      default: 0,
      required: true,
      set: formatNumber,
    },
    categoryActivity: {
      type: Number,
      default: 0,
      set: formatNumber,
    },
    categoryGoal: {
      type: Schema.Types.ObjectId,
      ref: 'Goal',
      default: null,
    },
  },
  { timestamps: true },
);

categorySchema.pre('save', function (next) {
  // this.categoryAssigned = formatNumber(this.categoryAssigned);
  this.categoryAvailable = formatNumber(this.categoryAvailable);
  this.categoryActivity = formatNumber(this.categoryActivity);
  next();
});

categorySchema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], function (next) {
  const update = this.getUpdate();
  // if (update.categoryAssigned !== undefined) {
  //   update.categoryAssigned = formatNumber(update.categoryAssigned);
  // }
  if (update.categoryAvailable !== undefined) {
    update.categoryAvailable = formatNumber(update.categoryAvailable);
  }
  if (update.categoryActivity !== undefined) {
    update.categoryActivity = formatNumber(update.categoryActivity);
  }
  this.setUpdate(update);
  next();
});

module.exports = mongoose.model('Category', categorySchema);
