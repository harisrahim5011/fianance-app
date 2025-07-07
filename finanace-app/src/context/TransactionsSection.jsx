import React from 'react';
import { useTransactions } from '../context/TransactionContext';

const TransactionsSection = ({ showConfirm, showMessage }) => {
  const { transactions, currentMonth, currentYear, deleteTransaction } = useTransactions();
  
  // Filter transactions for current month
  const monthStart = new Date(currentYear, currentMonth, 1);
  const monthEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);
  
  const filteredTransactions = transactions.filter(t => {
    const transactionDate = t.date.toDate();
    return transactionDate >= monthStart && transactionDate <= monthEnd;
  });

  const handleDelete = (id) => {
    showConfirm("Are you sure you want to delete this transaction?", async () => {
      const success = await deleteTransaction(id);
      if (success) {
        showMessage("Transaction deleted successfully.");
      } else {
        showMessage("Failed to delete transaction.", true);
      }
    });
  };

  return (
    <section>
      <h3 className="text-lg font-semibold text-gray-700 mb-3">Monthly Transactions</h3>
      <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
        {filteredTransactions.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No transactions for this month.</p>
        ) : (
          filteredTransactions.map(t => (
            <div 
              key={t.id} 
              className={`p-3 mb-2 rounded-lg shadow flex justify-between items-center ${
                t.type === 'income' 
                  ? 'bg-green-100 border-l-4 border-green-500' 
                  : 'bg-red-100 border-l-4 border-red-500'
              }`}
            >
              <div>
                <p className="font-semibold text-lg">{t.category}</p>
                <p className="text-sm text-gray-600">
                  {t.date.toDate().toLocaleDateString()} - QAR {t.amount.toFixed(2)}
                </p>
              </div>
              <button 
                onClick={() => handleDelete(t.id)}
                className="delete-btn text-red-500 hover:text-red-700 font-semibold p-1 rounded-full"
              >
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

export default TransactionsSection;