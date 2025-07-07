import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTransactions } from '../context/TransactionContext';
import UserInfo from './UserInfo';
import OverviewSection from './OverviewSection';
import TransactionsSection from './TransactionsSection';
import AddTransactionModal from './AddTransactionModal';
import MessageModal from './MessageModal';
import ConfirmModal from './ConfirmModal';
import LoadingIndicator from './LoadingIndicator';

const AppContainer = () => {
  const { currentUser, signOutUser } = useAuth();
  const { loading } = useTransactions();
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [showMessageModal, setShowMessageModal] = React.useState(false);
  const [showConfirmModal, setShowConfirmModal] = React.useState(false);
  const [message, setMessage] = React.useState({ text: '', isError: false });
  const [confirmAction, setConfirmAction] = React.useState(null);
  const [confirmMessage, setConfirmMessage] = React.useState('');

  if (!currentUser) return null;
  if (loading) return <LoadingIndicator />;

  const showMessage = (text, isError = false) => {
    setMessage({ text, isError });
    setShowMessageModal(true);
  };

  const showConfirm = (message, action) => {
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setShowConfirmModal(true);
  };

  return (
    <div className="w-full max-w-md">
      <header className="mb-6 text-center bg-white p-4 rounded-xl shadow-lg">
        <UserInfo user={currentUser} onSignOut={signOutUser} />
      </header>

      <div className="bg-white rounded-xl shadow-2xl p-6">
        <OverviewSection />
        <div className="mb-6">
          <button 
            onClick={() => setShowAddModal(true)}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition duration-150 ease-in-out transform hover:scale-105"
          >
            Add New Transaction
          </button>
        </div>
        <TransactionsSection 
          showConfirm={showConfirm}
          showMessage={showMessage}
        />
      </div>

      <AddTransactionModal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        showMessage={showMessage}
      />

      <MessageModal 
        isOpen={showMessageModal}
        message={message.text}
        isError={message.isError}
        onClose={() => setShowMessageModal(false)}
      />

      <ConfirmModal 
        isOpen={showConfirmModal}
        message={confirmMessage}
        onConfirm={confirmAction}
        onCancel={() => setShowConfirmModal(false)}
      />
    </div>
  );
};

export default AppContainer;