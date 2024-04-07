const Goal = require('../models/goalModel');
const Category = require('../models/categoryModel');

const checkAndUpdateGoalStatus = async () => {
  const goals = await Goal.find().populate('goalCategory');
  
  for (const goal of goals) {
    let isFunded = false;

    // Assuming goalTarget and categoryAssigned are numbers
    if (goal.goalTarget <= goal.goalCategory.categoryAssigned) {
      isFunded = true;
    }
    
    // Adjusting the logic based on different types of goals (if there are different types like 'saving', etc.)
    // If there's a deadline, we might need additional checks here.
    
    goal.goalStatus = isFunded ? 'funded' : 'underfunded';
    await goal.save();
  }
};
  
module.exports = checkAndUpdateGoalStatus;
