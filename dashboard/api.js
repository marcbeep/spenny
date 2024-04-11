const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000' : 'https://spenny-6e54c38e0b23.herokuapp.com';
// const API_URL = 'https://spenny-6e54c38e0b23.herokuapp.com';

// Helper  functions

function displayList(elementId, items, formatter) {
    const listElement = document.getElementById(elementId);
    if (!listElement) {
        console.error('List element not found:', elementId);
        return;
    }
    listElement.innerHTML = ''; // Clear existing content
    items.forEach(item => {
        const listItem = document.createElement('li');
        listItem.textContent = formatter(item); // Use formatter function to get display text
        listElement.appendChild(listItem);
    });
}

async function fetchAndDisplayAnalytics() {
    try {
        // Fetch all-time analytics data
        const allTimeAnalyticsResult = await calculateAllTimeAnalytics();

        // Access the analytics list in the DOM
        const analyticsList = document.getElementById('analyticsList');
        if (!analyticsList) {
            console.error('Analytics list element not found');
            return;
        }
        analyticsList.innerHTML = '';  // Clear previous contents

        // Append data to the list
        if (allTimeAnalyticsResult && allTimeAnalyticsResult.data) {
            analyticsList.appendChild(createListItem('Net Worth', allTimeAnalyticsResult.data.netWorth));
            analyticsList.appendChild(createListItem('Total Income', allTimeAnalyticsResult.data.totalIncome));
            analyticsList.appendChild(createListItem('Total Expenditure', allTimeAnalyticsResult.data.totalExpenditure));
            analyticsList.appendChild(createListItem('Savings Rate', allTimeAnalyticsResult.data.savingsRate));
        } else {
            console.error('No data received for All-Time Analytics');
        }
    } catch (error) {
        console.error('Error fetching all-time analytics:', error);
    }
}

function createListItem(title, value) {
    const listItem = document.createElement('li');
    listItem.textContent = `${title}: ${value}`;
    return listItem;
}

function createListItem(title, value) {
    const listItem = document.createElement('li');
    listItem.textContent = `${title}: ${value}`;
    return listItem;
}

function updateUI() {
    fetchAllAccounts();
    fetchUserCategories();
    fetchAllTransactions();
    fetchAllGoals();
    fetchAndDisplayAnalytics();
}

async function makeFetchRequest(path, options = {}) {
    const token = sessionStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_URL}${path}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const errorResponse = await response.json();
            throw new Error(errorResponse.error || `${response.status}: ${response.statusText}`);
        }

        return response.json(); // Assuming all responses are expected to be JSON
    } catch (error) {
        console.error('Fetch request failed:', error);
        throw error; // Re-throw to allow specific function handling
    }
}

// Auth functions

async function loginUser(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const data = await makeFetchRequest('/users/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });

        sessionStorage.setItem('userEmail', data.email);
        sessionStorage.setItem('userProfilePicture', data.profilePicture);
        sessionStorage.setItem('token', data.token);

        window.location.href = 'success.html';
    } catch (error) {
        alert(error.message);
    }
}

async function signupUser(event) {
    event.preventDefault(); 
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const data = await makeFetchRequest('/users/signup', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });

        sessionStorage.setItem('userEmail', data.email);
        sessionStorage.setItem('userProfilePicture', data.profilePicture);
        sessionStorage.setItem('token', data.token);

        window.location.href = 'success.html';
    } catch (error) {
        alert(error.message);
    }
}

function logoutUser() {
    sessionStorage.clear();
    window.location.href = 'index.html';
}

// Account functions

async function fetchAllAccounts() {
    try {
        const accounts = await makeFetchRequest('/accounts');
        console.log('All Accounts:', accounts);
        // Update UI with these accounts
        displayList('accountsList', accounts, account => 
            `${account._id} / ${account.accountTitle} / ${account.accountType} / ${account.accountStatus} / £${account.accountBalance}`);
    } catch (error) {
        console.error('Error fetching all accounts:', error);
    }
}

async function fetchSingleAccount(accountId) {
    try {
        const account = await makeFetchRequest(`/accounts/${accountId}`);
        console.log('Single Account:', account);
        // Optionally: Display this account details in the UI
    } catch (error) {
        console.error('Error fetching single account:', error);
    }
}

async function addAccount(accountData) {
    try {
        const newAccount = await makeFetchRequest('/accounts', {
            method: 'POST',
            body: JSON.stringify(accountData)
        });
        console.log('Account Created:', newAccount);
        updateUI();
    } catch (error) {
        alert('Error creating account:', error.message);
    }
}

async function archiveAccount(accountId) {
    try {
        await makeFetchRequest(`/accounts/archive/${accountId}`, {
            method: 'POST' // Ensure the correct HTTP method based on your backend
        });
        console.log(`Account ${accountId} archived.`);
        fetchAllAccounts(); // Refresh the account list
    } catch (error) {
        alert('Error archiving account:', error.message);
    }
}

async function updateAccount(accountId, updatedData) {
    try {
        const updatedAccount = await makeFetchRequest(`/accounts/${accountId}`, {
            method: 'PATCH',
            body: JSON.stringify(updatedData)
        });
        console.log('Account Updated:', updatedAccount);
        fetchAllAccounts(); // Refresh the account list
    } catch (error) {
        alert('Error updating account:', error.message);
    }
}

async function moveMoneyBetweenAccounts(fromAccountId, toAccountId, amount) {
    try {
        const result = await makeFetchRequest('/accounts/moveMoney', {
            method: 'POST',
            body: JSON.stringify({ fromAccountId, toAccountId, amount })
        });
        console.log('Money moved successfully:', result);
        fetchAllAccounts(); // Optionally refresh both accounts to reflect the new balances
    } catch (error) {
        alert('Error moving money between accounts:', error.message);
    }
}

// Analytics functions

async function calculateTotalSpend() {
    try {
        const result = await makeFetchRequest('/analytics/totalSpend', { method: 'GET' });
        console.log('Total Spend:', result);
        // Optionally: Update UI with total spend data
    } catch (error) {
        console.error('Error calculating total spend:', error);
    }
}

async function calculateSpendingByCategory() {
    try {
        const result = await makeFetchRequest('/analytics/spendByCategory', { method: 'GET' });
        console.log('Spending by Category:', result);
        // Optionally: Update UI with spending by category data
    } catch (error) {
        console.error('Error calculating spending by category:', error);
    }
}

async function calculateNetWorth() {
    try {
        const result = await makeFetchRequest('/analytics/networth', { method: 'GET' });
        console.log('Net Worth:', result);
        // Optionally: Display net worth in the UI
    } catch (error) {
        console.error('Error calculating net worth:', error);
    }
}

async function calculateIncomeVsExpenses() {
    try {
        const result = await makeFetchRequest('/analytics/incomeVsExpenses', { method: 'GET' });
        console.log('Income vs. Expenses:', result);
        // Optionally: Display income vs. expenses data in the UI
    } catch (error) {
        console.error('Error calculating income vs. expenses:', error);
    }
}

async function calculateSavingsRate() {
    try {
        const result = await makeFetchRequest('/analytics/savingsRate', { method: 'GET' });
        console.log('Savings Rate:', result);
        // Optionally: Update UI with savings rate data
    } catch (error) {
        console.error('Error calculating savings rate:', error);
    }
}

async function calculateAllTimeAnalytics() {
    try {
        const response = await makeFetchRequest('/analytics/alltime', { method: 'GET' });
        console.log('All-Time Analytics:', response);
        return response; 
    } catch (error) {
        console.error('Error calculating all-time analytics:', error);
        return null; 
    }
}

// Budget functions

async function assignMoneyToCategory(categoryId, amount) {
    try {
        const result = await makeFetchRequest(`/budget/assignToCategory`, {
            method: 'POST',
            body: JSON.stringify({ categoryId, amount })
        });
        console.log('Money assigned:', result);
        // Optionally: Update UI with new category and budget details
    } catch (error) {
        console.error('Error assigning money to category:', error);
    }
}

async function moveMoneyBetweenCategories(fromCategoryId, toCategoryId, amount) {
    try {
        const result = await makeFetchRequest(`/budget/moveBetweenCategories`, {
            method: 'POST',
            body: JSON.stringify({ fromCategoryId, toCategoryId, amount })
        });
        console.log('Money moved between categories:', result);
        // Optionally: Refresh categories to reflect new balances
    } catch (error) {
        console.error('Error moving money between categories:', error);
    }
}

async function removeMoneyFromCategory(categoryId, amount) {
    try {
        const result = await makeFetchRequest(`/budget/removeFromCategories`, {
            method: 'POST',
            body: JSON.stringify({ categoryId, amount })
        });
        console.log('Money removed from category:', result);
        // Optionally: Update UI to reflect the updated category balance
    } catch (error) {
        console.error('Error removing money from category:', error);
    }
}

async function fetchReadyToAssign() {
    try {
        const result = await makeFetchRequest(`/budget/readyToAssign`, { method: 'GET' });
        console.log('Ready to Assign:', result);
        // Optionally: Display the Ready to Assign amount in the UI
    } catch (error) {
        console.error('Error fetching Ready to Assign amount:', error);
    }
}

async function moveToReadyToAssign(categoryId, amount) {
    try {
        const result = await makeFetchRequest(`/budget/moveToReadyToAssign`, {
            method: 'POST',
            body: JSON.stringify({ categoryId, amount })
        });
        console.log('Money moved to Ready to Assign:', result);
        // Optionally: Update UI to show the updated Ready to Assign and category balances
    } catch (error) {
        console.error('Error moving money to Ready to Assign:', error);
    }
}

// Category functions

async function fetchUserCategories() {
    try {
        const categories = await makeFetchRequest('/categories');
        displayList('categoriesList', categories, category => 
            `${category._id} / ${category.categoryTitle} / activity: £${category.categoryActivity} / assigned: £${category.categoryAssigned} / available: £${category.categoryAvailable}`);
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
}

async function addCategory(categoryTitle) {
    try {
        const newCategory = await makeFetchRequest('/categories', {
            method: 'POST',
            body: JSON.stringify({ title: categoryTitle }),
        });

        console.log('New Category Added:', newCategory);

        updateUI();
    } catch (error) {
        alert(error.message);
    }
}

async function fetchSingleCategory(categoryId) {
    try {
        const category = await makeFetchRequest(`/categories/${categoryId}`);
        console.log('Fetched Category:', category);
    } catch (error) {
        console.error('Error fetching single category:', error);
    }
}

async function updateCategory(categoryId, newTitle) {
    try {
        const updatedCategory = await makeFetchRequest(`/categories/${categoryId}`, {
            method: 'PATCH',
            body: JSON.stringify({ title: newTitle }),
        });

        console.log('Updated Category:', updatedCategory);
        fetchUserCategories(); // Optionally refresh the categories list to reflect the update
    } catch (error) {
        alert(error.message);
    }
}

async function deleteCategory(categoryId, newCategoryId) {
    try {
        await makeFetchRequest(`/categories/${categoryId}`, {
            method: 'DELETE',
            body: JSON.stringify({ newCategoryId }),
        });

        console.log(`Category ${categoryId} deleted.`);
        fetchUserCategories(); // Refresh categories list to reflect the deletion
    } catch (error) {
        alert(error.message);
    }
}

// Goal functions

async function fetchAllGoals() {
    try {
        const goals = await makeFetchRequest('/goals', { method: 'GET' });
        console.log('Goals fetched:', goals);
        // Optionally: Update UI with fetched goals
    } catch (error) {
        console.error('Error fetching goals:', error);
    }
}

async function fetchSingleGoal(goalId) {
    try {
        const goal = await makeFetchRequest(`/goals/${goalId}`, { method: 'GET' });
        console.log('Goal fetched:', goal);
        // Optionally: Display the goal details in the UI
    } catch (error) {
        console.error('Error fetching goal:', error);
    }
}

async function createGoal(categoryId, goalType, goalTarget, goalResetDay) {
    try {
        const body = { categoryId, goalType, goalTarget, goalResetDay };
        const goal = await makeFetchRequest('/goals', {
            method: 'POST',
            body: JSON.stringify(body)
        });
        console.log('Goal created:', goal);
        updateUI();
    } catch (error) {
        console.error('Error creating goal:', error);
    }
}

async function updateGoal(goalId, goalType, goalTarget, goalResetDay) {
    try {
        const body = { goalType, goalTarget, goalResetDay };
        const goal = await makeFetchRequest(`/goals/${goalId}`, {
            method: 'PATCH',
            body: JSON.stringify(body)
        });
        console.log('Goal updated:', goal);
        // Optionally: Refresh the UI to show the updated goal details
    } catch (error) {
        console.error('Error updating goal:', error);
    }
}

async function deleteGoal(goalId) {
    try {
        await makeFetchRequest(`/goals/${goalId}`, { method: 'DELETE' });
        console.log('Goal deleted successfully');
        // Optionally: Update UI to remove the deleted goal
    } catch (error) {
        console.error('Error deleting goal:', error);
    }
}

// Transaction functions

async function fetchAllTransactions() {
    try {
        const transactions = await makeFetchRequest('/transactions');
        console.log('All Transactions:', transactions);
        // Update UI with these transactions
        displayList('transactionsList', transactions, transaction => 
            `${transaction._id} / ${transaction.transactionTitle} / ${transaction.transactionType} / £${transaction.transactionAmount}`);
    } catch (error) {
        console.error('Error fetching all transactions:', error);
    }
}

async function fetchSingleTransaction(transactionId) {
    try {
        const transaction = await makeFetchRequest(`/transactions/${transactionId}`);
        console.log('Single Transaction:', transaction);
        // Optionally: Display this transaction details in the UI
    } catch (error) {
        console.error('Error fetching single transaction:', error);
    }
}

async function createTransaction(transactionData) {
    try {
        const newTransaction = await makeFetchRequest('/transactions', {
            method: 'POST',
            body: JSON.stringify(transactionData)
        });
        console.log('Transaction Created:', newTransaction);
        updateUI();
    } catch (error) {
        alert('Error creating transaction:', error);
    }
}

async function deleteTransaction(transactionId) {
    try {
        await makeFetchRequest(`/transactions/${transactionId}`, {
            method: 'DELETE'
        });
        console.log(`Transaction ${transactionId} deleted.`);
        updateUI();
    } catch (error) {
        alert('Error deleting transaction:', error.message);
    }
}

async function updateTransaction(transactionId, updatedData) {
    try {
        const updatedTransaction = await makeFetchRequest(`/transactions/${transactionId}`, {
            method: 'PATCH',
            body: JSON.stringify(updatedData)
        });
        console.log('Transaction Updated:', updatedTransaction);
        updateUI();
    } catch (error) {
        alert('Error updating transaction:', error.message);
    }
}