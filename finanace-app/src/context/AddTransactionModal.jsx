import React, { useState, useEffect } from 'react';
import { useTransactions } from '../context/TransactionContext';

/**
 * AddTransactionModal Component
 *
 * This component renders a modal for adding new financial transactions (income or expense).
 * It manages the form's local state for transaction type, amount, category, and date.
 * It interacts with a `TransactionContext` (presumably via `useTransactions` hook)
 * to access transaction categories and the `addTransaction` function.
 *
 * @param {object} props - The component's props.
 * @param {boolean} props.isOpen - Controls the visibility of the modal.
 * @param {function} props.onClose - Callback function to close the modal.
 * @param {function} props.showMessage - Function to display messages (e.g., success or error notifications) to the user.
 */
const AddTransactionModal = ({ isOpen, onClose, showMessage }) => {
  // Destructure necessary functions and data from the TransactionContext.
  // incomeCategories: Array of strings for income categories.
  // expenseCategories: Array of strings for expense categories.
  // addTransaction: Asynchronous function to add a new transaction to the backend (e.g., Firestore).
  const { incomeCategories, expenseCategories, addTransaction } = useTransactions();

  // --- Local State Management for Form Inputs ---
  // type: Stores the selected transaction type ('income' or 'expense'). Default is 'income'.
  const [type, setType] = useState('income');
  // amount: Stores the transaction amount as a string.
  const [amount, setAmount] = useState('');
  // category: Stores the selected transaction category.
  const [category, setCategory] = useState('');
  // date: Stores the transaction date in 'YYYY-MM-DD' format.
  const [date, setDate] = useState('');

  /**
   * useEffect Hook
   *
   * This effect runs whenever the `isOpen` prop changes.
   * Its primary purpose is to reset the form fields and set the default date to today
   * when the modal is opened.
   */
  useEffect(() => {
    if (isOpen) {
      // Reset form fields when the modal becomes open.
      const today = new Date();
      // Format today's date to 'YYYY-MM-DD' for the input type="date".
      setDate(today.toISOString().split('T')[0]);
      setAmount('');
      // Reset category to an empty string to force selection if it's required.
      setCategory('');
    }
  }, [isOpen]); // Dependency array: Effect re-runs only when `isOpen` changes.

  // Dynamically determine which set of categories to use based on the selected transaction type.
  const categories = type === 'income' ? incomeCategories : expenseCategories;

  /**
   * handleSubmit Function
   *
   * This asynchronous function is called when the form is submitted.
   * It prevents the default form submission behavior, performs client-side validation,
   * constructs the transaction object, calls the `addTransaction` function from context,
   * and provides user feedback via `showMessage`.
   *
   * @param {object} e - The event object from the form submission.
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default browser form submission.
    
    // Client-side validation: Check if all required fields are filled and amount is positive.
    if (!amount || !category || !date || parseFloat(amount) <= 0) {
      // Display an error message if validation fails.
      showMessage("Please fill all fields with valid values.", true);
      return; // Stop the submission process.
    }
    
    // Create the transaction object from the current state.
    const transaction = {
      type,
      amount: parseFloat(amount), // Convert amount to a number.
      category,
      date // Date is already in 'YYYY-MM-DD' string format.
    };
    
    // Call the addTransaction function from the context.
    // This function is expected to handle the actual data persistence (e.g., to Firestore).
    const success = await addTransaction(transaction);
    
    // Provide feedback to the user based on the success of the transaction addition.
    if (success) {
      showMessage(`${type.charAt(0).toUpperCase() + type.slice(1)} added successfully!`);
      onClose(); // Close the modal on successful addition.
    } else {
      showMessage(`Error adding ${type}`, true); // Display an error if addition failed.
    }
  };

  // If the modal is not open, render nothing. This prevents rendering the modal's DOM
  // when it's not visible, which can be a performance optimization.
  if (!isOpen) return null;

  // --- Component JSX Structure ---
  return (
    // Modal overlay: fixed position, dark background, centered content.
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-40 p-4">
      {/* Modal content container: white background, rounded corners, shadow, max-width. */}
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        {/* Modal header: title and close button. */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Add Transaction</h2>
          {/* Close button: triggers the onClose prop. */}
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            {/* SVG icon for close button. */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* Transaction form. */}
        <form onSubmit={handleSubmit}>
          {/* Transaction Type Selection */}
          <div className="mb-4">
            <label htmlFor="transactionType" className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select 
              id="transactionType"
              value={type} // Controlled component: value is tied to 'type' state.
              onChange={(e) => setType(e.target.value)} // Update 'type' state on change.
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          {/* Transaction Amount Input */}
          <div className="mb-4">
            <label htmlFor="transactionAmount" className="block text-sm font-medium text-gray-700 mb-1">Amount (QAR)</label>
            <input 
              type="number" 
              id="transactionAmount"
              value={amount} // Controlled component: value is tied to 'amount' state.
              onChange={(e) => setAmount(e.target.value)} // Update 'amount' state on change.
              step="0.01" // Allow decimal values.
              min="0.01" // Minimum positive value.
              required // HTML5 validation: field is required.
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 50.00"
            />
          </div>
          {/* Transaction Category Selection */}
          <div className="mb-4">
            <label htmlFor="transactionCategory" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select 
              id="transactionCategory"
              value={category} // Controlled component: value is tied to 'category' state.
              onChange={(e) => setCategory(e.target.value)} // Update 'category' state on change.
              required // HTML5 validation: field is required.
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a category</option> {/* Placeholder option */}
              {/* Map over the dynamically determined categories (income or expense) to create options. */}
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          {/* Transaction Date Input */}
          <div className="mb-6">
            <label htmlFor="transactionDate" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input 
              type="date" 
              id="transactionDate"
              value={date} // Controlled component: value is tied to 'date' state.
              onChange={(e) => setDate(e.target.value)} // Update 'date' state on change.
              required // HTML5 validation: field is required.
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {/* Form Action Buttons */}
          <div className="flex justify-end space-x-3">
            {/* Cancel button: closes the modal without submitting. */}
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg">Cancel</button>
            {/* Submit button: triggers the handleSubmit function. */}
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg">Add Transaction</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTransactionModal;
