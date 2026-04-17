import React from 'react';

const Modal = ({ open, onClose, children, title }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative animate-slide-down">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-blue-700 text-2xl font-bold focus:outline-none"
          onClick={onClose}
          aria-label="Cerrar"
        >
          <span className="material-icons-outlined">close</span>
        </button>
        {title && <h3 className="text-xl font-bold mb-4 text-blue-700">{title}</h3>}
        {children}
      </div>
    </div>
  );
};

export default Modal;
