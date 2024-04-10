import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDollarSign, faUsers, faCreditCard, faCheck } from '@fortawesome/free-solid-svg-icons';

// Sample data for stat cards
const statCards = [
  { id: 1, icon: faDollarSign, title: "Total Revenue", value: "$45,231.89", change: "+20.1% from last month" },
  { id: 2, icon: faUsers, title: "Subscriptions", value: "+2,350", change: "+180.1% from last month" },
  { id: 3, icon: faCreditCard, title: "Sales", value: "+12,234", change: "+19% from last month" },
  { id: 4, icon: faCheck, title: "Active Now", value: "+573", change: "+201 since last hour" },
];

// Sample data for transactions
const transactions = [
  { id: 1, customer: "Liam Johnson", type: "Sale", status: "Approved", date: "2023-06-23", amount: "$250.00" },
  { id: 2, customer: "Olivia Smith", type: "Refund", status: "Declined", date: "2023-06-24", amount: "$150.00" },
  // Add more transactions as needed
];

const Dash = () => {
  return (
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(card => (
          <div key={card.id} className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <FontAwesomeIcon icon={card.icon} className="text-xl" />
              <h2 className="card-title">{card.title}</h2>
              <p className="text-2xl">{card.value}</p>
              <p className="text-sm">{card.change}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="overflow-x-auto mt-8">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Type</th>
              <th>Status</th>
              <th>Date</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(transaction => (
              <tr key={transaction.id}>
                <td>{transaction.customer}</td>
                <td>{transaction.type}</td>
                <td><span className={`badge ${transaction.status === 'Approved' ? 'badge-success' : 'badge-error'}`}>{transaction.status}</span></td>
                <td>{transaction.date}</td>
                <td>{transaction.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dash;
