import React, { createContext, useEffect, useState } from "react";
import { auth, provider } from "../firebase"; // Assuming 'auth' and 'provider' are Firebase instances from '../firebase'
import { signInWithPopup, signOut } from "firebase/auth"; // Firebase authentication methods

/**
 * AuthContext
 *
 * This React Context is used to provide authentication-related state and functions
 * to all components wrapped by the AuthProvider.
 */
export const AuthContext = createContext();

// The commented-out useAuth hook is typically used to consume the AuthContext.
// It's a common pattern to create a custom hook for easier context consumption.
// export function useAuth() {
//   return useContext(AuthContext);
// }

/**
 * AuthProvider Component
 *
 * This component acts as a provider for the AuthContext. It manages the authentication state
 * (currentUser, loading) and provides functions for signing in and signing out.
 * All child components wrapped by AuthProvider will have access to these values.
 *
 * @param {object} props - The component's props.
 * @param {React.ReactNode} props.children - The child components that will consume the AuthContext.
 */
export function AuthProvider({ children }) {
  // currentUser: Stores the authenticated user object from Firebase, or null if no user is signed in.
  const [currentUser, setCurrentUser] = useState(null);
  // loading: A boolean flag indicating whether an authentication operation is in progress (e.g., initial check, sign-in, sign-out).
  const [loading, setLoading] = useState(true);

  /**
   * useEffect Hook for Authentication State Changes
   *
   * This effect sets up an observer on Firebase authentication state changes.
   * It runs once on component mount and cleans up the observer on unmount.
   */
  useEffect(() => {
    // onAuthStateChanged returns an unsubscribe function.
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user); // Update currentUser state based on Firebase auth state
      setLoading(false); // Set loading to false once the initial auth state is determined
    });

    // Cleanup function: unsubscribe from the auth state listener when the component unmounts.
    return unsubscribe;
  }, []); // Empty dependency array ensures this effect runs only once on mount.

  /**
   * signInWithGoogle Function
   *
   * Initiates the Google sign-in process using a Firebase popup.
   * Sets loading state to true during the operation and handles potential errors.
   */
  const signInWithGoogle = async () => {
    setLoading(true); // Start loading indicator
    try {
      await signInWithPopup(auth, provider); // Perform Google sign-in with popup
      // The onAuthStateChanged listener will automatically update currentUser and loading states on success.
    } catch (error) {
      console.error("Error signing in with Google:", error); // Log any errors during sign-in
    } finally {
      // Note: In a typical setup, setLoading(false) might be called here,
      // but onAuthStateChanged also sets loading to false, so it's handled.
      // If there's an error and onAuthStateChanged doesn't fire, the spinner might stick.
      // For robustness, consider adding setLoading(false) here or ensuring error handling
      // in the consuming component also hides the spinner.
    }
  };

  /**
   * signOutUser Function
   *
   * Initiates the user sign-out process from Firebase.
   * Sets loading state to true during the operation and handles potential errors.
   */
  const signOutUser = async () => {
    setLoading(true); // Start loading indicator
    try {
      await signOut(auth); // Perform user sign-out
      // The onAuthStateChanged listener will automatically update currentUser to null and loading to false on success.
    } catch (error) {
      console.error("Error signing out:", error); // Log any errors during sign-out
    } finally {
      // Similar to signInWithGoogle, ensure loading is set to false here if onAuthStateChanged
      // doesn't reliably handle it for all error/success paths.
    }
  };

  // The value object containing the authentication state and functions to be provided by the context.
  const value = {
    currentUser,
    signInWithGoogle,
    signOutUser,
    loading,
  };

  // Render the AuthContext.Provider, making the 'value' available to its children.
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
