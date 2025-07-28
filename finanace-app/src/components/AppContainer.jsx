import React from 'react';
import { useAuth } from '../hooks/useAuth'; // Custom hook for authentication state and functions
import { useTransactions } from '../components/TransactionContext'; // Custom hook for transaction-related state and functions
import UserInfo from './UserInfo'; // Component to display user information
import OverviewSection from './OverviewSection'; // Component for financial overview (income, expenses, balance)
import TransactionsSection from './TransactionsSection'; // Component to list monthly transactions
import AddTransactionModal from './AddTransactionModal'; // Modal for adding new transactions
import MessageModal from './MessageModal'; // Generic modal for displaying messages (success/error)
import ConfirmModal from './ConfirmModal'; // Generic modal for user confirmations
import LoadingIndicator from './LoadingIndicator'; // Component to display a loading spinner

/**
 * AppContainer Component
 *
 * This component serves as the main layout and orchestrator for the Finance Tracker application's
 * authenticated view. It manages the visibility and state of various modals and integrates
 * sub-components to display financial data and user information.
 */
const AppContainer = () => {
  // Destructure authentication state and functions from the useAuth hook.
  // currentUser: The currently authenticated user object (or null if not authenticated).
  // signOutUser: Function to sign out the current user.
  const { currentUser, signOutUser } = useAuth();

  // Destructure loading state from the useTransactions hook.
  // loading: A boolean indicating if transaction data is currently being loaded.
  const { loading } = useTransactions();

  // --- State Management for Modals ---
  // showAddModal: Controls the visibility of the AddTransactionModal.
  const [showAddModal, setShowAddModal] = React.useState(false);
  // showMessageModal: Controls the visibility of the MessageModal.
  const [showMessageModal, setShowMessageModal] = React.useState(false);
  // showConfirmModal: Controls the visibility of the ConfirmModal.
  const [showConfirmModal, setShowConfirmModal] = React.useState(false);
  // message: Stores the text and error status for the MessageModal.
  const [message, setMessage] = React.useState({ text: '', isError: false });
  // confirmAction: Stores the callback function to execute upon confirmation in ConfirmModal.
  const [confirmAction, setConfirmAction] = React.useState(null);
  // confirmMessage: Stores the message to display in the ConfirmModal.
  const [confirmMessage, setConfirmMessage] = React.useState('');

  // --- Conditional Rendering for Authentication and Loading States ---
  // If no user is authenticated, render nothing (the authentication screen will be handled elsewhere).
  if (!currentUser) return null;
  // If transaction data is loading, display a loading indicator.
  if (loading) return <LoadingIndicator />;

  /**
   * showMessage Function
   *
   * A helper function to set the message modal's content and open it.
   * @param {string} text - The message text to display.
   * @param {boolean} [isError=false] - True if the message indicates an error, false otherwise.
   */
  const showMessage = (text, isError = false) => {
    setMessage({ text, isError }); // Set the message content
    setShowMessageModal(true); // Open the message modal
  };

  /**
   * showConfirm Function
   *
   * A helper function to set the confirmation modal's content, action, and open it.
   * @param {string} message - The confirmation message to display.
   * @param {function} action - The callback function to execute if the user confirms.
   */
  const showConfirm = (message, action) => {
    setConfirmMessage(message); // Set the confirmation message
    setConfirmAction(() => action); // Store the action callback
    setShowConfirmModal(true); // Open the confirmation modal
  };

  // --- Main Component Render ---
  return (
    // Main container for the authenticated application content, with a max-width.
    <div className="w-full max-w-md">
      {/* Header section displaying user information and sign-out button. */}
      <header className="mb-6 text-center bg-white p-4 rounded-xl shadow-lg">
        {/* UserInfo component: displays current user details and handles sign-out. */}
        <UserInfo user={currentUser} onSignOut={signOutUser} />
      </header>

      {/* Main content area, styled with a white background, rounded corners, and shadow. */}
      <div className="bg-white rounded-xl shadow-2xl p-6">
        {/* OverviewSection component: displays total income, expenses, and balance. */}
        <OverviewSection />
        {/* Button to open the Add New Transaction modal. */}
        <div className="mb-6">
          <button 
            onClick={() => setShowAddModal(true)} // Set state to open the AddTransactionModal
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition duration-150 ease-in-out transform hover:scale-105"
          >
            Add New Transaction
          </button>
        </div>
        {/* TransactionsSection component: displays the list of transactions. */}
        {/* Passes showConfirm and showMessage functions for interaction within the section. */}
        <TransactionsSection 
          showConfirm={showConfirm}
          showMessage={showMessage}
        />
      </div>

      {/* AddTransactionModal: conditionally rendered based on showAddModal state. */}
      <AddTransactionModal 
        isOpen={showAddModal} // Controls modal visibility
        onClose={() => setShowAddModal(false)} // Callback to close the modal
        showMessage={showMessage} // Passes the showMessage helper function
      />

      {/* MessageModal: conditionally rendered based on showMessageModal state. */}
      <MessageModal 
        isOpen={showMessageModal} // Controls modal visibility
        message={message.text} // Message text to display
        isError={message.isError} // Error status of the message
        onClose={() => setShowMessageModal(false)} // Callback to close the modal
      />

      {/* ConfirmModal: conditionally rendered based on showConfirmModal state. */}
      <ConfirmModal 
        isOpen={showConfirmModal} // Controls modal visibility
        message={confirmMessage} // Confirmation message to display
        onConfirm={confirmAction} // Callback to execute on confirmation
        onCancel={() => setShowConfirmModal(false)} // Callback to cancel and close the modal
      />
    </div>
  );
};

export default AppContainer; // Export the AppContainer component for use in other parts of the application
