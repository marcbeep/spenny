const cron = require('node-cron');
const checkAndUpdateGoalStatus = require('../utils/checkAndUpdateGoalStatus');

cron.schedule('0 0 * * *', async () => {
  try {
    await checkAndUpdateGoalStatus();
  } catch (error) {
    console.error('An error occurred during the goal evaluation task:', error);
  }
});
