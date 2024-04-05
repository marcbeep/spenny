# Dashboard structure overview

For illustrative purposes:

```
spenny-dashboard/
├── public/
│ └── icon.png
├── src/
│ ├── components/
│ │ ├── common/
│ │ │ ├── Button.jsx
│ │ │ ├── Modal.jsx
│ │ │ └── ...
│ │ ├── dashboard/
│ │ │ ├── AccountsSummary.jsx
│ │ │ ├── BudgetCategories.jsx
│ │ │ ├── TransactionList.jsx
│ │ │ ├── BudgetOverview.jsx
│ │ │ ├── SpendingTrendsChart.jsx
│ │ │ ├── ExpensesPieChart.jsx
│ │ │ └── ...
│ │ ├── layout/
│ │ │ ├── NavigationBar.jsx
│ │ │ ├── SidebarMenu.jsx
│ │ │ └── ...
│ │ ├── AccountForm.jsx
│ │ ├── CategoryForm.jsx
│ │ └── TransactionForm.jsx
│ ├── context/
│ │ ├── AuthContext.js
│ │ ├── BudgetContext.js
│ │ └── ThemeContext.js
│ ├── hooks/
│ │ ├── useAuth.js
│ │ ├── useBudget.js
│ │ └── useFetch.js
│ ├── pages/
│ │ ├── DashboardPage.jsx
│ │ ├── LoginPage.jsx
│ │ ├── SettingsPage.jsx
│ │ └── AccountDetailsPage.jsx
│ ├── utils/
│ │ ├── api.js
│ │ └── formatCurrency.js
│ ├── App.js
│ └── index.js
├── .env
├── package.json
└── tailwind.config.js
```
