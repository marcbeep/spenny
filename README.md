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
- `name`: Name of the account.
- `type`: Type of the account (e.g., checking, savings, credit card).
- `balance`: Current balance of the account.

**budgetModel:**

- `user`: Represents the user associated with the budget.
- `totalAvailable`: Total amount available for budgeting.
- `totalAssigned`: Total amount already assigned to categories.
- `readyToAssign`: Amount available for further assignment to categories.

**categoryModel:**

- `user`: Represents the user associated with the category.
- `name`: Name of the category (e.g., groceries, utilities).
- `budgetedAmount`: Amount budgeted for the category.
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

1. **categoryController.js**: To manage CRUD operations for categories.

   - `addCategory`, `getCategories`, `updateCategory`, `deleteCategory`.

2. **budgetController.js** (new): To handle assigning money to categories and calculating overspent amounts.

   - `assignToCategory` (move money to a category), `updateAssignment` (change the assigned money).

3. **transactionController.js**: Modify to handle transactions that are assigned to categories.
   - Ensure transactions update the `activity` and `available` fields in the related `CategoryModel`.

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
