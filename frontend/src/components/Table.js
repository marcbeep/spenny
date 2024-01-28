// components/Table.js
import React from 'react';

const Table = ({ data }) => {
  return (
    <div className="overflow-x-auto">
      <table className="table w-full"> {/* Updated to use DaisyUI table classes */}
        {/* Table header */}
        <thead>
          <tr>
            <th>Title</th> {/* Simplified header cells */}
            <th>Amount</th>
          </tr>
        </thead>
        {/* Table body */}
        <tbody>
          {data &&
            data.map((item) => (
              <tr key={item.id}> {/* Removed conditional styling for rounded corners */}
                <td>{item.title}</td>
                <td>£{item.amount}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;



