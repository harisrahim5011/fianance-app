import React from 'react';
import { useTransactions } from '../context/TransactionContext';

const OverviewSection = () => {
  const { transactions, currentMonth, currentYear, changeMonth } = useTransactions();
  
  const monthYear = new Date(currentYear, currentMonth).toLocaleString('default', { 
    month: 'long', 
    year: 'numeric' 
  });
  
  // Filter transactions for current month
  const monthStart = new Date(currentYear, currentMonth, 1);
  const monthEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);
  
  const filteredTransactions = transactions.filter(t => {
    const transactionDate = t.date.toDate();
    return transactionDate >= monthStart && transactionDate <= monthEnd;
  });
  
  // Calculate totals
  let totalIncome = 0;
  let totalExpenses = 0;
  
  filteredTransactions.forEach(t => {
    if (t.type === 'income') totalIncome += t.amount;
    else totalExpenses += t.amount;
  });
  
  const balance = totalIncome - totalExpenses;

  return (
    <section className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={() => changeMonth(-1)}
          className="p-2 rounded-full hover:bg-gray-200 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6 text-gray-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h2 className="text-xl font-semibold text-gray-700">{monthYear}</h2>
        <button 
          onClick={() => changeMonth(1)}
          className="p-2 rounded-full hover:bg-gray-200 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6 text-gray-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-4 text-center">
        <div className="bg-green-50 p-4 rounded-lg shadow">
          <p className="text-sm text-green-700 font-medium">Total Income</p>
          <p className="text-xl font-bold text-green-600">QAR {totalIncome.toFixed(2)}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg shadow">
          <p className="text-sm text-red-700 font-medium">Total Expenses</p>
          <p className="text-xl font-bold text-red-600">QAR {totalExpenses.toFixed(2)}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg shadow">
          <p className="text-sm text-blue-700 font-medium">Balance</p>
          <p className={`text-xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            QAR {Math.abs(balance).toFixed(2)}
          </p>
        </div>
      </div>
    </section>
  );
};

export default OverviewSection;