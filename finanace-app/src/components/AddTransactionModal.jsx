import React, { useState, useEffect } from 'react';
import { useTransactions } from '../components/TransactionContext'; // Custom hook to access transaction-related state and functions

/**
 * AddTransactionModal Component
 *
 * This component renders a modal for adding new financial transactions (income or expense).
 * It manages the form's local state for transaction type, amount, category, and date.
 * It now also includes functionality for users to create and manage (add/delete) their
 * custom categories, which are expected to be persisted via the TransactionContext.
 *
 * @param {object} props - The component's props.
 * @param {boolean} props.isOpen - Controls the visibility of the modal.
 * @param {function} props.onClose - Callback function to close the modal.
 * @param {function} props.showMessage - Function to display messages (e.g., success or error notifications) to the user.
 * @param {function} props.showConfirm - Function to display a confirmation modal (e.g., before deleting a category).
 */
const AddTransactionModal = ({ isOpen, onClose, showMessage, showConfirm }) => { // Accepted showConfirm prop
  // Destructure necessary functions and data from the TransactionContext.
  // userIncomeCategories: Array of strings for user-defined income categories.
  // userExpenseCategories: Array of strings for user-defined expense categories.
  // addTransaction: Asynchronous function to add a new transaction to the backend.
  // addCategory: Asynchronous function to add a new user-defined category.
  // deleteCategory: Asynchronous function to delete a user-defined category.
  const {
    userIncomeCategories,
    userExpenseCategories,
    addTransaction,
    addCategory,
    deleteCategory
  } = useTransactions();

  // --- Local State Management for Form Inputs ---
  // type: Stores the selected transaction type ('income' or 'expense'). Default is 'income'.
  const [type, setType] = useState('income');
  // amount: Stores the transaction amount as a string.
  const [amount, setAmount] = useState('');
  // category: Stores the selected transaction category.
  const [category, setCategory] = useState('');
  // date: Stores the transaction date in 'YYYY-MM-DD' format.
  const [date, setDate] = useState('');
  // newCategoryName: Stores the value of the input field for adding new categories.
  const [newCategoryName, setNewCategoryName] = useState('');
  // showCategoryManagement: Boolean to toggle the visibility of the category management section.
  const [showCategoryManagement, setShowCategoryManagement] = useState(false);

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
      // Also reset new category name and hide management section on modal open.
      setNewCategoryName('');
      setShowCategoryManagement(false);
    }
  }, [isOpen]); // Dependency array: Effect re-runs only when `isOpen` changes.

  // Dynamically determine which set of categories to use based on the selected transaction type.
  const categories = type === 'income' ? userIncomeCategories : userExpenseCategories;

  /**
   * handleAddCategory Function
   *
   * Handles adding a new custom category. Performs basic validation
   * and calls the `addCategory` function from `TransactionContext`.
   */
  const handleAddCategory = async () => {
    if (newCategoryName.trim() === '') {
      showMessage("Please enter a name for the new category.", true);
      return;
    }
    const success = await addCategory(newCategoryName.trim(), type);
    if (success) {
      showMessage(`Category '${newCategoryName.trim()}' added!`);
      setNewCategoryName(''); // Clear the input field
    } else {
      showMessage(`Error adding category '${newCategoryName.trim()}'.`, true);
    }
  };

  /**
   * handleDeleteCategory Function
   *
   * Handles deleting a custom category. Uses the `showConfirm` prop for user confirmation
   * before calling the `deleteCategory` function from `TransactionContext`.
   * @param {string} categoryToDelete - The name of the category to be deleted.
   */
  const handleDeleteCategory = async (categoryToDelete) => {
    // Defensive check: Ensure showConfirm is available before calling it
    if (typeof showConfirm !== 'function') {
        console.error("showConfirm function is not provided to AddTransactionModal.");
        showMessage("An internal error occurred. Cannot confirm deletion.", true);
        return;
    }

    showConfirm(`Are you sure you want to delete the category '${categoryToDelete}'? This will not affect existing transactions.`, async () => {
      const success = await deleteCategory(categoryToDelete, type);
      if (success) {
        showMessage(`Category '${categoryToDelete}' deleted!`);
      } else {
        showMessage(`Error deleting category '${categoryToDelete}'.`, true);
      }
    });
  };

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
              onChange={(e) => {
                setType(e.target.value);
                setCategory(''); // Reset category when type changes for new options.
              }}
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

          {/* Button to toggle category management section */}
          <div className="mb-4 text-center">
            <button
              type="button"
              onClick={() => setShowCategoryManagement(prev => !prev)}
              className="text-blue-600 hover:text-blue-800 font-semibold text-sm py-2 px-4 rounded-lg border border-blue-600 hover:border-blue-800 transition-colors"
            >
              {showCategoryManagement ? 'Hide Category Management' : 'Manage Categories'}
            </button>
          </div>

          {/* Category Management Section (conditionally rendered) */}
          {showCategoryManagement && (
            <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <h4 className="font-semibold text-gray-700 mb-3">Add New Category</h4>
              <div className="flex mb-4">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="New category name"
                  className="flex-grow p-2 border border-gray-300 rounded-l-lg focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-500 hover:bg-green-600 rounded-r-lg"
                >
                  Add
                </button>
              </div>

              <h4 className="font-semibold text-gray-700 mb-3">Existing Categories</h4>
              <div className="max-h-32 overflow-y-auto space-y-2">
                {categories.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center">No custom categories added yet.</p>
                ) : (
                  categories.map(cat => (
                    <div key={cat} className="flex justify-between items-center p-2 bg-white border border-gray-200 rounded-lg shadow-sm">
                      <span className="text-gray-700 text-sm">{cat}</span>
                      {/* Disable deletion for default categories. */}
                      {/* This check uses a hardcoded list of default categories. Make sure it aligns with your TransactionContext's default categories. */}
                      {!(["Salary", "Business", "Freelance", "Gifts", "Adjusted", "Food", "Transport", "Rent", "Utilities", "Entertainment", "Health", "Shopping", "Education"].includes(cat)) && (
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat)}
                            className="text-red-500 hover:text-red-700 text-xs font-semibold p-1 rounded-full"
                            title={`Delete ${cat}`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

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
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg">Add Transaction</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTransactionModal;
