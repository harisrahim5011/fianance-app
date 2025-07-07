import React, { useState, useEffect } from 'react';
import { useTransactions } from '../context/TransactionContext';

const AddTransactionModal = ({ isOpen, onClose, showMessage }) => {
  const { incomeCategories, expenseCategories, addTransaction } = useTransactions();
  const [type, setType] = useState('income');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      const today = new Date();
      setDate(today.toISOString().split('T')[0]);
      setAmount('');
      setCategory('');
    }
  }, [isOpen]);

  const categories = type === 'income' ? incomeCategories : expenseCategories;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!amount || !category || !date || parseFloat(amount) <= 0) {
      showMessage("Please fill all fields with valid values.", true);
      return;
    }
    
    const transaction = {
      type,
      amount: parseFloat(amount),
      category,
      date
    };
    
    const success = await addTransaction(transaction);
    
    if (success) {
      showMessage(`${type.charAt(0).toUpperCase() + type.slice(1)} added successfully!`);
      onClose();
    } else {
      showMessage(`Error adding ${type}`, true);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-40 p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Add Transaction</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="transactionType" className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select 
              id="transactionType"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="transactionAmount" className="block text-sm font-medium text-gray-700 mb-1">Amount (QAR)</label>
            <input 
              type="number" 
              id="transactionAmount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
              min="0.01"
              required
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 50.00"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="transactionCategory" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select 
              id="transactionCategory"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="mb-6">
            <label htmlFor="transactionDate" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input 
              type="date" 
              id="transactionDate"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg">Add Transaction</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTransactionModal;