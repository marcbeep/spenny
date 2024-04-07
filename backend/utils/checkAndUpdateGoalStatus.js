const Goal = require('../models/goalModel');
const Category = require('../models/categoryModel');
const moment = require('moment');

const checkAndUpdateGoalStatus = async (goalId = null) => {
  let query = goalId ? Goal.find({ _id: goalId }) : Goal.find();
  query = query.populate('goalCategory');

  const goals = await query;

  for (const goal of goals) {
    const isFunded = goal.goalTarget <= goal.goalCategory.categoryAvailable;
    goal.goalStatus = isFunded ? 'funded' : 'underfunded';

    const currentDate = new Date();
    if (goal.goalDeadline && currentDate > new Date(goal.goalDeadline)) {
      // For weekly goals, add 7 days to the deadline
      goal.goalDeadline = moment(goal.goalDeadline).add(1, 'week').toDate();
      goal.goalStatus = 'underfunded'; // Reset status for the new week
    }

    await goal.save();
  }
};

module.exports = checkAndUpdateGoalStatus;
