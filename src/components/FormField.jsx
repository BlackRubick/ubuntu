import React from 'react';

const FormField = ({ label, type = 'text', ...props }) => (
  <div className="mb-5">
    <label className="block text-gray-700 mb-2 font-semibold">{label}</label>
    <input
      type={type}
      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-sm transition-all"
      {...props}
    />
  </div>
);

export default FormField;
