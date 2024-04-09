# Spennny

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

1. Total Spend for the Week

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

2. Spending by Category

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

3. Net Worth Tracking

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

4. Income vs. Expenses (Monthly)

- **Description**: Compare total income to total expenses for a given time period, such as monthly, to help users understand their financial health.
- **Representation**: Bar chart with two bars for each period, one for income and one for expenses, color-coded for clarity.
- **Frequency**: Calculate monthly.
- **MongoDB Storage**:

```json
{
  "month": 4,
  "year": 2024,
  "income": 3000,
  "expenses": 2500
}
```

5. Savings Rate (Monthly)

- **Description**: The percentage of income saved during a specific time frame. This is calculated as the percentage of income left after expenses.
- **Representation**: A gauge chart or progress bar to show the savings rate against a goal or average.
- **Frequency**: Calculate monthly.
- **MongoDB Storage**:

```json
{
  "month": 4,
  "year": 2024,
  "income": 3000,
  "expenses": 2500,
  "savingsRate": 16.67
}
```

This approach ensures that users have timely, actionable information on a weekly basis for most stats, while still providing a monthly overview of their income vs. expenses and savings rate. Such a schema offers a comprehensive yet clear snapshot of financial health and habits, suitable for tracking and improvement over time.

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

- `user`: (ObjectId) - Represents the user associated.
- `analyticsType`: (String) - Type of analytic (e.g. either `networth` or `spending`).
- `analyticsData`: (Array) - Contains the `date` (Date) and `value` (Number) for each entry.
- `analyticsLastCalculated`: (Date) - Contains the date for when the last calculated value was stored.
