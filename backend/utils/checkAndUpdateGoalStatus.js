const Goal = require('../models/goalModel');
const Category = require('../models/categoryModel');
const moment = require('moment');

const checkAndUpdateGoalStatus = async (goalId = null, categoryId = null) => {
  let goals;

  // If a goalId is provided, find the specific goal
  if (goalId) {
    goals = await Goal.find({ _id: goalId }).populate('goalCategory');
  } else if (categoryId) {
    // If a categoryId is provided, find all goals associated with that category
    goals = await Goal.find({ goalCategory: categoryId }).populate('goalCategory');
  } else {
    // If neither is provided, fetch all goals
    goals = await Goal.find().populate('goalCategory');
  }

  const processGoal = async (goal) => {
    let isFunded = false;

    switch (goal.goalType) {
      case 'saving':
        isFunded = goal.goalTarget <= goal.goalCategory.categoryAvailable;
        break;
      case 'spending':
        const today = moment();
        const resetDay = moment().isoWeekday(goal.goalResetDay);
        const resetDayPassed = today.isSameOrAfter(resetDay, 'day');

        if (resetDayPassed) {
          isFunded = false;
        } else {
          isFunded = goal.goalTarget <= goal.goalCategory.categoryAvailable;
        }
        break;
      default:
        console.error(`Unknown goal type: ${goal.goalType}`);
    }

    goal.goalStatus = isFunded ? 'funded' : 'underfunded';
    await goal.save();
  };

  // Process each goal found
  for (let goal of goals) {
    await processGoal(goal);
  }
};

module.exports = checkAndUpdateGoalStatus;


