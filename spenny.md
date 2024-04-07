# Spennny

## Description

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
  - Users will be able to see a statistic that shows the percentage change of their networth from the previous week.
  - Users will be able to see a line chart that tracks their "All time" networth (this will be dynamic based on how long the account has existed).
- Spending: The total amount "spent" across all categories.
  - Users will be able to see a statistic that shows the percentage change in the total spending from the previous week.
  - Users will be able to see a bar chart that tracks their total spending for the past month.
  - Users will be able to see a pie chart that tracks their spending by category for the last week.
