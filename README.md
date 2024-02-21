<img src="frontend/public/icon.png" alt="icon" width="100"/>

# Spenny

Spenny is a powerful web application designed to help users manage their finances effectively, much like the popular You Need A Budget (YNAB) platform. With Spenny, users gain control over their spending, budgeting, and financial goals with intuitive tools and features.

### Key Features:

1. **Bank Account Management:**

   - Users can seamlessly add and manage their bank accounts within Spenny.
   - `PLANNED`: Real-time balance updates ensure accurate tracking of available funds.

2. **Customizable Budget Categories:**

   - Spenny allows users to create and customize their own budget categories based on their unique spending habits and financial priorities.
   - Users have the flexibility to define categories such as groceries, utilities, entertainment, savings goals, and more.

3. **Transaction Logging:**

   - Users can log transactions and assign them to specific budget categories and bank accounts.
   - Each transaction is associated with relevant category and account information for comprehensive financial tracking.

4. **Ready-to-Assign Funds:**

   - Spenny calculates the total balance across all user bank accounts, presenting it as "Ready to assign" funds.
   - Users must allocate all available funds to budget categories, ensuring proactive budgeting and financial planning.

5. **Dynamic Fund Allocation:**

   - Users can easily move funds between budget categories to adjust their spending priorities.
   - Dynamic allocation features enable users to adapt their budgets in real-time based on changing financial needs.

6. **Overspending Management:**

   - Spenny provides insights into overspending by allowing users to monitor negative balances within budget categories.
   - Proactive alerts and notifications help users stay informed and make informed financial decisions.

### Schemas

**accountModel:**

- `user`: Represents the user associated with the account.
- `title`: Title of the account.
- `type`: Type of the account (e.g., checking, savings, credit card).
- `balance`: Current balance of the account.

**budgetModel:**

- `user`: Represents the user associated with the budget.
- `totalAvailable`: Total amount available for budgeting.
- `totalAssigned`: Total amount already assigned to categories.
- `readyToAssign`: Amount available for further assignment to categories.

**categoryModel:**

- `user`: Represents the user associated with the category.
- `title`: Title of the category (e.g., groceries, utilities).
- `assignedAmount`: Amount budgeted for the category.
- `available`: Amount currently available in the category for spending.
- `activity`: Total amount of transactions associated with the category.

**transactionModel:**

- `user`: Represents the user associated with the transaction.
- `title`: Title or description of the transaction.
- `amount`: Amount of the transaction.
- `category`: Reference to the category associated with the transaction.
- `account`: Reference to the account associated with the transaction.

**userModel:**

- `email`: Email address of the user (unique identifier).
- `password`: Encrypted password for user authentication.

### Controllers

**accountController:**

1. `addAccount`: Creates a new account for the logged-in user.
2. `getAccounts`: Retrieves all accounts associated with the logged-in user.
3. `deleteAccount`: Deletes an account by its ID and updates the budget accordingly.
4. `updateAccount`: Updates an account by its ID and adjusts the budget accordingly.
5. `getTotalBalance`: Calculates and returns the total balance across all accounts of the logged-in user.

**budgetController:**

1. `assignMoneyToCategory`: Assigns a specified amount of money to a category, ensuring it does not exceed the total available funds.
2. `moveMoneyBetweenCategories`: Moves a specified amount of money from one category to another, ensuring sufficient funds in the source category.
3. `removeMoneyFromCategory`: Removes a specified amount of money from a category, ensuring sufficient available funds.
4. `readyToAssign`: Calculates and returns the total available funds for assignment to categories.

**categoryController:**

1. `addCategory`: Creates a new category for the logged-in user.
2. `getCategories`: Retrieves all categories associated with the logged-in user.
3. `getSingleCategory`: Retrieves a single category by its ID.
4. `deleteCategory`: Deletes a category by its ID.
5. `updateCategory`: Updates the title of a category by its ID.

**transactionController:**

1. `getAllTransactions`: Retrieves all transactions for the logged-in user, sorted by creation date.
2. `getSingleTransaction`: Retrieves a single transaction by its ID.
3. `createTransaction`: Creates a new transaction associated with the logged-in user and updates the available funds in the associated category.
4. `deleteSingleTransaction`: Deletes a single transaction belonging to the logged-in user and updates the available funds in the associated category.
5. `updateSingleTransaction`: Updates the details of a single transaction belonging to the logged-in user and adjusts the available funds in the associated categories.

**userController:**

1. `loginUser`: Handles user login requests.
2. `signupUser`: Handles user signup requests.

These functions represent the endpoints and logic for managing accounts, budgets, categories, transactions, and user authentication within your application.

### Routes

**account.js:**

- `POST` /accounts
- `GET` /accounts
- `DELETE` /accounts/:id
- `PATCH` /accounts/:id
- `GET` /accounts/totalBalance

**budget.js:**

- `POST` /budget/move
- `POST` /budget/assign
- `POST` /budget/remove
- `GET` /budget/readyToAssign
- `POST` /budget/addFunds
- `POST` /budget/removeFunds

**category.js:**

- `POST` /categories
- `GET` /categories
- `GET` /categories/:id
- `PATCH` /categories/:id
- `DELETE` /categories/:id

**transaction.js:**

- `GET` /transactions
- `GET` /transactions/:id
- `POST` /transactions
- `DELETE` /transactions/:id
- `PATCH` /transactions/:id

**user.js:**

- `POST` /users/login
- `POST` /users/signup

### HTTP Status codes

- `404` for not found resources (e.g., transactions, categories).
- `400` for bad requests where the request cannot be processed due to client-side errors (e.g., validation errors).
- `201` should be used for creating resources.
- `204` for successful requests that don't return any content (e.g., delete operations).

---

**Roadmap**

- [ ] Dashboard.
- [ ] Users can "reconcile" bank accounts.
- [ ] When a user deletes a category, users must first reassign all transactions to another category.
- [ ] Make it time sensitive (goals).
