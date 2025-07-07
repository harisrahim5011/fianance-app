import React from 'react';

const MessageModal = ({ isOpen, message, isError, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm text-center">
        <p className={`text-lg mb-4 ${isError ? 'text-red-700' : ''}`}>{message}</p>
        <button 
          onClick={onClose}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg w-full"
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default MessageModal;