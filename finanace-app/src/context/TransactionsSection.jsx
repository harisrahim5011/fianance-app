import React from 'react';
import { useTransactions } from '../context/TransactionContext'; // Custom hook to access transaction-related state and functions

/**
 * TransactionsSection Component
 *
 * This component displays a list of financial transactions filtered for the currently
 * selected month and year. It allows users to view and delete individual transactions.
 *
 * @param {object} props - The component's props.
 * @param {function} props.showConfirm - A function to display a confirmation modal before deletion.
 * @param {function} props.showMessage - A function to display general messages (success/error).
 */
const TransactionsSection = ({ showConfirm, showMessage }) => {
  // Destructure necessary state and functions from the useTransactions hook.
  // transactions: An array of all financial transactions.
  // currentMonth: The index of the currently selected month (0-11).
  // currentYear: The currently selected year.
  // deleteTransaction: An asynchronous function to delete a transaction from Firestore.
  const { transactions, currentMonth, currentYear, deleteTransaction } = useTransactions();
  
  // --- Transaction Filtering Logic ---
  // Determine the start and end dates for the current month to filter transactions.
  const monthStart = new Date(currentYear, currentMonth, 1); // First day of the current month
  const monthEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59); // Last millisecond of the last day of the current month
  
  // Filter the full list of transactions to include only those within the current month.
  const filteredTransactions = transactions.filter(t => {
    const transactionDate = t.date.toDate(); // Convert Firestore Timestamp to JavaScript Date object
    return transactionDate >= monthStart && transactionDate <= monthEnd; // Check if transaction date is within the current month
  });

  /**
   * handleDelete Function
   *
   * This function is called when a user attempts to delete a transaction.
   * It first triggers a confirmation modal using `showConfirm` and, if confirmed,
   * proceeds with the deletion and provides feedback via `showMessage`.
   *
   * @param {string} id - The ID of the transaction to be deleted.
   */
  const handleDelete = (id) => {
    // Show a confirmation modal before proceeding with deletion.
    showConfirm("Are you sure you want to delete this transaction?", async () => {
      // If confirmed, call the deleteTransaction function from the context.
      const success = await deleteTransaction(id);
      // Provide feedback based on the success of the deletion.
      if (success) {
        showMessage("Transaction deleted successfully.");
      } else {
        showMessage("Failed to delete transaction.", true); // Indicate error if deletion fails
      }
    });
  };

  // --- Component JSX Structure ---
  return (
    // Section container for the monthly transactions list.
    <section>
      {/* Heading for the monthly transactions section. */}
      <h3 className="text-lg font-semibold text-gray-700 mb-3">Monthly Transactions</h3>
      {/* Container for the list of transactions, with vertical spacing, max height, and scrollability. */}
      <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
        {/* Conditional rendering: If no transactions for the current month, display a message. */}
        {filteredTransactions.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No transactions for this month.</p>
        ) : (
          // If there are transactions, map over them to render each one.
          filteredTransactions.map(t => (
            <div 
              key={t.id} // Unique key for each transaction item
              // Dynamic styling based on transaction type (income/expense).
              className={`p-3 mb-2 rounded-lg shadow flex justify-between items-center ${
                t.type === 'income' 
                  ? 'bg-green-100 border-l-4 border-green-500' // Green styling for income
                  : 'bg-red-100 border-l-4 border-red-500' // Red styling for expense
              }`}
            >
              {/* Transaction details: category, date, and amount. */}
              <div>
                <p className="font-semibold text-lg">{t.category}</p>
                <p className="text-sm text-gray-600">
                  {/* Format date and amount for display. */}
                  {t.date.toDate().toLocaleDateString()} - QAR {t.amount.toFixed(2)}
                </p>
              </div>
              {/* Delete button for the transaction. */}
              <button 
                onClick={() => handleDelete(t.id)} // Calls handleDelete with the transaction ID
                className="delete-btn text-red-500 hover:text-red-700 font-semibold p-1 rounded-full"
              >
                {/* SVG icon for the delete (X) button. */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default TransactionsSection; // Export the TransactionsSection component for use in other parts of the application.
