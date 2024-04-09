const cron = require('node-cron');

// Assuming updateAllUserAnalytics is exported from the utility module
const { updateAllUserAnalytics } = require('../utils/updateAllUserAnalytics');

// Schedule to run every Monday at 00:00
cron.schedule('0 0 * * 1', () => {
    console.log('Starting weekly analytics update job...');
    updateAllUserAnalytics()
        .then(() => console.log('Weekly analytics update job completed.'))
        .catch(error => console.error('Error during weekly analytics update job:', error));
});
