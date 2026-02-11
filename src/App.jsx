"use client";

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/Dashboard";

const ProtectedRoute = ({ children }) => {
  const username = localStorage.getItem("user-name");

  // Not logged in → go login
  if (!username) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />

        {/* ✔ ANY LOGGED-IN USER CAN ACCESS THIS */}
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="/admin/*" element={<Navigate to="/dashboard/admin" replace />} />

      </Routes>
    </Router>
  );
}

export default App;
