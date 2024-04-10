# Frontend Files

```bash
/src
    /api
        /accountService.js
        /analyticsService.js
        /authService.js
        /budgetService.js
        /categoryService.js
        /goalsService.js
        /transactionService.js
    /components
        /common
        /layout
            Navbar.js
        /views
            Account.js
            Category.js
            Landing.js
            Login.js
            Signup.js
            Transaction.js
    /context
        AccountsContext.js
        AnalyticsContext.js
        AuthContext.js
        BudgetContext.js
        CategoriesContext.js
        GoalsContext.js
        TransactionsContext.js
    /hooks
        useAccounts.js
        useAnalytics.js
        useAuth.js
        useBudget.js
        useCategories.js
        useGoals.js
        useTransactions.js
    /mocks
    /utils
        axiosConfig.js
    App.js
    index.js
```

### Custom Hooks in the `hooks/` folder:

These hooks abstract the logic for interacting with context providers and can also handle side effects, API calls, and state updates.

1. **`useAuth.js`**: Manage authentication states, including login, logout, and user session management.
2. **`useAccounts.js`**: Handle fetching, updating, and archiving accounts. It could also include moving money between accounts.
3. **`useCategories.js`**: For operations related to categories, such as fetching, adding, deleting, and updating categories, as well as assigning money to categories.
4. **`useTransactions.js`**: Manage transactions, including adding, updating, and deleting transactions.
5. **`useAnalytics.js`**: Fetch and manage analytics data, such as total spend, spending by category, net worth tracking, and savings rate.
6. **`useBudget.js`**: Handle budget-related functionality, like assigning money to categories, moving money between categories, and calculating the "Ready to Assign" value.
7. **`useGoals.js`**: For creating, fetching, updating, and deleting goals associated with categories.

### Context Files in the `context/` folder:

These context files will define the context and provide a way to access and manipulate the state.

1. **`AuthContext.js`**: Stores user authentication state and provides functions for logging in, logging out, and checking authentication status.
2. **`AccountsContext.js`**: Contains the state and operations for user accounts, including adding, updating, and archiving accounts.
3. **`CategoriesContext.js`**: Manages the state related to categories and their operations.
4. **`TransactionsContext.js`**: Holds the state for transactions and includes functionality for CRUD operations on transactions.
5. **`AnalyticsContext.js`**: Provides access to analytics data and functions to refresh or update this data.
6. **`BudgetContext.js`**: Manages the overall budget state, including the allocation of funds to categories and tracking of "Ready to Assign" funds.
7. **`GoalsContext.js`**: Manages goal-related state and operations, allowing for goal creation, updates, and deletion.

### How to Use:

- Each context file should define its respective context and a provider that encapsulates its state and functions. The provider should wrap the application or the relevant parts of it in the `App.js` file.
- Custom hooks will interact with their respective contexts using the `useContext` hook to provide a simplified API for your components. This way, we can easily manage and access state and functionalities related to different parts of your application without prop drilling.
- For example, `useAuth` could be used in components for authentication checks, login forms, or logout buttons, abstracting away the direct context manipulation.
