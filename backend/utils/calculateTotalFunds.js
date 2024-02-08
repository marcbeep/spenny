const Account = require('../models/accountModel');

exports.calculateTotalFunds = async (userId) => {
  const accounts = await Account.find({ user: userId });
  return accounts.reduce((acc, account) => acc + account.balance, 0);
};
