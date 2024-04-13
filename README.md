# Spenny

Spenny is a zero-based budget tool for desktop & mobile inspired by the popular YNAB software and built using the MERN stack.

## Specifications

### Users

- Users can sign up & login to access their account with a username and password.
- Upon sign up:
  - Spenny will create some generic categories for the user with totals initialised to zero.
  - Spenny will create a generic spending account with the total initialised to zero.
  - Spenny will create a random profile picture for a user using an online service and referenced as a link.

### Accounts

- Accounts can be added and balances updated.
- Accounts cannot be deleted. Instead they can only be archived to maintain data integrity.
- Accounts can be either a spending account (e.g. Barclays or Lloyds) or tracking (e.g. Vanguard Index Fund Portfolio).
- Both spending accounts and tracking accounts contribute to a user's networth.
- A user can only assign transactions to spending accounts.
- A user can only assign money from spending accounts to categories.
- A user can only have money from spending accounts contribute toward "Ready to Assign".
- Users can move money:
  - Between spending accounts and tracking accounts.
  - Between spending and spending accounts.
  - Between tracking and tracking accounts.

### Categories

- Categories can be added, deleted and "Assigned values" updated.
- When a category is deleted, all the Assigned transactions must be firstly reassigned to another category.
- Categories can have can have goals (only one goal per category) that require money to be assigned to them (we check this via the available funds).
- Each category must have only one goalType. These can be:
  - `spending`: A user will have a specified "target" (goalTarget) to assign by a required day of the week (goalResetDay). For example, a user might want to assign £50 to "Groceries" by Sunday every week.
    - If a category is not funded by the day OR the goalTarget is not met, it is known as "underfunded".
    - If a category is funded ahead of the day and the goalTarget is met, it is known as "funded".
    - This status will reset every week on the specified day.
  - `saving`: A user might have a specified goalTarget to achieve, but no goalResetDay. For example, a user might want to save up for a pair of shoes that cost £100.
    - If a category is below the goalTarget, it is "underfunded".
    - If a category is at or above the goalTarget, it is "funded".

### Transactions

- Transactions can be added, deleted and updated (except for archived accounts for which none of these actions can be performed).
- Transactions can be either a debit or credit
- When a user adds a transaction (debit), it will decrease the amount of money from the account it is spent from and decrease the assigned amount of money from the category it was spent from.
- When a user adds a transaction (credit), it will increase the amount of money from the account it was credited to, and increase the "Ready to Assign" amount (i.e. a user will have to assign it to a category later).
- When a user deletes a transaction, it will automatically affect the amount of funds in the account and category appropriately (depending on if it was a debit or credit).

### Analytics

#### 1. Total Spend for the Week

- **Description**: Calculate the total amount spent over the current week and compare it with the previous week to show trends.
- **Representation**: A card display showing total spend and percentage change from the previous week with up/down arrows to indicate direction.
- **Frequency**: Calculate weekly at 0:00 every Monday.
- **MongoDB Storage**:

```json
{
  "weekOfYear": 15,
  "year": 2024,
  "totalSpend": 450.75,
  "previousWeekSpend": 425.5,
  "percentageChange": 5.93
}
```

#### 2. Spending by Category

- **Description**: Show how much money has been spent in each category for the last week.
- **Representation**: Pie chart or bar graph to display the proportion of spending by category.
- **Frequency**: Calculate weekly at 0:00 every Monday.
- **MongoDB Storage**:

```json
{
  "weekOfYear": 15,
  "year": 2024,
  "categories": [
    { "name": "Groceries", "amount": 150.25 },
    { "name": "Utilities", "amount": 75.0 },
    { "name": "Entertainment", "amount": 50.5 }
  ]
}
```

#### 3. Net Worth Tracking

- **Description**: Track the total net worth over time, showing increases or decreases.
- **Representation**: Line chart to display net worth over weeks/months/years.
- **Frequency**: Calculate weekly at 0:00 every Monday.
- **MongoDB Storage**:

```json
{
  "date": "2024-04-07",
  "netWorth": 15000,
  "previousNetWorth": 14750,
  "change": 250
}
```

#### 4. Income vs. Expenses (Now Weekly)

- **Description**: Compare total income to total expenses for the current week. This helps users understand their financial health on a more immediate basis.
- **Representation**: Bar chart with two bars for the week, one for income and one for expenses, color-coded for clarity.
- **Frequency**: Calculate weekly at 0:00 every Monday.
- **MongoDB Storage**:

```json
{
  "weekOfYear": 15,
  "year": 2024,
  "income": 3000,
  "expenses": 2500
}
```

#### 5. Savings Rate (Weekly)

- **Description**: The percentage of income saved during the past week. This is calculated as the percentage of weekly income left after weekly expenses.
- **Representation**: A card display showing the rate and percentage change from the previous week with up/down arrows to indicate direction.
- **Frequency**: Calculate weekly at 0:00 every Monday.
- **MongoDB Storage**:

```json
{
  "weekOfYear": 15,
  "year": 2024,
  "income": 3000,
  "expenses": 2500,
  "savingsRate": 16.67
}
```

---

## Model Schemas

Note:

- All will have auto created by and updated timestamps from MongoDB.
- All numbers must be to two decimal places always.
- All strings must be to lowercase.

**userModel:**

- `userEmail`: (String) - Email address of the user (unique identifier).
- `userPassword`: (String) - Encrypted password for user authentication.
- `userProfilePicture`: (String) - Link to randomly generated profile image.

**accountModel:**

- `user`: (ObjectId) - Represents the user associated with the account.
- `accountTitle`: (String) - Title of the account.
- `accountType`: (String) - Type of the account (either `spending` or `tracking`).
- `accountBalance`: (Number) - Current balance of the account.
- `accountStatus`: (String) - Status of the account (either `active` or `archived`).

**categoryModel:**

- `user`: (ObjectId) - Represents the user associated with the category.
- `categoryTitle`: (String) - Title of the category (e.g., groceries, utilities).
- `categoryAssigned`: (Number) - Total amount assigned to the category.
- `categoryAvailable`: (Number) - Amount currently available in the category for spending.
- `categoryActivity`: (Number) - Total amount of transactions associated with the category.
- `categoryGoal`: (ObjectId) - Reference to the associated goal.

**goalModel:**

- `user`: (ObjectId) - Represents the user associated with the goal.
- `goalCategory`: (ObjectId) - Represents the category associated with the goal.
- `goalType`: (String) - Type of goal (either `saving` or `spending`).
- `goalTarget`: (Number) - The amount needed to achieve the goal.
- `goalCurrent`: (Number) - The amount currently assigned to the goal.
- `goalDeadline`: (Date) - The specified date needed to achieve the goal.
- `goalStatus`: (String) - Either underfunded or funded.

**budgetModel:**

- `user`: (ObjectId) - Represents the user associated with the budget.
- `budgetTotalAvailable`: (Number) - Total amount available for budgeting (only from spending accounts).
- `budgetTotalAssigned`: (Number) - Total amount already assigned to categories.
- `budgetReadyToAssign`: (Number) - Amount available for assignment to categories (not yet assigned).

**transactionModel:**

- `user`: (ObjectId) - Represents the user associated with the transaction.
- `transactionCategory`: (ObjectId) - Reference to the category associated with the transaction.
- `transactionAccount`: (ObjectId) - Reference to the account associated with the transaction.
- `transactionType`: (String) - Either `debit` or `credit`.
- `transactionTitle`: (String) - Title or description of the transaction.
- `transactionAmount`: (Number) - Amount of the transaction.

**analyticsModel:**

- `user`: (ObjectId) - Represents the user associated with this analytic record.
- `analyticsType`: (String) - Type of analytic, such as 'totalSpend', 'spendingByCategory', 'netWorth', 'incomeVsExpenses', or 'savingsRate'.
- `period`: (String) - Represents the time period of the data ('weekly' for all except 'incomeVsExpenses' and 'savingsRate' which are calculated weekly but can also be aggregated monthly).
- `periodStart`: (Date) - The start date for the period covered by this analytic.
- `periodEnd`: (Date) - The end date for the period covered by this analytic.
- `analyticsData`: (Mixed) - A flexible data structure to store different types of analytics data based on analyticsType.
- `analyticsLastCalculated`: (Date) - The last date when the analytic was updated.

---

## Controllers

**accountController:**

1. `addAccount`: Creates a new account for the logged-in user. If the account type is spending, updates the user's budget accordingly.
2. `getAccounts`: Retrieves all accounts associated with the logged-in user.
3. `getAccount`: Retrieves an account by its ID.
4. `archiveAccount`: Archives an account by its ID and updates the budget accordingly.
5. `updateAccount`: Updates an account by its ID. If the account type is spending and the balance changes, adjusts the budget accordingly.
6. `moveMoneyBetweenAccounts`: Moves money between two accounts. Updates account balances and adjusts the user's budget if necessary.

The controller file handles account-related operations such as adding, retrieving, updating, and deleting accounts. Additionally, it includes functionality to move money between accounts while ensuring proper updates to account balances and user budgets.

**analyticsController:**

1. `calculateTotalSpend`: Calculates the total amount spent by the user in the current week. Updates or creates an analytics record for the total spend.
2. `calculateSpendingByCategory`: Calculates the total spending by category for the user in the current week. Updates or creates an analytics record for spending by category.
3. `calculateNetWorth`: Calculates the net worth of the user by summing up the balances of all accounts. Updates or creates an analytics record for net worth.
4. `calculateIncomeVsExpenses`: Calculates the total income and expenses of the user in the current week. Updates or creates an analytics record for income versus expenses.
5. `calculateSavingsRate`: Calculates the savings rate of the user in the current week based on income and expenses. Updates or creates an analytics record for savings rate.
6. `calculateAllTimeAnalytics`: Calculates all-time analytics for the user, including net worth, total income, total expenditure, and savings rate. Updates or creates an analytics record for all-time analytics.

The controller file handles various analytics-related operations such as calculating total spend, spending by category, net worth, income versus expenses, savings rate, and all-time analytics. It interacts with the `Transaction`, `Analytics`, and `Account` models to retrieve necessary data and update analytics records accordingly.

**budgetController:**

1. `assignMoneyToCategory`: Assigns a specified amount of money to a category. Updates the category's assigned and available amounts. Checks and updates the associated goal's status.
2. `moveMoneyBetweenCategories`: Moves a specified amount of money from one category to another. Updates the available amounts for both categories. Checks and updates the associated goals' statuses for both categories.
3. `removeMoneyFromCategory`: Removes a specified amount of money from a category. Updates the category's available amount and adjusts the user's budget accordingly. Checks and updates the associated goal's status.
4. `readyToAssign`: Retrieves the amount of money ready to be assigned from the user's budget.
5. `moveToReadyToAssign`: Move money from category back to ready to assign.

The controller file handles budget-related operations such as assigning money to categories, moving money between categories, removing money from categories, and retrieving the amount of money ready to be assigned. It interacts with the `Budget` and `Category` models and utilizes utility functions like `checkAndUpdateGoalStatus` for goal-related operations.

**categoryController:**

1. `addCategory`: Creates a new category for the logged-in user with the specified title.
2. `getCategories`: Retrieves all categories associated with the logged-in user, sorted by category title.
3. `getSingleCategory`: Retrieves a single category by its ID.
4. `deleteCategory`: Deletes a category by its ID and reassigns transactions to a new category if specified. Also deletes associated goals for the deleted category and checks and updates the goal status for the new category.
5. `updateCategory`: Updates the title of a category by its ID.

The controller file handles category-related operations such as adding, retrieving, updating, and deleting categories. It interacts with the `Category`, `Transaction`, and `Goal` models for category-related data manipulation. Additionally, it utilizes the `checkAndUpdateGoalStatus` utility function for updating goal statuses.

**goalController:**

1. `getAllGoals`: Retrieves all goals associated with the logged-in user, including details of the associated category.
2. `getSingleGoal`: Retrieves a single goal by its ID, including details of the associated category.
3. `createGoal`: Creates a new goal for the specified category. Updates the category with the new goal's ID and checks and updates the goal status.
4. `updateGoal`: Updates an existing goal with the specified ID. Updates the goal type, target, and reset day as required. Checks and updates the goal status after updating.
5. `deleteGoal`: Deletes a goal by its ID. Before removal, unsets the categoryGoal field in the associated category.

The controller file handles goal-related operations such as creating, retrieving, updating, and deleting goals. It interacts with the `Goal` and `Category` models for goal-related data manipulation and utilizes the `checkAndUpdateGoalStatus` utility function for updating goal statuses.

**transactionController:**

1. `getAllTransactions`: Retrieves all transactions associated with the logged-in user, sorted by creation date.
2. `getSingleTransaction`: Retrieves a single transaction by its ID.
3. `createTransaction`: Creates a new transaction with the provided details. Updates balances for the associated category and account. Checks and updates goal status if applicable.
4. `deleteSingleTransaction`: Deletes a single transaction by its ID. Reverts the balance changes made by the transaction and checks and updates goal status if applicable.
5. `updateSingleTransaction`: Updates a single transaction with the provided details. Reverts the balance changes made by the original transaction, updates the balances with the new details, and checks and updates goal status if applicable.
6. `ai`: Utilizes OpenAI's GPT-3.5 model to analyze OCR text from a receipt and generate transaction details in JSON format. Validates category and account IDs, creates a new transaction based on the generated details, and returns the result.

This controller file handles transaction-related operations such as creating, retrieving, updating, and deleting transactions. It interacts with the `Transaction`, `Category`, `Account`, and `Budget` models for data manipulation and utilizes the `checkAndUpdateGoalStatus` utility function for updating goal statuses. Additionally, it utilizes the OpenAI API for AI-powered transaction detail generation.

**userController:**

1. `loginUser`: Handles user login by verifying the provided email and password against the stored credentials. If authentication is successful, generates a JWT token for the user session.
2. `signupUser`: Manages user signup by creating a new user account with the provided email, password, and a randomly generated profile picture URL. Additionally, initializes user data including default account, categories, budget, and analytics data. Returns a JWT token upon successful signup.

This controller file interacts with the `User`, `Account`, `Category`, `Budget`, and `Analytics` models for user-related data manipulation and initialization. It utilizes JWT for user authentication and authorization and the `moment` library for date/time manipulation. Additionally, it utilizes helper functions such as `createToken` for JWT token generation and `initializeAnalyticsData` and `initializeUserData` for initializing user-specific data upon signup.

---

## Endpoints

### Accounts

- GET /accounts
- GET /accounts/:id
- PATCH /accounts/:id
- POST /accounts
- POST /accounts/moveMoney
- POST /accounts/archive/:id

### Analytics

- GET /analytics/totalSpend
- GET /analytics/spendByCategory
- GET /analytics/networth
- GET /analytics/incomeVsExpenses
- GET /analytics/savingsRate
- GET /analytics/alltime

### Budget

- GET /budget/readyToAssign
- POST /budget/assignToCategory
- POST /budget/moveBetweenCategories
- POST /budget/removeFromCategories
- POST /budet/moveToReadyToAssign

### Category

- GET /categories
- GET /categories/:id
- PATCH /categories/:id
- POST /categories
- DELETE /categories/:id

### Goal

- GET /goals
- GET /goals/:id
- PATCH /goals/:id
- POST /goals
- DELETE /goals/:id

### Transaction

- GET /transactions
- GET /transactions/:id
- POST /transactions
- POST /transactions/ai
- PATCH /transactions/:id
- DELETE /transactions/:id

### User

- POST /users/login
- POST /users/signup

---

## Status Codes

1. **200 OK**: Used to indicate that the request has succeeded. For example, in `getAllTransactions`, `getSingleTransaction`, `getAllGoals`, and other endpoints where data is successfully fetched or operations are performed without errors.

2. **201 Created**: Indicates that the request has been fulfilled and has resulted in one or more new resources being created. For example, in `createTransaction` and `signupUser` endpoints where new transactions or user accounts are created.

3. **204 No Content**: Used to indicate that the server successfully processed the request and is not returning any content. For example, in the `deleteCategory` endpoint where the category is successfully deleted without returning any content.

4. **400 Bad Request**: Indicates that the server cannot or will not process the request due to a client error, such as invalid input or missing parameters. For example, in `createTransaction`, `updateSingleTransaction`, and `signupUser` endpoints when there are validation errors or missing required fields.

5. **401 Unauthorized**: Indicates that the client must authenticate itself to get the requested response. For example, in `loginUser` endpoint when the provided credentials are invalid.

6. **404 Not Found**: Indicates that the requested resource could not be found at the specified URL. For example, in `handleNotFound` and `handleNoTransactionFound` helper functions, and various endpoints when resources like categories, transactions, or goals are not found.

7. **500 Internal Server Error**: Indicates that the server encountered an unexpected condition that prevented it from fulfilling the request. For example, in catch blocks of various endpoints when an unexpected error occurs during data processing or database operations.

---

Terms

Category Activity:

This refers to the total amount of spending and transactions that have occurred in a specific budget category within a given period.
It includes all the expenses logged against that category.
If you spend money or move money from one category to another, these transactions will be reflected in the category activity.
It helps you track how much of your allocated funds have been used up during the period.

Category Available:

This indicates the amount of money currently available in a budget category to spend or save, after accounting for all activities (expenses and transfers). This figure is critical as it shows you at a glance how much more you can afford to spend in that category without exceeding your budget.
If the category available is negative, it indicates that you've overspent in that category.
