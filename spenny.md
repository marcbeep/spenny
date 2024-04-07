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
- Categories can have can have goals that require money to be assigned to them:
  - A user might have a specified "target" to assign with a required "date" (weekly or monthly). For example, a user might want to assign £50 to "Groceries" by Sunday every week.
    - If a category is not funded on time or the target is not met, it is known as "underfunded".
    - If a category is funded ahead of time and the target is met, it is known as "funded".
    - This status will reset at the next required date.
  - A user might have a specified "target" to achieve, but no known date. For example, a user might want to save up for a pair of shoes that cost £100.
  - A user might not have a specified "target" to achieve, and no known date, but might not want the money assigned to a category to fall below a certain amount. For example, the "Emergency Fund" category must always have £1000 assigned.

### Transactions

- Transactions can be added, deleted and updated.
- Transactions can be either a debit or credit
- When a user adds a transaction (debit), it will decrease the amount of money from the account it is spent from and decrease the assigned amount of money from the category it was spent from.
- When a user adds a transaction (credit), it will increase the amount of money from the account it was credited to, and increase the "Ready to Assign" amount (i.e. a user will have to assign it to a category later).
- When a user deletes a transaction, it will automatically affect the amount of funds in the account and category appropriately (depending on if it was a debit or credit).

### Analytics

- Networth: The total amount across a users spending and tracking accounts.
  - Networth are automatically calculated based on account totals.
  - Networth is tracked on a daily basis (at midnight every day).
  - Users will be able to see a statistic that shows the percentage change of their networth from the previous week.
  - Users will be able to see a line chart that tracks their "All time" networth (this will be dynamic based on how long the account has existed).
- Spending: The total amount "spent" across all categories.
  - Spending totals are automatically calculated based on transactions and categories.
  - Spending is tracked on a daily basis (at midnight every day).
  - Users will be able to see a statistic that shows the percentage change in the total spending from the previous week.
  - Users will be able to see a pie chart that tracks their spending by category for the last week.

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
