// TransactionModal.js

import React from 'react';

const TransactionModal = ({ isOpen, closeModal }) => {
  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <form className="form-control">
          {/* Form fields here */}
          <label className="label">
            <span className="font-bold label-text">Transaction Title</span>
          </label>
          <input type="text" placeholder="Greggs" className="input input-bordered" />
          {/* Add more fields as needed */}
          <label className="label">
            <span className="font-bold label-text">Amount Spent</span>
          </label>
          <input type="text" placeholder="£10" className="input input-bordered" />
        </form>
        <div className="modal-action">
          <button className="btn btn-primary" onClick={console.log("Helloworld")}>Submit</button>
          <button className="btn" onClick={closeModal}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;

