import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const pageTitles = {
  '/admin': 'Dashboard',
  '/admin/employees': 'Employee Management',
  '/admin/attendance': 'Attendance Records',
  '/admin/leaves': 'Leave Requests',
  '/admin/payroll': 'Payroll Management',
  '/employee': 'My Dashboard',
  '/employee/attendance': 'My Attendance',
  '/employee/leaves': 'My Leaves',
  '/employee/payslips': 'My Payslips',
  '/employee/profile': 'My Profile',
};

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  
  const title = pageTitles[location.pathname] || 'Dashboard';

  return (
    <div className="min-h-screen bg-secondary-50 flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full">
            <Sidebar />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          title={title} 
          onMenuClick={() => setSidebarOpen(true)} 
        />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
