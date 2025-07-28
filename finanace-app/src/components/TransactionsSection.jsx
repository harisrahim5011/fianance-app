import React from 'react';
import { useTransactions } from '../components/TransactionContext'; // Custom hook to access transaction-related state and functions

/**
 * TransactionsSection Component
 *
 * This component displays a list of financial transactions filtered for the currently
 * selected day, month, and year. It allows users to view and delete individual transactions.
 * It also provides navigation buttons to move between days, integrating with the
 * overall month/year selection from the TransactionContext.
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
  // currentDay: The currently selected day (1-31).
  // deleteTransaction: An asynchronous function to delete a transaction from Firestore.
  // changeDay: A function to change the current day (e.g., -1 for previous, 1 for next).
  const { transactions, currentMonth, currentYear, currentDay, deleteTransaction, changeDay } = useTransactions(); // SIGNIFICANT: 'changeDay' is now destructured

  // --- Transaction Filtering Logic ---
  // Format the current date (day, month, and year) for display in the heading.
  const fullDate = new Date(currentYear, currentMonth, currentDay).toLocaleString('default', {
    day: 'numeric',   // Display the day of the month
    month: 'long',    // Display the full month name (e.g., "July")
    year: 'numeric'   // Display the full year (e.g., "2025")
  });

  // Determine the start and end dates for the current day to filter transactions.
  // This will filter transactions to include only those within the specific 24-hour period of the currentDay.
  const dayStart = new Date(currentYear, currentMonth, currentDay, 0, 0, 0, 0);   // First millisecond of the current day
  const dayEnd = new Date(currentYear, currentMonth, currentDay, 23, 59, 59, 999); // Last millisecond of the current day

  // Filter the full list of transactions to include only those within the current day.
  const filteredTransactions = transactions.filter(t => {
    const transactionDate = t.date.toDate(); // Convert Firestore Timestamp to JavaScript Date object
    return transactionDate >= dayStart && transactionDate <= dayEnd; // Check if transaction date is within the current day's range
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
    // Section container for the daily transactions list.
    <section>
      {/* Daily Navigation and Display Bar */}
      <div className="flex justify-between items-center mb-4">
        {/* Button to navigate to the previous day */}
        <button
          onClick={() => changeDay(-1)} // Calls changeDay from context with -1 to go back one day
          className="p-2 rounded-full hover:bg-gray-200 transition-colors"
          aria-label="Previous Day" // Accessibility label
        >
          {/* SVG icon for previous arrow */}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6 text-gray-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        {/* Display of the current full date for daily transactions */}
        <h3 className="text-xl font-semibold text-gray-700">{fullDate}</h3>
        {/* Button to navigate to the next day */}
        <button
          onClick={() => changeDay(1)} // Calls changeDay from context with 1 to go forward one day
          className="p-2 rounded-full hover:bg-gray-200 transition-colors"
          aria-label="Next Day" // Accessibility label
        >
          {/* SVG icon for next arrow */}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6 text-gray-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      {/* Heading for the daily transactions list. */}
      <h3 className="text-lg font-semibold text-gray-700 mb-3">Daily Transactions</h3>
      {/* Container for the scrollable list of transactions. */}
      <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
        {/* Conditional rendering: If no transactions for the current day, display a message. */}
        {filteredTransactions.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No transactions for this day.</p>
        ) : (
          // If there are transactions, map over them to render each one.
          filteredTransactions.map(t => (
            <div
              key={t.id} // Unique key for each transaction item
              // Dynamic styling based on transaction type (income/expense) for visual distinction.
              className={`p-3 mb-2 rounded-lg shadow flex justify-between items-center ${
                t.type === 'income'
                  ? 'bg-green-100 border-l-4 border-green-500' // Green styling for income
                  : 'bg-red-100 border-l-4 border-red-500'   // Red styling for expense
              }`}
            >
              {/* Transaction details: category, formatted date, and amount. */}
              <div>
                <p className="font-semibold text-lg">{t.category}</p>
                <p className="text-sm text-gray-600">
                  {t.date.toDate().toLocaleDateString()} - QAR {t.amount.toFixed(2)}
                </p>
              </div>
              {/* Delete button for the transaction. */}
              <button
                onClick={() => handleDelete(t.id)} // Calls handleDelete with the transaction ID when clicked
                className="delete-btn text-red-500 hover:text-red-700 font-semibold p-1 rounded-full"
                aria-label={`Delete ${t.category} transaction`} // Accessibility label
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
