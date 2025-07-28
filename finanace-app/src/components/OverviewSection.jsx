import React from 'react';
import { useTransactions } from '../components/TransactionContext'; // Custom hook to access transaction-related state and functions

/**
 * OverviewSection Component
 *
 * This component displays a financial overview for the currently selected month, year, and now day.
 * It shows the total income, total expenses, and the net balance for that specific period.
 * It also provides navigation buttons to change the displayed month and now day.
 */
const OverviewSection = () => {
  // Destructure necessary state and functions from the useTransactions hook.
  // transactions: An array of all financial transactions.
  // currentMonth: The index of the currently selected month (0-11).
  // currentYear: The currently selected year.
  // currentDay: The currently selected day of the month (1-31).
  // changeMonth: A function to change the current month (e.g., -1 for previous, 1 for next).
  // changeDay: A function to change the current day (e.g., -1 for previous, 1 for next).
  const { transactions, currentMonth, currentYear, currentDay, changeMonth, changeDay } = useTransactions();

  // Format the current date (day, month, and year) for display (e.g., "July 26, 2025").
  const fullDate = new Date(currentYear, currentMonth, currentDay).toLocaleString('default', {
    day: 'numeric', // Day of the month
    month: 'long', // Full month name
    year: 'numeric' // Full year
  });

  // --- Transaction Filtering Logic ---
  // Determine the start and end dates for the current day to filter transactions.
  // The filter will now be for a specific day, from the beginning of that day to the end.
  const dayStart = new Date(currentYear, currentMonth, currentDay, 0, 0, 0); // First millisecond of the current day
  const dayEnd = new Date(currentYear, currentMonth, currentDay, 23, 59, 59, 999); // Last millisecond of the current day

  // Filter the full list of transactions to include only those within the current day.
  const filteredTransactions = transactions.filter(t => {
    const transactionDate = t.date.toDate(); // Convert Firestore Timestamp to JavaScript Date object
    return transactionDate >= dayStart && transactionDate <= dayEnd; // Check if transaction date is within the current day
  });

  // --- Calculation of Totals ---
  let totalIncome = 0; // Initialize total income
  let totalExpenses = 0; // Initialize total expenses

  // Iterate through the filtered transactions to calculate total income and expenses.
  filteredTransactions.forEach(t => {
    if (t.type === 'income') {
      totalIncome += t.amount; // Add to income if transaction type is 'income'
    } else {
      totalExpenses += t.amount; // Add to expenses if transaction type is 'expense'
    }
  });

  // Calculate the net balance.
  const balance = totalIncome - totalExpenses;

  // --- Component JSX Structure ---
  return (
    // Section container for the financial overview.
    <section className="mb-6">
      {/* Date navigation and display. */}
      <div className="flex justify-between items-center mb-4">
        {/* Button to navigate to the previous day. */}
        <button
          onClick={() => changeDay(-1)} // Calls changeDay with -1 to go back one day
          className="p-2 rounded-full hover:bg-gray-200 transition-colors"
        >
          {/* SVG icon for previous arrow. */}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6 text-gray-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        {/* Display of the current full date. */}
        <h2 className="text-xl font-semibold text-gray-700">{fullDate}</h2>
        {/* Button to navigate to the next day. */}
        <button
          onClick={() => changeDay(1)} // Calls changeDay with 1 to go forward one day
          className="p-2 rounded-full hover:bg-gray-200 transition-colors"
        >
          {/* SVG icon for next arrow. */}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6 text-gray-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      {/* Grid layout for displaying total income, expenses, and balance. */}
      <div className="grid grid-cols-3 gap-4 mb-4 text-center">
        {/* Total Income display card. */}
        <div className="bg-green-50 p-4 rounded-lg shadow">
          <p className="text-sm text-green-700 font-medium">Total Income</p>
          {/* Displays total income, formatted to two decimal places. */}
          <p className="text-xl font-bold text-green-600">QAR {totalIncome.toFixed(2)}</p>
        </div>
        {/* Total Expenses display card. */}
        <div className="bg-red-50 p-4 rounded-lg shadow">
          <p className="text-sm text-red-700 font-medium">Total Expenses</p>
          {/* Displays total expenses, formatted to two decimal places. */}
          <p className="text-xl font-bold text-red-600">QAR {totalExpenses.toFixed(2)}</p>
        </div>
        {/* Balance display card. */}
        <div className="bg-blue-50 p-4 rounded-lg shadow">
          <p className="text-sm text-blue-700 font-medium">Balance</p>
          {/* Displays balance, with dynamic text color based on positive/negative value. */}
          {/* Uses Math.abs() to display the absolute value, as the color indicates positive/negative. */}
          <p className={`text-xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            QAR {Math.abs(balance).toFixed(2)}
          </p>
        </div>
      </div>
    </section>
  );
};

export default OverviewSection; // Export the OverviewSection component for use in other parts of the application.