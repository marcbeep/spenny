const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Helper function to format numbers to two decimal places
function formatNumber(value) {
  return parseFloat(parseFloat(value).toFixed(2));
}

const categorySchema = new Schema({
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
  categoryAssigned: {
    type: Number,
    default: 0,
    required: true,
    set: formatNumber,
  },
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
    default: null, // It can be null if the category has no goal
  },
}, { timestamps: true });

// Pre-save hook to format numeric fields for new documents
categorySchema.pre('save', function (next) {
  this.categoryAssigned = formatNumber(this.categoryAssigned);
  this.categoryAvailable = formatNumber(this.categoryAvailable);
  this.categoryActivity = formatNumber(this.categoryActivity);
  next();
});

// Pre-update hooks to ensure numeric fields are formatted on updates
categorySchema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], function (next) {
  const update = this.getUpdate();
  if (update.categoryAssigned !== undefined) {
    update.categoryAssigned = formatNumber(update.categoryAssigned);
  }
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

