import React from 'react';
import AuthContainer from './context/AuthContainer';
import AppContainer from './context/AppContainer';
import { AuthProvider } from './context/AuthContext';
import { TransactionProvider } from './context/TransactionContext';

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <AuthContainer />
        <TransactionProvider>
          <AppContainer />
        </TransactionProvider>
      </div>
    </AuthProvider>
  );
}

export default App;