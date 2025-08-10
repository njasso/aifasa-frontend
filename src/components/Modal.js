import React, { useEffect } from 'react';
import { FiX } from 'react-icons/fi';

const Modal = ({ isOpen, onClose, title, children }) => {
  // Use useEffect to handle closing the modal with the Escape key
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900 bg-opacity-50 transition-opacity duration-300">
      <div className="relative w-full max-w-md p-6 bg-white rounded-xl shadow-2xl transform transition-all duration-300 scale-100 opacity-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200 focus:outline-none"
            aria-label="Fermer la modale"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
