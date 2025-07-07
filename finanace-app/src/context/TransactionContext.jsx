import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, appId } from '../firebase';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';

const TransactionContext = createContext();

export function useTransactions() {
  return useContext(TransactionContext);
}

export function TransactionProvider({ children }) {
  const [transactions, setTransactions] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();

  const incomeCategories = ["Salary", "Business", "Freelance", "Gifts", "Other"];
  const expenseCategories = ["Food", "Transport", "Rent", "Utilities", "Entertainment", "Health", "Shopping", "Education", "Other"];

  useEffect(() => {
    if (!currentUser) return;

    const loadTransactions = async () => {
      setLoading(true);
      try {
        const transactionsCol = collection(db, `artifacts/${appId}/users/${currentUser.uid}/transactions`);
        const q = query(transactionsCol);

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const transactionsData = [];
          querySnapshot.forEach((doc) => {
            transactionsData.push({ id: doc.id, ...doc.data() });
          });
          transactionsData.sort((a, b) => b.date.toDate().getTime() - a.date.toDate().getTime());
          setTransactions(transactionsData);
          setLoading(false);
        });

        return unsubscribe;
      } catch (error) {
        console.error("Error loading transactions:", error);
        setLoading(false);
      }
    };

    loadTransactions();
  }, [currentUser]);

  const addTransaction = async (transaction) => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      await addDoc(collection(db, `artifacts/${appId}/users/${currentUser.uid}/transactions`), {
        ...transaction,
        date: Timestamp.fromDate(new Date(transaction.date)),
        createdAt: Timestamp.now()
      });
      return true;
    } catch (error) {
      console.error("Error adding transaction:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteTransaction = async (transactionId) => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      await deleteDoc(doc(db, `artifacts/${appId}/users/${currentUser.uid}/transactions`, transactionId));
      return true;
    } catch (error) {
      console.error("Error deleting transaction:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const changeMonth = (delta) => {
    setCurrentMonth(prev => {
      let newMonth = prev + delta;
      let newYear = currentYear;
      
      if (newMonth < 0) {
        newMonth = 11;
        newYear--;
      } else if (newMonth > 11) {
        newMonth = 0;
        newYear++;
      }
      
      setCurrentYear(newYear);
      return newMonth;
    });
  };

  const value = {
    transactions,
    currentMonth,
    currentYear,
    incomeCategories,
    expenseCategories,
    addTransaction,
    deleteTransaction,
    changeMonth,
    loading
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
}