# Analytics

1. `/analytics/statCards` -

   ```json
   {
     "message": "Statistics for dashboard cards generated successfully.",
     "data": {
       "netWorth": "1234.56",
       "savingsRate": "50.00",
       "goalsFunded": "2 / 5",
       "averageDailySpend": "100.00"
     }
   }
   ```

2. `/analytics/lastFiveTransactions` -

   ```json
   {
     "message": "Successfully retrieved the last five transactions",
     "data": [
       {
         "_id": "transactionId1",
         "transactionTitle": "Transaction 1",
         "createdAt": "Apr 14",
         "transactionType": "type",
         "transactionAmount": "123.45"
       },
       {
         "_id": "transactionId2",
         "transactionTitle": "Transaction 2",
         "createdAt": "Apr 14",
         "transactionType": "type",
         "transactionAmount": "67.89"
       },
       ...
     ]
   }
   ```

3. `/analytics/dailySpendLastWeek` -

   ```json
   {
     "message": "Daily spend for last week calculated successfully.",
     "dailyOutgoings": [100, 200, 150, 180, 120, 90, 110]
   }
   ```

4. `/analytics/spendByCategoryAllTime` -

   ```json
   {
     "message": "Spending by category analytics updated successfully.",
     "categories": ["Category 1", "Category 2", ...],
     "percentages": [25.00, 35.00, ...]
   }
   ```

5. `/analytics/availableToSpend` -

   ```json
   {
     "message": "Successfully retrieved available to spend amounts.",
     "categories": ["Category 1", "Category 2", ...],
     "availableToSpend": [500, 800, ...]
   }
   ```

6. `/analytics/accountBalances` -
   ```json
   {
     "message": "Successfully retrieved account balances.",
     "accounts": ["Account 1", "Account 2", ...],
     "balances": [1000, 2000, ...]
   }
   ```
