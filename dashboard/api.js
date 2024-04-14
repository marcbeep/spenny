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
    window.location.href = "success.html";
  } catch (error) {
    // Show an alert message on login failure
    alert("Error logging in. Try again.");
    console.error("Login failed:", error);
  }
}

async function signupUser(event) {
  event.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const data = await makeFetchRequest("/users/signup", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    sessionStorage.setItem("userEmail", data.email);
    sessionStorage.setItem("userProfilePicture", data.profilePicture);
    sessionStorage.setItem("token", data.token);

    window.location.href = "success.html";
  } catch (error) {
    alert(
      "Error signing up. Ensure email hasn't been used and password is 8 characters long.",
    );
    console.error("Signup failed:", error);
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

// ##############################################################################################################
// Other functions

// function updateUI() {
//   fetchAndDisplayAnalytics();
//   fetchReadyToAssign();
//   fetchUserCategories();
//   fetchAllGoals();
//   fetchAllAccounts();
//   fetchAllTransactions();
// }

// function displayList(elementId, items, formatter) {
//   const listElement = document.getElementById(elementId);
//   if (!listElement) {
//     console.error("List element not found:", elementId);
//     return;
//   }
//   listElement.innerHTML = ""; // Clear existing content

//   if (Array.isArray(items) && items.length > 0) {
//     items.forEach((item) => {
//       const listItem = document.createElement("li");
//       listItem.textContent = formatter(item); // Use formatter function to get display text
//       listElement.appendChild(listItem);
//     });
//   } else {
//     listElement.innerHTML = "<li>Empty list</li>"; // Handle empty or incorrect items array
//   }
// }

// function createListItem(title, value) {
//   const listItem = document.createElement("li");
//   listItem.textContent = `${title}: ${value}`;
//   return listItem;
// }

// async function fetchAndDisplayAnalytics() {
//   try {
//     // Fetch all-time analytics data
//     const allTimeAnalyticsResult = await fetchAllTimeAnalytics();

//     // Access the analytics list in the DOM
//     const analyticsList = document.getElementById("analyticsList");
//     if (!analyticsList) {
//       console.error("Analytics list element not found");
//       return;
//     }
//     analyticsList.innerHTML = ""; // Clear previous contents

//     // Append data to the list
//     if (allTimeAnalyticsResult && allTimeAnalyticsResult.data) {
//       analyticsList.appendChild(
//         createListItem("Net Worth", allTimeAnalyticsResult.data.netWorth),
//       );
//       analyticsList.appendChild(
//         createListItem("Total Income", allTimeAnalyticsResult.data.totalIncome),
//       );
//       analyticsList.appendChild(
//         createListItem(
//           "Total Expenditure",
//           allTimeAnalyticsResult.data.totalExpenditure,
//         ),
//       );
//       analyticsList.appendChild(
//         createListItem("Savings Rate", allTimeAnalyticsResult.data.savingsRate),
//       );
//     } else {
//       console.error("No data received for All-Time Analytics");
//     }
//   } catch (error) {
//     console.error("Error fetching all-time analytics:", error);
//   }
// }

// // Account functions

// async function fetchAllAccounts() {
//   try {
//     const accounts = await makeFetchRequest("/accounts");
//     console.log("All Accounts:", accounts);
//     displayList(
//       "accountsList",
//       accounts,
//       (account) =>
//         `${account._id} / ${account.accountTitle} / ${account.accountType} / ${account.accountStatus} / £${account.accountBalance}`,
//     );
//   } catch (error) {
//     console.error("Error fetching all accounts:", error);
//   }
// }

// async function fetchSingleAccount(accountId) {
//   try {
//     const account = await makeFetchRequest(`/accounts/${accountId}`);
//     console.log("Single Account:", account);
//   } catch (error) {
//     console.error("Error fetching single account:", error);
//   }
// }

// async function addAccount(accountData) {
//   try {
//     const newAccount = await makeFetchRequest("/accounts", {
//       method: "POST",
//       body: JSON.stringify(accountData),
//     });
//     console.log("Account Created:", newAccount);
//     updateUI();
//   } catch (error) {
//     alert("Error creating account:", error.message);
//   }
// }

// async function archiveAccount(accountId) {
//   try {
//     await makeFetchRequest(`/accounts/archive/${accountId}`, {
//       method: "POST", // Ensure the correct HTTP method based on your backend
//     });
//     console.log(`Account ${accountId} archived.`);
//     updateUI();
//   } catch (error) {
//     alert("Error archiving account:", error.message);
//   }
// }

// async function updateAccount(accountId, accountBalance) {
//   try {
//     const body = { accountBalance };
//     const account = await makeFetchRequest(`/accounts/${accountId}`, {
//       method: "PATCH",
//       body: JSON.stringify(body),
//     });
//     console.log("Account updated:", account);
//     updateUI();
//   } catch (error) {
//     console.error("Error updating account:", error);
//     alert("Error updating account: " + error.message);
//   }
// }

// async function moveMoneyBetweenAccounts(fromAccountId, toAccountId, amount) {
//   try {
//     const result = await makeFetchRequest("/accounts/moveMoney", {
//       method: "POST",
//       body: JSON.stringify({ fromAccountId, toAccountId, amount }),
//     });
//     console.log("Money moved successfully:", result);
//     updateUI();
//   } catch (error) {
//     alert("Error moving money between accounts:", error.message);
//   }
// }

// // Analytics functions

// async function fetchOutgoingsPastWeek() {
//   try {
//     const response = await makeFetchRequest("/analytics/outgoingsPastWeek", {
//       method: "GET",
//     });
//     console.log("All-Time Analytics:", response);
//     return response;
//   } catch (error) {
//     console.error("Error calculating all-time analytics:", error);
//     return null;
//   }
// }

// async function fetchSpendByCategoryPastWeek() {
//   try {
//     const response = await makeFetchRequest(
//       "/analytics/spendByCategoryPastWeek",
//       {
//         method: "GET",
//       },
//     );
//     console.log("All-Time Analytics:", response);
//     return response;
//   } catch (error) {
//     console.error("Error calculating all-time analytics:", error);
//     return null;
//   }
// }

// async function fetchAllTimeAnalytics() {
//   try {
//     const response = await makeFetchRequest("/analytics/allTimeAnalytics", {
//       method: "GET",
//     });
//     console.log("All-Time Analytics:", response);
//     return response;
//   } catch (error) {
//     console.error("Error calculating all-time analytics:", error);
//     return null;
//   }
// }

// // Budget functions

// async function fetchReadyToAssign() {
//   try {
//     const response = await makeFetchRequest(`/budget/readyToAssign`, {
//       method: "GET",
//     });
//     console.log("Ready to Assign:", response);
//     return response;
//   } catch (error) {
//     console.error("Error fetching Ready to Assign amount:", error);
//     throw error;
//   }
// }

// async function assignMoneyToCategory(categoryId, amount) {
//   try {
//     const result = await makeFetchRequest(`/budget/assignToCategory`, {
//       method: "POST",
//       body: JSON.stringify({ categoryId, amount }),
//     });
//     console.log("Money assigned:", result);
//     updateUI();
//   } catch (error) {
//     console.error("Error assigning money to category:", error);
//   }
// }

// async function moveMoneyBetweenCategories(
//   fromCategoryId,
//   toCategoryId,
//   amount,
// ) {
//   try {
//     const result = await makeFetchRequest(`/budget/moveBetweenCategories`, {
//       method: "POST",
//       body: JSON.stringify({ fromCategoryId, toCategoryId, amount }),
//     });
//     console.log("Money moved between categories:", result);
//     updateUI();
//   } catch (error) {
//     console.error("Error moving money between categories:", error);
//   }
// }

// async function removeMoneyFromCategory(categoryId, amount) {
//   try {
//     const result = await makeFetchRequest(`/budget/removeFromCategories`, {
//       method: "POST",
//       body: JSON.stringify({ categoryId, amount }),
//     });
//     console.log("Money removed from category:", result);
//     updateUI();
//   } catch (error) {
//     console.error("Error removing money from category:", error);
//   }
// }

// async function moveToReadyToAssign(categoryId, amount) {
//   try {
//     const result = await makeFetchRequest(`/budget/moveToReadyToAssign`, {
//       method: "POST",
//       body: JSON.stringify({ categoryId, amount }),
//     });
//     console.log("Money moved to Ready to Assign:", result);
//     updateUI();
//   } catch (error) {
//     console.error("Error moving money to Ready to Assign:", error);
//   }
// }

// // Category functions

// async function fetchUserCategories() {
//   try {
//     const categories = await makeFetchRequest("/categories");
//     console.log("User Categories:", categories);
//     displayList(
//       "categoriesList",
//       categories,
//       (category) =>
//         `${category._id} / ${category.categoryTitle} / activity: £${category.categoryActivity} / available: £${category.categoryAvailable}`,
//     );
//   } catch (error) {
//     console.error("Error fetching categories:", error);
//   }
// }

// async function addCategory(categoryTitle) {
//   try {
//     const newCategory = await makeFetchRequest("/categories", {
//       method: "POST",
//       body: JSON.stringify({ title: categoryTitle }),
//     });
//     console.log("New Category Added:", newCategory);
//     updateUI();
//   } catch (error) {
//     alert(error.message);
//   }
// }

// async function fetchSingleCategory(categoryId) {
//   try {
//     const category = await makeFetchRequest(`/categories/${categoryId}`);
//     console.log("Fetched Category:", category);
//   } catch (error) {
//     console.error("Error fetching single category:", error);
//   }
// }

// async function updateCategory(categoryId, newTitle) {
//   try {
//     const body = { title: newTitle }; // Correctly structure the body object
//     console.log(body);
//     const updatedCategory = await makeFetchRequest(
//       `/categories/${categoryId}`,
//       {
//         method: "PATCH",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(body),
//       },
//     );

//     console.log("Updated Category:", updatedCategory);
//     updateUI();
//   } catch (error) {
//     console.error("Error updating category:", error);
//     alert("Error updating category: " + error.message);
//   }
// }

// async function deleteCategory(categoryId, newCategoryId) {
//   try {
//     const response = await makeFetchRequest(`/categories/${categoryId}`, {
//       method: "DELETE",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ newCategoryId }),
//     });

//     console.log(
//       `Category ${categoryId} deleted and reassigned to ${newCategoryId}.`,
//     );
//     updateUI();
//     return response;
//   } catch (error) {
//     console.error("Error deleting category:", error);
//     alert("Error deleting category: " + error.message);
//     throw error;
//   }
// }

// // Goal functions

// async function fetchAllGoals() {
//   try {
//     const goals = await makeFetchRequest("/goals", { method: "GET" });
//     console.log("Goals fetched:", goals);
//     displayList(
//       "goalsList",
//       goals,
//       (goal) =>
//         `${goal._id} / ${goal.goalCategory.categoryTitle} / type: ${goal.goalType} / target: £${goal.goalTarget} / status: ${goal.goalStatus} / reset: ${goal.goalResetDay}`,
//     );
//   } catch (error) {
//     console.error("Error fetching goals:", error);
//   }
// }

// async function fetchSingleGoal(goalId) {
//   try {
//     const goal = await makeFetchRequest(`/goals/${goalId}`, { method: "GET" });
//     console.log("Goal fetched:", goal);
//   } catch (error) {
//     console.error("Error fetching goal:", error);
//   }
// }

// async function createGoal(categoryId, goalType, goalTarget, goalResetDay) {
//   try {
//     // Start with the basic body object
//     const body = {
//       categoryId,
//       goalType,
//       goalTarget,
//     };

//     // Add goalResetDay only if it's a 'spending' type and the day is valid
//     if (goalType === "spending" && goalResetDay) {
//       body.goalResetDay = goalResetDay;
//     }

//     const goal = await makeFetchRequest("/goals", {
//       method: "POST",
//       body: JSON.stringify(body),
//     });

//     console.log("Goal created:", goal);
//     updateUI();
//   } catch (error) {
//     console.error("Error creating goal:", error);
//   }
// }

// async function updateGoal(goalId, goalTarget) {
//   try {
//     const body = goalTarget;
//     console.log(body);
//     const goal = await makeFetchRequest(`/goals/${goalId}`, {
//       method: "PATCH",
//       body: JSON.stringify(body),
//     });
//     console.log("Goal updated:", goal);
//     updateUI();
//   } catch (error) {
//     console.error("Error updating goal:", error);
//   }
// }

// async function deleteGoal(goalId) {
//   try {
//     const response = await makeFetchRequest(`/goals/${goalId}`, {
//       method: "DELETE",
//     });
//     if (!response.ok) {
//       throw new Error("Failed to delete goal");
//     }
//     console.log("Goal deleted successfully");
//     updateUI();
//   } catch (error) {
//     console.error("Error deleting goal:", error);
//     alert("Error deleting goal: " + error.message);
//   }
// }

// // Transaction functions

// async function fetchAllTransactions() {
//   try {
//     const transactions = await makeFetchRequest("/transactions");
//     console.log("All Transactions:", transactions);
//     displayList(
//       "transactionsList",
//       transactions,
//       (transaction) =>
//         `${transaction._id} / ${transaction.transactionTitle} / ${transaction.transactionType} / £${transaction.transactionAmount}`,
//     );
//   } catch (error) {
//     console.error("Error fetching all transactions:", error);
//   }
// }

// async function fetchSingleTransaction(transactionId) {
//   try {
//     const transaction = await makeFetchRequest(
//       `/transactions/${transactionId}`,
//     );
//     console.log("Single Transaction:", transaction);
//   } catch (error) {
//     console.error("Error fetching single transaction:", error);
//   }
// }

// async function createTransaction(transactionData) {
//   try {
//     const newTransaction = await makeFetchRequest("/transactions", {
//       method: "POST",
//       body: JSON.stringify(transactionData),
//     });
//     console.log("Transaction Created:", newTransaction);
//     updateUI();
//   } catch (error) {
//     alert("Error creating transaction:", error);
//   }
// }

// async function deleteTransaction(transactionId) {
//   try {
//     await makeFetchRequest(`/transactions/${transactionId}`, {
//       method: "DELETE",
//     });
//     console.log(`Transaction ${transactionId} deleted.`);
//     updateUI();
//   } catch (error) {
//     alert("Error deleting transaction:", error.message);
//   }
// }

// async function updateTransaction(transactionId, updatedData) {
//   try {
//     const updatedTransaction = await makeFetchRequest(
//       `/transactions/${transactionId}`,
//       {
//         method: "PATCH",
//         body: JSON.stringify(updatedData),
//       },
//     );
//     console.log("Transaction Updated:", updatedTransaction);
//     updateUI(); // Update UI to reflect changes
//   } catch (error) {
//     alert("Error updating transaction:", error.message);
//   }
// }
