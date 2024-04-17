const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://spenny-6e54c38e0b23.herokuapp.com";

// Helper functions

async function makeFetchRequest(path, options = {}) {
  const token = sessionStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });

    const responseData = await response.json();

    if (!response.ok) {
      if (response.status === 404) {
        return responseData; // return the 404 data
      }
      throw new Error(
        responseData.error || `${response.status}: ${response.statusText}`,
      );
    }

    return responseData;
  } catch (error) {
    console.error("Fetch request failed:", error);
    throw error;
  }
}

async function loginUser(event) {
  event.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const loginButton = document.getElementById("loginButton");
  const spinner = document.getElementById("spinner");

  loginButton.disabled = true;
  spinner.classList.remove("hidden"); // Show the spinner

  try {
    const data = await makeFetchRequest("/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" }, // Ensure correct content type
      body: JSON.stringify({ email, password }),
    });

    sessionStorage.setItem("userEmail", data.email);
    sessionStorage.setItem("userProfilePicture", data.profilePicture);
    sessionStorage.setItem("token", data.token);

    // Redirect on successful login
    window.location.href = "dashboard.html";
  } catch (error) {
    console.error("Login failed:", error);
    alert("Error logging in. Check your email & password and try again.");
    loginButton.disabled = false;
    spinner.classList.add("hidden"); // Hide the spinner if there's an error
  }
}

async function signupUser(event) {
  event.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const signupButton = document.getElementById("signupButton");
  const spinner = document.getElementById("spinner");

  signupButton.disabled = true;
  spinner.classList.remove("hidden"); // Show the spinner

  try {
    const data = await makeFetchRequest("/users/signup", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    sessionStorage.setItem("userEmail", data.email);
    sessionStorage.setItem("userProfilePicture", data.profilePicture);
    sessionStorage.setItem("token", data.token);

    window.location.href = "dashboard.html";
  } catch (error) {
    console.error("Signup failed:", error);
    alert("Error signing up. Ensure your email has not been used, your password is at least 8 characters long and try again.");
    signupButton.disabled = false;
    spinner.classList.add("hidden"); // Hide the spinner
  }
}

function logoutUser() {
  sessionStorage.clear();
  window.location.href = "index.html";
}

// Dashboard Page functions

function fetchStatCards() {
  return makeFetchRequest("/analytics/statCards");
}

function fetchLastFiveTransactions() {
  return makeFetchRequest("/analytics/lastFiveTransactions");
}

function fetchDailySpendLastWeek() {
  return makeFetchRequest("/analytics/dailySpendLastWeek");
}

function fetchSpendByCategoryAllTime() {
  return makeFetchRequest("/analytics/spendByCategoryAllTime");
}

function fetchAvailableToSpend() {
  return makeFetchRequest("/analytics/availableToSpend");
}

function fetchAccountBalances() {
  return makeFetchRequest("/analytics/accountBalances");
}

async function fetchAllAnalyticsData() {
  try {
    const results = await Promise.all([
      fetchStatCards(),
      fetchLastFiveTransactions(),
      fetchDailySpendLastWeek(),
      fetchSpendByCategoryAllTime(),
      fetchAvailableToSpend(),
      fetchAccountBalances(),
    ]);

    // results[0] corresponds to the response from fetchStatCards
    // results[1] corresponds to the response from fetchLastFiveTransactions, etc.

    // You might want to handle the results differently based on your UI setup:
    return {
      statCards: results[0],
      lastFiveTransactions: results[1],
      dailySpendLastWeek: results[2],
      spendByCategoryAllTime: results[3],
      availableToSpend: results[4],
      accountBalances: results[5],
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw error;
  }
}

// Budget Page functions

async function fetchReadyToAssign() {
  try {
    const response = await makeFetchRequest(`/budget/readyToAssign`, {
      method: "GET",
    });
    console.log("Ready to Assign:", response);
    return response;
  } catch (error) {
    console.error("Error fetching Ready to Assign amount:", error);
    throw error;
  }
}

async function assignMoneyToCategory(categoryId, amount) {
  try {
    const result = await makeFetchRequest(`/budget/assignToCategory`, {
      method: "POST",
      body: JSON.stringify({ categoryId, amount }),
    });
    console.log("Money assigned:", result);
    return result;
  } catch (error) {
    console.error("Error assigning money to category:", error);
    throw error;
  }
}

async function moveMoneyBetweenCategories(
  fromCategoryId,
  toCategoryId,
  amount,
) {
  try {
    const result = await makeFetchRequest(`/budget/moveBetweenCategories`, {
      method: "POST",
      body: JSON.stringify({ fromCategoryId, toCategoryId, amount }),
    });
    console.log("Money moved between categories:", result);
    return result;
  } catch (error) {
    console.error("Error moving money between categories:", error);
    throw error;
  }
}

async function removeMoneyFromCategory(categoryId, amount) {
  try {
    const result = await makeFetchRequest(`/budget/removeFromCategories`, {
      method: "POST",
      body: JSON.stringify({ categoryId, amount }),
    });
    console.log("Money removed from category:", result);
    return result;
  } catch (error) {
    console.error("Error removing money from category:", error);
    throw error;
  }
}

async function moveToReadyToAssign(categoryId, amount) {
  try {
    const result = await makeFetchRequest(`/budget/moveToReadyToAssign`, {
      method: "POST",
      body: JSON.stringify({ categoryId, amount }),
    });
    console.log("Money moved to Ready to Assign:", result);
    return result;
  } catch (error) {
    console.error("Error moving money to Ready to Assign:", error);
    throw error;
  }
}

async function fetchSpendingBalance() {
  try {
    const response = await makeFetchRequest("/accounts/getSpendingBalance", {
      method: "GET",
    });
    console.log("Spending Balance:", response);
    return response;
  } catch (error) {
    console.error("Error fetching spending balance:", error);
    throw error;
  }
}

async function fetchUserCategories() {
  try {
    const response = await makeFetchRequest("/categories/categoryTable", {
      method: "GET",
    });
    const categories = await response;
    console.log("User Categories:", categories);
    return categories; // Return the categories data
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error; // Ensure to throw an error to be caught by the caller
  }
}

async function fetchAllBudgetData() {
  try {
    const [spendingBalanceResponse, readyToAssignResponse, categories] =
      await Promise.all([
        fetchSpendingBalance(),
        fetchReadyToAssign(),
        fetchUserCategories(), // Ensure this function returns the expected data
      ]);

    return {
      spendingBalance: spendingBalanceResponse.totalSpendingBalance, // Assuming these responses are directly the values
      readyToAssign: readyToAssignResponse.readyToAssign,
      categories, // Ensure categories is directly usable
    };
  } catch (error) {
    console.error("Error fetching budget data:", error);
    throw error;
  }
}

async function createGoal(categoryId, goalType, goalTarget, goalResetDay) {
  try {
    const newGoal = await makeFetchRequest("/goals", {
      method: "POST",
      body: JSON.stringify({ categoryId, goalType, goalTarget, goalResetDay }),
    });
    console.log("Goal created:", newGoal);
    return newGoal;
  } catch (error) {
    throw error;
  }
}

async function deleteGoal(goalId) {
  try {
    const response = await makeFetchRequest(`/goals/${goalId}`, {
      method: "DELETE",
    });
    console.log("Goal deleted:", response);
    return response;
  } catch (error) {
    console.error("Error deleting goal:", error);
    throw error;
  }
}

async function editGoal(goalId, goalTarget) {
  try {
    const response = await makeFetchRequest(`/goals/${goalId}`, {
      method: "PATCH",
      body: JSON.stringify({ goalTarget }),
    });
    console.log("Goal updated:", response);
    return response;
  } catch (error) {
    console.error("Error updating goal:", error);
    throw error;
  }
}

async function deleteCategory(categoryId, newCategoryId) {
  try {
    const response = await makeFetchRequest(`/categories/${categoryId}`, {
      method: "DELETE",
      body: JSON.stringify({ newCategoryId }),
    });
    console.log("Category deleted:", response);
    return response;
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
}

// Transaction page functions

async function fetchAllTransactions() {
  try {
    const transactions = await makeFetchRequest(
      "/transactions/transactionTable",
    );
    console.log("All Transactions:", transactions);
    return transactions;
  } catch (error) {
    console.error("Error fetching all transactions:", error);
    throw error;
  }
}

async function addTransaction(transactionData) {
  try {
    const newTransaction = await makeFetchRequest("/transactions", {
      method: "POST",
      body: JSON.stringify(transactionData),
    });
    console.log("Transaction Created:", newTransaction);
    return newTransaction;
  } catch (error) {
    console.log("Error creating transaction:", error);
  }
}

async function deleteTransaction(transactionId) {
  try {
    await makeFetchRequest(`/transactions/${transactionId}`, {
      method: "DELETE",
    });
    console.log(`Transaction ${transactionId} deleted.`);
  } catch (error) {
    console.error(`Error deleting transaction ${transactionId}:`, error);
    throw error;
  }
}

async function updateTransaction(transactionId, updatedData) {
  try {
    const updatedTransaction = await makeFetchRequest(
      `/transactions/${transactionId}`,
      {
        method: "PATCH",
        body: JSON.stringify(updatedData),
      },
    );
    console.log("Transaction Updated:", updatedTransaction);
    return updatedTransaction;
  } catch (error) {
    console.log("Error updating transaction:", error.message);
    throw error;
  }
}

async function ai(transactionData) {
  try {
    const newTransaction = await makeFetchRequest("/transactions/ai", {
      method: "POST",
      body: JSON.stringify(transactionData),
    });
    console.log("Transaction Created:", newTransaction);
    return newTransaction;
  } catch (error) {
    console.log("Error creating transaction:", error.message);
    throw error;
  }
}

async function getCategoryAndAccountNames() {
  try {
    const response = await makeFetchRequest(
      "/transactions/getCategoryAndAccountNames",
    );
    console.log("Category and Account Names:", response);
    return response;
  } catch (error) {
    console.error("Error fetching category and account names:", error);
    throw error;
  }
}

// Account page functions

async function fetchAllAccounts() {
  try {
    const accounts = await makeFetchRequest("/accounts");
    console.log("All Accounts:", accounts);
    return accounts;
  } catch (error) {
    console.error("Error fetching all accounts:", error);
    throw error;
  }
}

async function archiveAccount(accountId) {
  try {
    const result = await makeFetchRequest(`/accounts/archive/${accountId}`, {
      method: "POST",
    });
    console.log("Account archived:", result);
    refreshAccountData(); // Refresh the account data on the page
    return result;
  } catch (error) {
    console.error("Error archiving account:", error);
    throw error;
  }
}

async function addAccount(accountData) {
  try {
    const newAccount = await makeFetchRequest("/accounts", {
      method: "POST",
      body: JSON.stringify(accountData),
    });
    console.log("Account Created:", newAccount);
    refreshAccountData(); // Refresh the account data on the page
    return newAccount;
  } catch (error) {
    console.log("Error creating account:", error.message);
    throw error;
  }
}

async function updateAccount(accountId, accountBalance) {
  try {
    const body = { accountBalance };
    const account = await makeFetchRequest(`/accounts/${accountId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    console.log("Account updated:", account);
    refreshAccountData(); // Refresh the account data on the page
    return account;
  } catch (error) {
    console.error("Error updating account:", error);
    throw error;
  }
}

async function moveMoneyBetweenAccounts(fromAccountId, toAccountId, amount) {
  try {
    const result = await makeFetchRequest("/accounts/moveMoney", {
      method: "POST",
      body: JSON.stringify({ fromAccountId, toAccountId, amount }),
    });
    console.log("Money moved successfully:", result);
    refreshAccountData(); // Refresh the account data on the page
    return result;
  } catch (error) {
    console.log(
      "Error moving money between accounts. Ensure you are not moving funds from/to archived accounts.",
      error,
    );
    throw error;
  }
}
