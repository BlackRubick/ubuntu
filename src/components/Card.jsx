import React from 'react';

const Card = ({ children, className = '' }) => (
  <div className={`bg-white shadow-lg rounded-2xl p-6 border border-gray-100 transition-shadow hover:shadow-2xl ${className}`}>
    {children}
  </div>
);

export default Card;
