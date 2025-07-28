import React from 'react';

/**
 * UserInfo Component
 *
 * This component displays the authenticated user's profile information,
 * including their display name, profile picture, and user ID.
 * It also provides a button to sign out the user.
 *
 * @param {object} props - The component's props.
 * @param {object} props.user - The user object, typically from Firebase Authentication,
 * containing properties like `displayName`, `photoURL`, and `uid`.
 * @param {function} props.onSignOut - A callback function to be executed when the sign-out button is clicked.
 */
const UserInfo = ({ user, onSignOut }) => {
  // Safely get the first letter of the user's display name for a placeholder image.
  // If displayName is null or undefined, default to 'U'.
  const firstLetter = user.displayName?.charAt(0) || 'U';
  
  // Determine the photo URL. Use the user's photoURL if available,
  // otherwise generate a placeholder image URL with the first letter of their name.
  const photoUrl = user.photoURL || `https://placehold.co/40x40/E2E8F0/4A5568?text=${firstLetter}`;

  // --- Component JSX Structure ---
  return (
    // Container for user information, styled with flexbox for alignment.
    <div className="flex items-center justify-between">
      {/* Left section: user photo and name/ID. */}
      <div className="flex items-center">
        {/* User profile image. */}
        <img 
          src={photoUrl} // Source of the image (actual photo or placeholder)
          className="w-10 h-10 rounded-full mr-4" // Tailwind classes for styling
          alt="User" // Alt text for accessibility
          // onError handler: if the image fails to load, replace its source with a placeholder.
          onError={(e) => {
            e.target.onerror = null; // Prevent infinite loop if placeholder also fails
            e.target.src = `https://placehold.co/40x40/E2E8F0/4A5568?text=${firstLetter}`; // Fallback placeholder
          }}
        />
        {/* Container for user's name and ID. */}
        <div>
          {/* User's display name. If null, default to 'Guest User'. */}
          <p className="font-semibold text-gray-800 text-left">{user.displayName || 'Guest User'}</p>
          {/* User's unique ID. */}
          <p className="text-sm text-gray-500 text-left">User ID: {user.uid}</p>
        </div>
      </div>
      {/* Right section: Sign Out button. */}
      <button 
        onClick={onSignOut} // Triggers the onSignOut callback when clicked.
        className="text-sm text-blue-600 hover:text-blue-800 font-semibold" // Tailwind classes for styling
      >
        Sign Out
      </button>
    </div>
  );
};

export default UserInfo; // Export the UserInfo component for use in other parts of the application.
