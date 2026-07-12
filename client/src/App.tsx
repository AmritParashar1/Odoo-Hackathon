import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

import { Login } from './features/auth/Login';
import { Signup } from './features/auth/Signup';
import { Dashboard } from './features/dashboard/Dashboard';
import { AssetsList } from './features/assets/AssetsList';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { TransfersList } from './features/transfers/TransfersList';
import { BookingsList } from './features/bookings/BookingsList';
import { MaintenanceList } from './features/maintenance/MaintenanceList';
import { DepartmentsList } from './features/departments/DepartmentsList';
import { UsersList } from './features/users/UsersList';
import { AuditsList } from './features/audits/AuditsList';
import { ReportsDashboard } from './features/reports/ReportsDashboard';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="assets" element={<AssetsList />} />
          <Route path="transfers" element={<TransfersList />} />
          <Route path="bookings" element={<BookingsList />} />
          <Route path="maintenance" element={<MaintenanceList />} />
          <Route path="departments" element={<DepartmentsList />} />
          <Route path="users" element={<UsersList />} />
          <Route path="audits" element={<AuditsList />} />
          <Route path="reports" element={<ReportsDashboard />} />
          <Route path="*" element={<div className="p-8 text-center text-muted-foreground">This feature is under construction. Navigate back to Dashboard or Assets.</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
