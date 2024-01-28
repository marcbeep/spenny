// components/Table.js
import React from 'react';

const Table = ({ data }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full leading-normal border-2 border-gray-700">
        <thead>
          <tr>
            <th className="px-5 py-3 border-b border-gray-700 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider rounded-tl-lg">
              Title
            </th>
            <th className="px-5 py-3 border-b border-gray-700 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider rounded-tr-lg">
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {data &&
            data.map((item, index) => (
              <tr key={item.id}>
                <td className={`px-5 py-5 border-b border-gray-700 bg-white text-sm ${index === data.length - 1 ? 'rounded-bl-lg' : ''}`}>
                  {item.title}
                </td>
                <td className={`px-5 py-5 border-b border-gray-700 bg-white text-sm ${index === data.length - 1 ? 'rounded-br-lg' : ''}`}>
                  £{item.amount}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;


