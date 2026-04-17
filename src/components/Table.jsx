import React from 'react';

const Table = ({ columns, data }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full bg-white rounded-2xl shadow-lg border border-gray-100">
      <thead>
        <tr className="bg-gradient-to-r from-blue-100 to-blue-50">
          {columns.map((col) => (
            <th key={col.key} className="px-5 py-3 text-left text-blue-800 font-bold border-b uppercase tracking-wide">{col.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i} className="hover:bg-blue-50 transition-colors">
            {columns.map((col) => (
              <td key={col.key} className="px-5 py-3 border-b text-gray-700">{row[col.key]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default Table;
