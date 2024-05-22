const Goal = require('../models/goalModel');
const moment = require('moment');

const checkAndUpdateGoalStatus = async (goalId = null, categoryId = null) => {
  try {
    let goals;

    if (goalId) {
      goals = await Goal.find({ _id: goalId }).populate('goalCategory');
    } else if (categoryId) {
      goals = await Goal.find({ goalCategory: categoryId }).populate('goalCategory');
    } else {
      goals = await Goal.find().populate('goalCategory');
    }

    const processGoal = async (goal) => {
      let isGoalFunded = false;

      switch (goal.goalType) {
        case 'saving':
          isGoalFunded = goal.goalTarget <= goal.goalCategory.categoryAvailable;
          break;
        case 'spending':
          const today = moment();
          let resetDay = moment().isoWeekday(goal.goalResetDay);

          // Adjust resetDay to the upcoming occurrence if today is past it
          if (resetDay.isBefore(today, 'day')) {
            resetDay.add(1, 'weeks');
          }

          const resetDayPassed = today.isSameOrAfter(resetDay, 'day');
          // If today is the reset day or past it, check if funds are sufficient
          isGoalFunded = goal.goalTarget <= goal.goalCategory.categoryAvailable;
          break;
        default:
          console.error(`Unknown goal type: ${goal.goalType}`);
      }

      goal.goalStatus = isGoalFunded ? 'funded' : 'underfunded';
      await goal.save();
    };

    for (let goal of goals) {
      await processGoal(goal);
    }
  } catch (error) {
    console.error('Error in checkAndUpdateGoalStatus:', error);
    throw error; // Propagate the error to the caller
  }
};

module.exports = checkAndUpdateGoalStatus;
