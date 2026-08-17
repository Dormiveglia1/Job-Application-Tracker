import { Navigate, Route, Routes } from "react-router-dom";
import ApplicationsPage from "./pages/ApplicationsPage";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AddApplicationPage from "./pages/AddApplicationPage";
import EditApplicationPage from "./pages/EditApplicationPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/applications"
        element={
          <ProtectedRoute>
            <ApplicationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/applications/new"
        element={
          <ProtectedRoute>
            <AddApplicationPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/applications/:applicationId/edit"
        element={
          <ProtectedRoute>
            <EditApplicationPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
