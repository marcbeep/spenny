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

- Accounts can be added, deleted and balances updated.
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

- Transactions can be added, deleted and updated.
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
3. `deleteAccount`: Deletes an account by its ID and updates the budget accordingly if the deleted account is of spending type.
4. `updateAccount`: Updates an account by its ID. If the account type is spending and the balance changes, adjusts the budget accordingly.
5. `moveMoneyBetweenAccounts`: Moves money between two accounts. Updates account balances and adjusts the user's budget if necessary.

**budgetController:**

1. `assignMoneyToCategory`: Assigns a specified amount of money to a category. Updates the category's assigned and available amounts, then checks and updates associated goal status.
2. `moveMoneyBetweenCategories`: Moves a specified amount of money from one category to another. Updates available amounts for both categories and checks/updates associated goal status.
3. `removeMoneyFromCategory`: Removes a specified amount of money from a category. Updates the category's available amount, updates the budget based on the action, and checks/updates associated goal status.
4. `readyToAssign`: Retrieves the amount of money ready to be assigned from the budget associated with the logged-in user.

**categoryController:**

1. `addCategory`: Creates a new category for the logged-in user with the specified title.
2. `getCategories`: Retrieves all categories associated with the logged-in user, sorted alphabetically by title.
3. `getSingleCategory`: Retrieves a single category by its ID.
4. `deleteCategory`: Deletes a category by its ID. Reassigns transactions to a new category if specified, deletes associated goals, and checks/updates goal status for the new category if applicable.
5. `updateCategory`: Updates the title of a category by its ID. Checks and updates goal status related to the category after the update.

**goalController:**

1. `getAllGoals`: Retrieves all goals associated with the logged-in user, including the details of the category for each goal.
2. `getSingleGoal`: Retrieves a single goal by its ID, including the details of the associated category.
3. `createGoal`: Creates a new goal for a specified category. Updates the category with the new goal's ID and checks/updates goal status.
4. `updateGoal`: Updates an existing goal by its ID. Updates goal type, target, and reset day if applicable. Checks and updates goal status after the update.
5. `deleteGoal`: Deletes a goal by its ID. Unsets the `categoryGoal` field in the associated category before removing the goal.

**transactionController:**

1. `getAllTransactions`: Retrieves all transactions associated with the logged-in user, sorted by creation date.
2. `getSingleTransaction`: Retrieves a single transaction by its ID.
3. `createTransaction`: Creates a new transaction for the user. Updates category and account balances accordingly. If no category is specified, adjusts the "Ready to Assign" balance in the budget.
4. `deleteSingleTransaction`: Deletes a transaction by its ID. Reverts the effects of the transaction on category and account balances. Also updates goal status if applicable.
5. `updateSingleTransaction`: Updates an existing transaction by its ID. Adjusts category and account balances based on the changes. Also updates goal status if applicable.
6. `ai`: Utilizes OpenAI's GPT-3.5 model to analyze OCR text extracted from a receipt and fill out transaction details in JSON format. Validates the provided category and account IDs and creates a new transaction accordingly.

**userController:**

1. `loginUser`: Handles user login by validating the email and password. If successful, generates a JWT token and returns it along with the user's email.
2. `signupUser`: Manages user signup by creating a new user account with the provided email, password, and a randomly generated profile picture URL. Additionally, initializes essential user data such as categories, accounts, and budget. Upon successful signup, generates a JWT token and returns it along with the user's email and profile picture URL.

Utility functions:

1. `createToken`: Generates a JWT token using the user's ID and a secret key.
2. `initializeUserData`: Initializes essential user data such as categories, accounts, and budget upon user signup. It creates generic categories, a generic spending account, and initializes the budget for the new user. Returns `{ success: true }` upon successful initialization or `{ error: errorMessage }` if initialization fails.
