import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/auth/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import Employees from './pages/admin/Employees';
import AdminAttendance from './pages/admin/AdminAttendance';
import AdminLeaves from './pages/admin/AdminLeaves';
import AdminPayroll from './pages/admin/AdminPayroll';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import MyAttendance from './pages/employee/MyAttendance';
import MyLeaves from './pages/employee/MyLeaves';
import MyPayslips from './pages/employee/MyPayslips';
import MyProfile from './pages/employee/MyProfile';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          
          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="employees" element={<Employees />} />
            <Route path="attendance" element={<AdminAttendance />} />
            <Route path="leaves" element={<AdminLeaves />} />
            <Route path="payroll" element={<AdminPayroll />} />
          </Route>
          
          {/* Employee Routes */}
          <Route
            path="/employee"
            element={
              <ProtectedRoute allowedRoles={['employee']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<EmployeeDashboard />} />
            <Route path="attendance" element={<MyAttendance />} />
            <Route path="leaves" element={<MyLeaves />} />
            <Route path="payslips" element={<MyPayslips />} />
            <Route path="profile" element={<MyProfile />} />
          </Route>
          
          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
