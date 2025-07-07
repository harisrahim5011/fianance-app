import React from 'react';

const UserInfo = ({ user, onSignOut }) => {
  const firstLetter = user.displayName?.charAt(0) || 'U';
  const photoUrl = user.photoURL || `https://placehold.co/40x40/E2E8F0/4A5568?text=${firstLetter}`;

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <img 
          src={photoUrl} 
          className="w-10 h-10 rounded-full mr-4" 
          alt="User"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://placehold.co/40x40/E2E8F0/4A5568?text=${firstLetter}`;
          }}
        />
        <div>
          <p className="font-semibold text-gray-800 text-left">{user.displayName || 'Guest User'}</p>
          <p className="text-sm text-gray-500 text-left">User ID: {user.uid}</p>
        </div>
      </div>
      <button 
        onClick={onSignOut}
        className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
      >
        Sign Out
      </button>
    </div>
  );
};

export default UserInfo;