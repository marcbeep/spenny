import React, { useState } from 'react';

const TransactionForm = ({ categories, accounts, onSubmit }) => {
  const [transaction, setTransaction] = useState({
    title: '',
    category: '',
    account: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTransaction(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(transaction);
  };

  return (
    <section className="card col-span-12 bg-base-100 xl:col-span-5 border-2 border-black rounded-xl">
      <form className="card-body" onSubmit={handleSubmit}>
        <div className="form-control">
          <input
            type="text"
            name="title"
            placeholder="Transaction Title"
            className="input input-bordered"
            value={transaction.title}
            onChange={handleChange}
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-control">
            <select
              name="category"
              className="select select-bordered"
              value={transaction.category}
              onChange={handleChange}
              required
            >
              <option disabled value="">Select Category</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div className="form-control">
            <select
              name="account"
              className="select select-bordered"
              value={transaction.account}
              onChange={handleChange}
              required
            >
              <option disabled value="">Select Account</option>
              {accounts.map(account => (
                <option key={account} value={account}>{account}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-control mt-6">
          <button type="submit" className="btn btn-primary">Add Transaction</button>
        </div>
      </form>
    </section>
  );
};

export default TransactionForm;
