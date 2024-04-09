const cron = require('node-cron');
const {
    calculateTotalSpend,
    calculateSpendingByCategory,
    calculateNetWorth,
    calculateIncomeVsExpenses,
    calculateSavingsRate,
    calculateAllTimeAnalytics // Assuming this function is defined to handle all-time stats update
} = require('../controllers/analyticsController');

// Simulated req and res objects for the scheduled tasks
const simulatedReq = { user: { _id: null } }; // You'll need a way to simulate or bypass the req.user requirement
const simulatedRes = {
    status: () => ({ json: (msg) => console.log(msg) })
};

// Schedule a job to run at 0:00 on Monday (week start)
cron.schedule('0 0 * * MON', async () => {
    console.log('Weekly stats update job started');

    // Fetch all user IDs from your database
    // Assuming you have a User model and each user should have their stats updated
    const users = await User.find({}); // Adjust based on your User model

    users.forEach(user => {
        simulatedReq.user._id = user._id; // Set user ID for each function call

        // Call each function for the user
        calculateTotalSpend(simulatedReq, simulatedRes);
        calculateSpendingByCategory(simulatedReq, simulatedRes);
        calculateNetWorth(simulatedReq, simulatedRes);
        calculateIncomeVsExpenses(simulatedReq, simulatedRes);
        calculateSavingsRate(simulatedReq, simulatedRes);
        calculateAllTimeAnalytics(simulatedReq, simulatedRes); // If designed to work on a per-user basis
    });

    console.log('Weekly stats update job completed');
});
