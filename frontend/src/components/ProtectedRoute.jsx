import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  console.log("1. ProtectedRoute is running!");
  
  const token = localStorage.getItem('token');
  console.log("2. Token found in localStorage:", token);

  // Check if token is strictly null or undefined
  if (!token || token === 'undefined') {
    console.log("3. No valid token! Redirecting to /login...");
    return <Navigate to="/login" replace />;
  }

  console.log("4. Token is valid! Rendering the Dashboard...");
  return children;
};

export default ProtectedRoute;