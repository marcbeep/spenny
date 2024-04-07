const cron = require('node-cron');
const checkAndUpdateGoalStatus = require('../utils/checkAndUpdateGoalStatus');

// Schedule task to run daily at midnight (00:00)
cron.schedule('0 0 * * *', async () => {
  console.log('Running daily goal evaluation task');
  try {
    await checkAndUpdateGoalStatus();
    console.log('Goal evaluation task completed successfully');
  } catch (error) {
    console.error('An error occurred during the goal evaluation task:', error);
  }
});
