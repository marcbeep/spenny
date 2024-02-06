**To Do**

- [x] Display accounts
- [x] Add accounts (frontend)
- [ ] Add categories (backend)

To implement the features you've described, resembling the functionality of budgeting applications like YNAB (You Need A Budget), you'll need a well-structured backend that supports various operations such as managing accounts, transactions, and categories, as well as the logic for assigning money to categories and tracking overspending. Using the MERN stack for this purpose is a good choice, as it provides a full JavaScript stack that is well-suited for building dynamic and interactive web applications.

Here's a suggestion for designing your backend to accommodate these features, including the necessary models, controllers, and routes:

### Models

You'll need to create or modify your models to support the new features:

1. **CategoryModel**: To manage budget categories.

   - Fields: `name`, `user` (reference to `UserModel`), `budgetedAmount` (money allocated), `activity` (money spent), `available` (money left to spend).

2. **TransactionModel**: Modify if necessary to include a reference to `CategoryModel`.

   - Add a field: `category` (reference to `CategoryModel`).

3. **AccountModel** and **UserModel** may remain as is, assuming they already support the basic required fields.

### Controllers

You will need to add or modify controllers to handle new logic:

1. **categoryController.js**: To manage CRUD operations for categories.

   - `addCategory`, `getCategories`, `updateCategory`, `deleteCategory`.

2. **budgetController.js** (new): To handle assigning money to categories and calculating overspent amounts.

   - `assignToCategory` (move money to a category), `updateAssignment` (change the assigned money).

3. **transactionController.js**: Modify to handle transactions that are assigned to categories.
   - Ensure transactions update the `activity` and `available` fields in the related `CategoryModel`.

### Middleware

Your existing middleware like `requireAuth.js` should suffice for authentication and authorization purposes across new routes.

### Routes

Expand your routes to include endpoints for categories and budgeting operations:

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

### Server.js

Make sure to import the new routes and use them with your Express app.

### Implementing Budget Logic

- **Assigning to Categories**: When money is assigned to a category, update the `budgetedAmount` and `available` fields in `CategoryModel`.
- **Transactions**: When a transaction is added, decrease the `available` amount in the associated category. If a transaction is deleted or modified, adjust accordingly.
- **Overspending**: If the `available` amount in a category goes negative, it indicates overspending. This should be visually indicated in your frontend.
- **Moving Money Between Categories**: Implement a function that decreases the `available` amount in one category and increases it in another.

### Considerations

- **Validation and Error Handling**: Ensure robust validation and error handling for all operations to maintain data integrity and provide clear feedback to the user.
- **User Authentication**: Utilize `requireAuth` middleware to protect routes and ensure that users can only access and modify their own data.

By structuring your backend with these components, you'll be able to support the complex operations required for a budgeting app that allows users to manage their finances effectively, similar to YNAB. This setup provides a solid foundation, but you may need to adjust and expand upon it as you further develop your app and potentially introduce new features.

Use HTTP status code 404 for not found resources (e.g., transactions, categories).
Use 400 for bad requests where the request cannot be processed due to client-side errors (e.g., validation errors).
201 should be used for creating resources.
204 for successful requests that don't return any content (e.g., delete operations).

- [ ] Display categories
- [ ] Add categories (frontend)
- [ ] Assign to categories - transactions
- [ ] Implement zero functionality
