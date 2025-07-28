import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, appId } from '../firebase'; // Import Firestore instance (db) and app ID from firebase configuration
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore'; // Firebase Firestore methods
import { useAuth } from '../hooks/useAuth'; // Custom hook to get the current authenticated user

/**
 * TransactionContext
 *
 * This React Context is used to provide transaction-related state and functions
 * to all components wrapped by the TransactionProvider.
 */
const TransactionContext = createContext();

/**
 * useTransactions Hook
 *
 * A custom hook to consume the TransactionContext. This makes it easier for components
 * to access the transaction state and functions without directly using useContext.
 * @returns {object} The value provided by the TransactionContext.
 * @throws {Error} If used outside of a TransactionProvider.
 */
export function useTransactions() {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
}

/**
 * TransactionProvider Component
 *
 * This component acts as a provider for the TransactionContext. It manages:
 * - The list of financial transactions.
 * - The currently displayed month, year, and now day for filtering transactions.
 * - The loading state for transaction operations.
 * - Predefined categories for income and expenses.
 * - Functions to add, delete, and fetch transactions from Firestore.
 * - Functions to change the current month/year view and the current day view.
 *
 * @param {object} props - The component's props.
 * @param {React.ReactNode} props.children - The child components that will consume the TransactionContext.
 */
export function TransactionProvider({ children }) {
  // transactions: State to store the array of financial transactions.
  const [transactions, setTransactions] = useState([]);
  // currentMonth: State to store the index of the currently displayed month (0-11).
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  // currentYear: State to store the currently displayed year.
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  // currentDay: State to store the currently displayed day of the month (1-31).
  // Initialize with the current day.
  const [currentDay, setCurrentDay] = useState(new Date().getDate());
  // loading: State to indicate if transaction data is being fetched or modified.
  const [loading, setLoading] = useState(false);
  // currentUser: Get the authenticated user from the AuthContext.
  const { currentUser } = useAuth();

  // Predefined categories for income transactions.
  const incomeCategories = ["Salary", "Business", "Freelance", "Gifts", "Adjusted", "Other"];
  // Predefined categories for expense transactions.
  const expenseCategories = ["Food", "Transport", "Rent", "Utilities", "Entertainment", "Health", "Shopping", "Education", "Adjusted", "Other"];

  /**
   * useEffect Hook for Loading Transactions
   *
   * This effect sets up a real-time listener (onSnapshot) to fetch transactions
   * from Firestore for the current user. It runs whenever the `currentUser` changes.
   * It also handles sorting of transactions by date.
   */
  useEffect(() => {
    // If no user is logged in, do not attempt to load transactions.
    if (!currentUser) return;

    let unsubscribe = () => {}; // Initialize unsubscribe function

    const loadTransactions = async () => {
      setLoading(true); // Set loading to true when starting to fetch transactions
      try {
        // Construct the Firestore collection path for the current user's transactions.
        const transactionsCol = collection(db, `artifacts/${appId}/users/${currentUser.uid}/transactions`);
        // Create a query for the transactions collection.
        const q = query(transactionsCol);

        // Set up a real-time listener using onSnapshot.
        unsubscribe = onSnapshot(q, (querySnapshot) => {
          const transactionsData = [];
          // Iterate through the documents in the snapshot and add them to the array.
          querySnapshot.forEach((doc) => {
            transactionsData.push({ id: doc.id, ...doc.data() });
          });
          // Sort transactions by date in descending order (most recent first).
          transactionsData.sort((a, b) => b.date.toDate().getTime() - a.date.toDate().getTime());
          setTransactions(transactionsData); // Update the transactions state
          setLoading(false); // Set loading to false once data is fetched
        }, (error) => {
          // Error callback for onSnapshot
          console.error("Error loading transactions:", error);
          setLoading(false); // Ensure loading is false even if there's an error
        });

        // Return the unsubscribe function to clean up the listener when the component unmounts
        // or when currentUser changes.
        return unsubscribe;
      } catch (error) {
        console.error("Error setting up transaction listener:", error);
        setLoading(false); // Ensure loading is false on initial setup error
      }
    };

    // Call loadTransactions to initiate the data fetching.
    const cleanup = loadTransactions();

    // Return the cleanup function from the outer useEffect to unsubscribe.
    return () => {
      if (typeof cleanup.then === 'function') {
        // If loadTransactions returns a promise (e.g., from async), handle it.
        // In this case, it returns the unsubscribe function directly, so this branch might not be strictly necessary
        // but is a good defensive pattern.
        cleanup.then(unsub => unsub());
      } else {
        unsubscribe(); // Call the unsubscribe function directly
      }
    };
  }, [currentUser]); // Dependency array: Effect re-runs when `currentUser` changes.

  /**
   * addTransaction Function
   *
   * Adds a new transaction document to the current user's transactions collection in Firestore.
   * @param {object} transaction - The transaction object containing type, amount, category, and date.
   * @returns {Promise<boolean>} True if the transaction was added successfully, false otherwise.
   */
  const addTransaction = async (transaction) => {
    if (!currentUser) {
      console.warn("Cannot add transaction: No user authenticated.");
      return false;
    }

    setLoading(true); // Set loading to true during the add operation
    try {
      // Add a new document to the user's private transactions subcollection.
      await addDoc(collection(db, `artifacts/${appId}/users/${currentUser.uid}/transactions`), {
        ...transaction,
        // Convert the date string to a Firestore Timestamp.
        date: Timestamp.fromDate(new Date(transaction.date)),
        // Add a createdAt timestamp for tracking.
        createdAt: Timestamp.now()
      });
      return true; // Indicate success
    } catch (error) {
      console.error("Error adding transaction:", error);
      return false; // Indicate failure
    } finally {
      setLoading(false); // Set loading to false after the operation completes
    }
  };

  /**
   * deleteTransaction Function
   *
   * Deletes a specific transaction document from the current user's transactions collection in Firestore.
   * @param {string} transactionId - The ID of the transaction document to delete.
   * @returns {Promise<boolean>} True if the transaction was deleted successfully, false otherwise.
   */
  const deleteTransaction = async (transactionId) => {
    if (!currentUser) {
      console.warn("Cannot delete transaction: No user authenticated.");
      return false;
    }

    setLoading(true); // Set loading to true during the delete operation
    try {
      // Delete the document from the user's private transactions subcollection.
      await deleteDoc(doc(db, `artifacts/${appId}/users/${currentUser.uid}/transactions`, transactionId));
      return true; // Indicate success
    } catch (error) {
      console.error("Error deleting transaction:", error);
      return false; // Indicate failure
    } finally {
      setLoading(false); // Set loading to false after the operation completes
    }
  };

  /**
   * changeMonth Function
   *
   * Updates the currentMonth and currentYear states to navigate between months.
   * When changing months, the day is reset to 1 to avoid issues with month-end dates (e.g., going from March 31 to Feb).
   * @param {number} delta - The change in months (e.g., -1 for previous month, 1 for next month).
   */
  const changeMonth = (delta) => {
    setCurrentMonth(prev => {
      let newMonth = prev + delta;
      let newYear = currentYear; // Initialize newYear with the current year

      // Adjust year if month goes out of bounds (0-11).
      if (newMonth < 0) {
        newMonth = 11; // Wrap around to December
        newYear--; // Decrement year
      } else if (newMonth > 11) {
        newMonth = 0; // Wrap around to January
        newYear++; // Increment year
      }

      setCurrentYear(newYear); // Update the year state
      setCurrentDay(1); // Reset day to 1 when month changes to avoid date overflow issues
      return newMonth; // Return the new month index
    });
  };

  /**
   * changeDay Function
   *
   * Updates the currentDay, currentMonth, and currentYear states to navigate between days.
   * It handles day, month, and year rollovers correctly.
   * @param {number} delta - The change in days (e.g., -1 for previous day, 1 for next day).
   */
  const changeDay = (delta) => {
    // Create a Date object for the current selected date
    const currentDate = new Date(currentYear, currentMonth, currentDay);
    // Add the delta to the current date's day
    currentDate.setDate(currentDate.getDate() + delta);

    // Update the state based on the new date
    setCurrentYear(currentDate.getFullYear());
    setCurrentMonth(currentDate.getMonth());
    setCurrentDay(currentDate.getDate());
  };

  // The value object containing all state and functions to be provided by the context.
  const value = {
    transactions,
    currentMonth,
    currentYear,
    currentDay, // Include currentDay in the context value
    incomeCategories,
    expenseCategories,
    addTransaction,
    deleteTransaction,
    changeMonth,
    changeDay, // Include changeDay in the context value
    loading // Provide the loading state
  };

  // Render the TransactionContext.Provider, making the 'value' available to its children.
  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
}