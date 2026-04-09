import { useEffect, useState } from 'react';
import { Users, Clock, Calendar, CreditCard, TrendingUp } from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import api from '../../services/api';
import { formatDate, getLeaveTypeLabel } from '../../utils/formatters';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard/admin');
      setStats(response.data);
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (error) return <div className="text-red-600 text-center py-8">{error}</div>;

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Employees"
          value={stats?.totalEmployees || 0}
          icon={Users}
          color="primary"
        />
        <StatCard
          title="Present Today"
          value={stats?.presentToday || 0}
          icon={Clock}
          trend={`of ${stats?.totalEmployees || 0} employees`}
          color="success"
        />
        <StatCard
          title="Pending Leaves"
          value={stats?.pendingLeaves || 0}
          icon={Calendar}
          color="warning"
        />
        <StatCard
          title="Total Payroll Paid"
          value={`$${(stats?.totalPayrollPaid || 0).toLocaleString()}`}
          icon={CreditCard}
          color="info"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leave Requests */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-secondary-900">
              Recent Leave Requests
            </h3>
            <TrendingUp className="w-5 h-5 text-secondary-400" />
          </div>
          
          {stats?.recentLeaves?.length > 0 ? (
            <div className="space-y-3">
              {stats.recentLeaves.map((leave) => (
                <div 
                  key={leave._id}
                  className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-secondary-900">
                      {leave.employee?.user?.name}
                    </p>
                    <p className="text-sm text-secondary-600">
                      {getLeaveTypeLabel(leave.leaveType)} • {leave.totalDays} day(s)
                    </p>
                  </div>
                  <Badge status={leave.status}>{leave.status}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-secondary-500 text-center py-4">
              No pending leave requests
            </p>
          )}
        </div>

        {/* Attendance Trend */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-secondary-900">
              Attendance Trend (Last 7 Days)
            </h3>
            <Clock className="w-5 h-5 text-secondary-400" />
          </div>
          
          {stats?.attendanceTrend?.length > 0 ? (
            <div className="space-y-3">
              {stats.attendanceTrend.map((day, index) => (
                <div key={index} className="flex items-center gap-4">
                  <span className="text-sm text-secondary-600 w-24">
                    {formatDate(day.date)}
                  </span>
                  <div className="flex-1 bg-secondary-100 rounded-full h-2">
                    <div 
                      className="bg-primary-500 h-2 rounded-full transition-all"
                      style={{ 
                        width: `${(day.present / (stats.totalEmployees || 1)) * 100}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-secondary-900 w-12 text-right">
                    {day.present}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-secondary-500 text-center py-4">
              No attendance data available
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
