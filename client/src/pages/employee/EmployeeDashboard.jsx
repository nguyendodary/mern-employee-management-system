import { useState, useEffect } from 'react';
import { Clock, Calendar, FileText, CheckCircle, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate, formatDateTime, formatCurrency, getLeaveTypeLabel } from '../../utils/formatters';

const EmployeeDashboard = () => {
  const { employeeProfile } = useAuth();
  const [todayStatus, setTodayStatus] = useState(null);
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [recentPayslips, setRecentPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [todayRes, leavesRes, payslipsRes] = await Promise.all([
        api.get('/attendance/today'),
        api.get('/leaves/me'),
        api.get('/payroll/me'),
      ]);
      
      setTodayStatus(todayRes.data);
      setRecentLeaves(leavesRes.data.slice(0, 3));
      setRecentPayslips(payslipsRes.data.slice(0, 3));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      await api.post('/attendance/checkin');
      fetchDashboardData();
    } catch (error) {
      alert(error.response?.data?.message || 'Check-in failed');
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    setCheckingIn(true);
    try {
      await api.post('/attendance/checkout');
      fetchDashboardData();
    } catch (error) {
      alert(error.response?.data?.message || 'Check-out failed');
    } finally {
      setCheckingIn(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  const isCheckedIn = todayStatus?.checkIn;
  const isCheckedOut = todayStatus?.checkOut;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="card bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
        <h2 className="text-2xl font-bold text-primary-900">
          Welcome back, {employeeProfile?.user?.name?.split(' ')[0]}!
        </h2>
        <p className="text-primary-700 mt-1">
          {employeeProfile?.designation} • {employeeProfile?.department}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Check In/Out Card */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-secondary-900">Today's Attendance</h3>
            <Clock className="w-5 h-5 text-secondary-400" />
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-secondary-600">Status</span>
              <Badge status={todayStatus?.status || 'absent'}>
                {todayStatus?.status || 'Not checked in'}
              </Badge>
            </div>
            
            {isCheckedIn && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-secondary-600">Check In</span>
                <span className="font-medium">
                  {formatDateTime(todayStatus.checkIn).split(',')[1]}
                </span>
              </div>
            )}
            
            {isCheckedOut && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-secondary-600">Check Out</span>
                <span className="font-medium">
                  {formatDateTime(todayStatus.checkOut).split(',')[1]}
                </span>
              </div>
            )}

            <div className="pt-2">
              {!isCheckedIn ? (
                <button
                  onClick={handleCheckIn}
                  disabled={checkingIn}
                  className="btn-success w-full"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  {checkingIn ? 'Checking in...' : 'Check In'}
                </button>
              ) : !isCheckedOut ? (
                <button
                  onClick={handleCheckOut}
                  disabled={checkingIn}
                  className="btn-danger w-full"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {checkingIn ? 'Checking out...' : 'Check Out'}
                </button>
              ) : (
                <div className="flex items-center justify-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Attendance completed for today</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Summary */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-secondary-900">Profile Summary</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-secondary-600">Employee ID</span>
              <span className="font-medium">{employeeProfile?.employeeId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary-600">Department</span>
              <span className="font-medium">{employeeProfile?.department}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary-600">Designation</span>
              <span className="font-medium">{employeeProfile?.designation}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary-600">Join Date</span>
              <span className="font-medium">{formatDate(employeeProfile?.dateOfJoining)}</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-secondary-900">Quick Stats</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-secondary-50 rounded-lg">
              <Calendar className="w-5 h-5 text-primary-600" />
              <div>
                <p className="text-lg font-bold text-secondary-900">{recentLeaves.length}</p>
                <p className="text-xs text-secondary-600">Recent Leave Requests</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-secondary-50 rounded-lg">
              <FileText className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-lg font-bold text-secondary-900">{recentPayslips.length}</p>
                <p className="text-xs text-secondary-600">Available Payslips</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leaves */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-secondary-900">Recent Leave Requests</h3>
            <Calendar className="w-5 h-5 text-secondary-400" />
          </div>
          
          {recentLeaves.length > 0 ? (
            <div className="space-y-3">
              {recentLeaves.map((leave) => (
                <div 
                  key={leave._id}
                  className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-secondary-900">
                      {getLeaveTypeLabel(leave.leaveType)}
                    </p>
                    <p className="text-sm text-secondary-600">
                      {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                    </p>
                  </div>
                  <Badge status={leave.status}>{leave.status}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-secondary-500 text-center py-4">
              No leave requests yet
            </p>
          )}
        </div>

        {/* Recent Payslips */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-secondary-900">Recent Payslips</h3>
            <FileText className="w-5 h-5 text-secondary-400" />
          </div>
          
          {recentPayslips.length > 0 ? (
            <div className="space-y-3">
              {recentPayslips.map((payslip) => (
                <div 
                  key={payslip._id}
                  className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-secondary-900">
                      {new Date(2024, payslip.month - 1).toLocaleString('default', { month: 'long' })} {payslip.year}
                    </p>
                    <p className="text-sm text-secondary-600">
                      Net: {formatCurrency(payslip.netSalary)}
                    </p>
                  </div>
                  <Badge status={payslip.status}>{payslip.status}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-secondary-500 text-center py-4">
              No payslips available yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
