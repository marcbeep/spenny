const Goal = require('../models/goalModel');
const Category = require('../models/categoryModel');
const moment = require('moment');

const checkAndUpdateGoalStatus = async (goalId = null) => {
  // Determine whether to update a specific goal or all goals
  let query = goalId ? Goal.find({ _id: goalId }) : Goal.find();
  query = query.populate('goalCategory');

  const goals = await query;

  goals.forEach(async (goal) => {
    let isFunded = false;

    // Determine if the goal is funded based on its type
    switch (goal.goalType) {
      case 'saving':
      case 'minimum':
        // For 'saving' and 'minimum' goals, compare against category's available funds
        isFunded = goal.goalTarget <= goal.goalCategory.categoryAvailable;
        break;
      case 'spending':
        // 'Spending' goals might have additional conditions based on deadlines
        if (goal.goalDeadline) {
          const deadlinePassed = moment().isAfter(moment(goal.goalDeadline));
          isFunded = goal.goalTarget <= goal.goalCategory.categoryAvailable && !deadlinePassed;
        } else {
          isFunded = goal.goalTarget <= goal.goalCategory.categoryAvailable;
        }
        break;
      default:
        console.error(`Unknown goal type: ${goal.goalType}`);
    }

    goal.goalStatus = isFunded ? 'funded' : 'underfunded';

    // If the goal has a deadline and it's past, reset for the next period (e.g., next week)
    if (goal.goalDeadline && moment().isAfter(moment(goal.goalDeadline))) {
      goal.goalDeadline = moment(goal.goalDeadline).add(1, 'week').toDate();
      goal.goalStatus = 'underfunded'; // Reset status for the new period
    }

    await goal.save();
  });
};

module.exports = checkAndUpdateGoalStatus;
