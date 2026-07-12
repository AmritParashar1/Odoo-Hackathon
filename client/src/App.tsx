import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

import { Login } from './features/auth/Login';
import { Signup } from './features/auth/Signup';
import { DashboardLayout } from './components/layout/DashboardLayout';

const Dashboard = () => (
  <div className="grid gap-6">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground mt-1">Welcome back to AssetFlow! Here's an overview of your resources.</p>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="p-6 rounded-xl border border-border bg-card shadow-sm">
        <h3 className="text-sm font-medium text-muted-foreground">Total Assets</h3>
        <p className="text-3xl font-bold mt-2">1,248</p>
      </div>
      <div className="p-6 rounded-xl border border-border bg-card shadow-sm">
        <h3 className="text-sm font-medium text-muted-foreground">Active Allocations</h3>
        <p className="text-3xl font-bold mt-2">856</p>
      </div>
      <div className="p-6 rounded-xl border border-border bg-card shadow-sm">
        <h3 className="text-sm font-medium text-muted-foreground">Pending Transfers</h3>
        <p className="text-3xl font-bold mt-2 text-primary">24</p>
      </div>
      <div className="p-6 rounded-xl border border-border bg-card shadow-sm">
        <h3 className="text-sm font-medium text-muted-foreground">Under Maintenance</h3>
        <p className="text-3xl font-bold mt-2 text-destructive">12</p>
      </div>
    </div>
  </div>
);

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
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
