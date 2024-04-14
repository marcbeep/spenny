const User = require('../models/userModel');
const Account = require('../models/accountModel');
const Category = require('../models/categoryModel');
const Budget = require('../models/budgetModel');
const Goal = require('../models/goalModel'); 
const Transaction = require('../models/transactionModel');
const moment = require('moment');
const jwt = require('jsonwebtoken');


const createToken = (_id) => jwt.sign({ _id }, process.env.JWT_SECRET, { expiresIn: '3d' });

const initializeUserData = async (userId) => {
  try {
    // Create accounts
    const accountsData = [
      { accountTitle: 'Lloyds', accountType: 'spending', accountBalance: 30 },
      { accountTitle: 'Monzo', accountType: 'spending', accountBalance: 30 },
      { accountTitle: 'Vanguard Index Funds', accountType: 'tracking', accountBalance: 100 },
    ];
    
    const accounts = await Promise.all(
      accountsData.map(accountData => Account.create({
        user: userId,
        ...accountData,
      }))
    );

    // Create categories
    const genericCategories = ['groceries', 'transport', 'eating out', 'fun money', 'savings', 'rent'];
    const categories = await Promise.all(
      genericCategories.map(categoryTitle =>
        Category.create({
          user: userId,
          categoryTitle,
          categoryAvailable: 10.0,
          categoryActivity: 0.0,
        })
      )
    );

    // Create a budget
    await Budget.create({
      user: userId,
      budgetTotalAvailable: 0.0,
      budgetTotalAssigned: 0.0,
      budgetReadyToAssign: 10.0,
    });

    // Create example transactions
    await createExampleTransactions(userId, categories, accounts);

    // Update category activity based on transactions
    await updateCategoryActivity(userId, categories);

    return { success: true };
  } catch (err) {
    console.error('Error initializing data for user:', err);
    return { error: err.message || 'Failed to initialize user data' };
  }
};

// Function to update category activity
const updateCategoryActivity = async (userId, categories) => {
  const transactions = await Transaction.find({ user: userId });

  // Map of category IDs to their total activity
  const activityMap = transactions.reduce((acc, transaction) => {
    const amount = transaction.transactionType === 'debit' ? -transaction.transactionAmount : transaction.transactionAmount;
    if (acc[transaction.transactionCategory]) {
      acc[transaction.transactionCategory] += amount;
    } else {
      acc[transaction.transactionCategory] = amount;
    }
    return acc;
  }, {});

  // Update each category with the calculated activity
  const updatePromises = categories.map(category => {
    const activity = activityMap[category._id.toString()] || 0;
    return Category.findByIdAndUpdate(category._id, { $inc: { categoryActivity: activity } });
  });

  await Promise.all(updatePromises);
};

// Example Transactions Creation Function
const createExampleTransactions = async (userId, categories, accounts) => {
  // Select spending accounts
  const spendingAccounts = accounts.filter(account => account.accountType === 'spending');

  // Example transaction details
  const transactionsData = [
    {
      transactionTitle: 'transfer from liam for uber',
      transactionType: 'credit',
      transactionAmount: 1.00,
      transactionDate: moment().toDate(),
      transactionCategory: categories.find(c => c.categoryTitle === 'transport'), 
      transactionAccount: spendingAccounts[1]
    },
    {
      transactionTitle: 'asda shopping',
      transactionType: 'debit',
      transactionAmount: 1.00,
      transactionDate: moment().subtract(1, 'days').toDate(),
      transactionCategory: categories.find(c => c.categoryTitle === 'groceries'),
      transactionAccount: spendingAccounts[0]
    },
    {
      transactionTitle: 'drinks at spoons',
      transactionType: 'debit',
      transactionAmount: 2.00,
      transactionDate: moment().subtract(2, 'days').toDate(),
      transactionCategory: categories.find(c => c.categoryTitle === 'fun money'),
      transactionAccount: spendingAccounts[0]
    },
    {
      transactionTitle: 'fix door handles',
      transactionType: 'debit',
      transactionAmount: 3.00,
      transactionDate: moment().subtract(3, 'days').toDate(),
      transactionCategory: categories.find(c => c.categoryTitle === 'rent'), 
      transactionAccount: spendingAccounts[1]
    },
    {
      transactionTitle: 'kfc dinner',
      transactionType: 'debit',
      transactionAmount: 4.00,
      transactionDate: moment().subtract(4, 'days').toDate(),
      transactionCategory: categories.find(c => c.categoryTitle === 'eating out'),
      transactionAccount: spendingAccounts[0]
    },
    {
      transactionTitle: 'milos dog food',
      transactionType: 'debit',
      transactionAmount: 5.00,
      transactionDate: moment().subtract(5, 'days').toDate(),
      transactionCategory: categories.find(c => c.categoryTitle === 'eating out'),
      transactionAccount: spendingAccounts[1]
    },
    {
      transactionTitle: 'maccies breakfast',
      transactionType: 'debit',
      transactionAmount: 6.00,
      transactionDate: moment().subtract(6, 'days').toDate(),
      transactionCategory: categories.find(c => c.categoryTitle === 'eating out'),
      transactionAccount: spendingAccounts[1]
    },
    {
      transactionTitle: 'lidl bakery item',
      transactionType: 'debit',
      transactionAmount: 7.00,
      transactionDate: moment().subtract(7, 'days').toDate(),
      transactionCategory: categories.find(c => c.categoryTitle === 'groceries'),
      transactionAccount: spendingAccounts[1]
    }
  ];

  // Create transaction records
  await Promise.all(
    transactionsData.map(transaction =>
      Transaction.create({
        user: userId,
        transactionCategory: transaction.transactionCategory ? transaction.transactionCategory._id : null,
        transactionAccount: transaction.transactionAccount._id,
        transactionType: transaction.transactionType,
        transactionTitle: transaction.transactionTitle,
        transactionAmount: transaction.transactionAmount,
        createdAt: transaction.transactionDate,
        updatedAt: transaction.transactionDate,
      })
    )
  );
};


exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.login(email, password);
    const token = createToken(user._id);
    res.status(200).json({ email: user.userEmail, token, profilePicture: user.userProfilePicture });
  } catch (err) {
    res.status(401).json({ error: err.message || 'Authentication failed' });
  }
};

exports.signupUser = async (req, res) => {
  const { email, password } = req.body;
  const profilePictureUrl = `https://api.dicebear.com/8.x/notionists-neutral/svg?seed=${email}`;

  try {
    // Use the signup static method defined on the User model
    const user = await User.signup(email, password, profilePictureUrl);
    const token = createToken(user._id);

    const initDataResult = await initializeUserData(user._id);
    if (initDataResult.error) {
      throw new Error(initDataResult.error);
    }

    res.status(201).json({ email: user.userEmail, token, profilePicture: user.userProfilePicture });
  } catch (err) {
    let errorMessage = 'Signup failed due to an unexpected error.';
    if (err.code === 11000) {
      errorMessage = 'Email already exists. Please try another one.';
    } else if (err.message) {
      errorMessage = err.message;
    }
    res.status(400).json({ error: errorMessage });
  }
};
