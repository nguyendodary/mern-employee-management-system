import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  Calendar, 
  CreditCard, 
  LogOut,
  User,
  CheckCircle,
  FileText
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const adminLinks = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/employees', icon: Users, label: 'Employees' },
  { to: '/admin/attendance', icon: Clock, label: 'Attendance' },
  { to: '/admin/leaves', icon: Calendar, label: 'Leave Requests' },
  { to: '/admin/payroll', icon: CreditCard, label: 'Payroll' },
];

const employeeLinks = [
  { to: '/employee', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/employee/attendance', icon: CheckCircle, label: 'My Attendance' },
  { to: '/employee/leaves', icon: Calendar, label: 'My Leaves' },
  { to: '/employee/payslips', icon: FileText, label: 'My Payslips' },
  { to: '/employee/profile', icon: User, label: 'My Profile' },
];

const Sidebar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const links = isAdmin ? adminLinks : employeeLinks;

  return (
    <aside className="w-64 bg-white border-r border-secondary-200 min-h-screen flex flex-col">
      <div className="p-6 border-b border-secondary-200">
        <h1 className="text-xl font-bold text-primary-700">EMS</h1>
        <p className="text-xs text-secondary-500 mt-1">Employee Management</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/admin' || link.to === '/employee'}
            className={({ isActive }) => 
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <link.icon className="w-5 h-5" />
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-secondary-200">
        <div className="flex items-center gap-3 mb-4 px-4 py-2">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
            <User className="w-4 h-4 text-primary-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-secondary-900 truncate">
              {user?.name}
            </p>
            <p className="text-xs text-secondary-500 capitalize">
              {user?.role}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="sidebar-link w-full text-left"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
