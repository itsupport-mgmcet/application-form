import { Routes, Route } from 'react-router-dom';
import ApplicationForm from './pages/ApplicationForm';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import ProtectedRoute from './pages/ProtectedRoute';
import Success from './pages/Success';
import { Toaster } from 'react-hot-toast';
import NotFound from './pages/NotFound';
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react"

export default function App() {
  return (
    <>
      {/* 2. Add the Toaster component here */}
      <Toaster position="top-center" reverseOrder={false} />

      {/*  insights vercel */}
      <SpeedInsights />
      <Analytics />
      
      <Routes>
        <Route path="/" element={<ApplicationForm />} />
        <Route path="/admin/login" element={<Login />} />
        <Route path="/success" element={<Success />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}