import React from 'react';

const Toast = ({ message, type = 'info', onClose }) => {
  const color = type === 'error' ? 'bg-red-100 text-red-700' : type === 'success' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700';
  return (
    <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded shadow ${color}`}>
      <span>{message}</span>
      <button className="ml-4 text-lg font-bold" onClick={onClose}>×</button>
    </div>
  );
};

export default Toast;
