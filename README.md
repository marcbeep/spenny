**To Do**

- [x] Display accounts
- [x] Add accounts (frontend)
- [x] Add categories (backend)
- [x] Display categories
- [x] Add categories (frontend)
- [x] Assign to categories - transactions
- [ ] Showcase "ready to assign"
- [ ] Create modal when a user clicks "ready to assign" to move money to different categories.
- [ ] When user clicks category, they can move money around.
- [ ] Dynamically update category amounts as money is moved around.
- [ ] Transactions should be linked to bank accounts and dynamically affect both accounts and categories.
- [ ] Users can "reconcile" bank accounts.
- [ ] When a user deletes a category, users must first reassign all transactions to another category.

**Notes**

- App is meant to function like YNAB.
- Users can add bank accounts.
- Users can define own budget categories.
- Users can log transactions (associated with categories & accounts).
- The total of the user's bank accounts are "Ready to assign" to categories.
- Users must assign all money to categories such that the "Ready to assign" is 0.
- Users can move money allocation from category to category.
- Users may overspend from categories (negative category balance).

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

**accountcontroller:**

- `addAccount`: Creates a new account associated with the logged-in user.
- `getAccounts`: Retrieves all accounts associated with the logged-in user.
- `deleteAccount`: Deletes the specified account belonging to the logged-in user.
- `updateAccount`: Updates the details of the specified account belonging to the logged-in user.
- `getTotalBalance`: Calculates and returns the total balance across all accounts associated with the logged-in user.

**budgetcontroller:**

- `assignMoneyToCategory`: Assigns a specified amount of money to a category, ensuring it does not exceed the total available funds.
- `moveMoneyBetweenCategories`: Moves a specified amount of money from one category to another, ensuring sufficient funds in the source category.
- `removeMoneyFromCategory`: Removes a specified amount of money from a category, ensuring sufficient available funds.
- `getAvailableFunds`: Calculates and returns the total available funds for assignment to categories.

**categorycontroller:**

- `addCategory`: Creates a new category associated with the logged-in user.
- `getCategories`: Retrieves all categories associated with the logged-in user.
- `getSingleCategory`: Retrieves the details of a single category specified by its ID.
- `deleteCategory`: Deletes the specified category belonging to the logged-in user.
- `updateCategory`: Updates the details of the specified category belonging to the logged-in user.

**transactioncontroller:**

- `getAllTransactions`: Retrieves all transactions associated with the logged-in user.
- `getSingleTransaction`: Retrieves the details of a single transaction specified by its ID.
- `createTransaction`: Creates a new transaction associated with the logged-in user and updates the available funds in the associated category.
- `deleteSingleTransaction`: Deletes the specified transaction belonging to the logged-in user and updates the available funds in the associated category.
- `updateSingleTransaction`: Updates the details of the specified transaction belonging to the logged-in user and adjusts the available funds in the associated categories.

**usercontroller:**

- `loginUser`: Authenticates the user with the provided email and password, returning a JWT token upon successful login.
- `signupUser`: Registers a new user with the provided email and password, returning a JWT token upon successful signup and creates generic categories for the user.

### Routes

1. **category.js** (new file in routes):

   - POST `/categories` for adding a new category.
   - GET `/categories` for listing all categories for a user.
   - PUT `/categories/:id` for updating a category.
   - DELETE `/categories/:id` for deleting a category.

2. **budget.js** (new file in routes):

   - POST `/assign` for assigning money to a category.
   - PUT `/updateAssignment/:categoryId` for updating the assigned amount.

3. **transaction.js**:
   - Modify existing routes if necessary to support assigning transactions to categories and affecting the budget.

### Implementing Budget Logic

- **Assigning to Categories**: When money is assigned to a category, update the `budgetedAmount` and `available` fields in `CategoryModel`.
- **Transactions**: When a transaction is added, decrease the `available` amount in the associated category. If a transaction is deleted or modified, adjust accordingly.
- **Overspending**: If the `available` amount in a category goes negative, it indicates overspending. This should be visually indicated in your frontend.
- **Moving Money Between Categories**: Implement a function that decreases the `available` amount in one category and increases it in another.

### HTTP Status codes

- `404` for not found resources (e.g., transactions, categories).
- `400` for bad requests where the request cannot be processed due to client-side errors (e.g., validation errors).
- `201` should be used for creating resources.
- `204` for successful requests that don't return any content (e.g., delete operations).
