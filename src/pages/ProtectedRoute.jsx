import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();

  if (!currentUser) {
    // If no user is logged in, redirect them to the login page
    return <Navigate to="/admin/login" />;
  }

  // If a user is logged in, show the admin pannel
  return children;
}