const cron = require('node-cron');
const { updateAllUserAnalytics } = require('../utils/updateAllUserAnalytics');

cron.schedule('0 0 * * 1', async () => {
  try {
    await updateAllUserAnalytics();
    console.log('Weekly analytics update job completed.');
  } catch (error) {
    console.error('Error during weekly analytics update job:', error);
  }
});

