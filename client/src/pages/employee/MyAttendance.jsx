import { useState, useEffect } from 'react';
import { Clock, LogIn, LogOut, Calendar } from 'lucide-react';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate, formatDateTime } from '../../utils/formatters';

const MyAttendance = () => {
  const [records, setRecords] = useState([]);
  const [todayStatus, setTodayStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [recordsRes, todayRes] = await Promise.all([
        api.get('/attendance/me', { params: filters }),
        api.get('/attendance/today'),
      ]);
      setRecords(recordsRes.data);
      setTodayStatus(todayRes.data);
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  const handleCheckIn = async () => {
    setChecking(true);
    try {
      await api.post('/attendance/checkin');
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Check-in failed');
    } finally {
      setChecking(false);
    }
  };

  const handleCheckOut = async () => {
    setChecking(true);
    try {
      await api.post('/attendance/checkout');
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Check-out failed');
    } finally {
      setChecking(false);
    }
  };

  // Calculate stats
  const stats = {
    present: records.filter(r => r.status === 'present').length,
    halfDay: records.filter(r => r.status === 'half-day').length,
    onLeave: records.filter(r => r.status === 'on-leave').length,
    absent: records.filter(r => r.status === 'absent').length,
  };

  const isCheckedIn = todayStatus?.checkIn;
  const isCheckedOut = todayStatus?.checkOut;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-secondary-900">My Attendance</h2>
        <p className="text-secondary-600">Track your daily attendance and working hours</p>
      </div>

      {/* Today's Action Card */}
      <div className="card bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-primary-900">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </h3>
            <p className="text-primary-700 mt-1">
              Status: <Badge status={todayStatus?.status || 'absent'}>{todayStatus?.status || 'Not checked in'}</Badge>
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {isCheckedIn && (
              <div className="text-sm text-primary-800">
                <p>Check In: {formatDateTime(todayStatus.checkIn).split(',')[1]}</p>
                {isCheckedOut && (
                  <p>Check Out: {formatDateTime(todayStatus.checkOut).split(',')[1]}</p>
                )}
              </div>
            )}
            
            {!isCheckedIn ? (
              <button
                onClick={handleCheckIn}
                disabled={checking}
                className="btn-success"
              >
                <LogIn className="w-4 h-4 mr-2" />
                {checking ? 'Checking in...' : 'Check In'}
              </button>
            ) : !isCheckedOut ? (
              <button
                onClick={handleCheckOut}
                disabled={checking}
                className="btn-danger"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {checking ? 'Checking out...' : 'Check Out'}
              </button>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg">
                <Clock className="w-5 h-5" />
                <span className="font-medium">
                  {todayStatus.hoursWorked} hrs worked
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <p className="text-2xl font-bold text-green-600">{stats.present}</p>
          <p className="text-sm text-secondary-600">Present</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-yellow-600">{stats.halfDay}</p>
          <p className="text-sm text-secondary-600">Half Day</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.onLeave}</p>
          <p className="text-sm text-secondary-600">On Leave</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
          <p className="text-sm text-secondary-600">Absent</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <select
          value={filters.month}
          onChange={(e) => setFilters({ ...filters, month: e.target.value })}
          className="input w-40"
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {new Date(2024, i).toLocaleString('default', { month: 'long' })}
            </option>
          ))}
        </select>
        <input
          type="number"
          value={filters.year}
          onChange={(e) => setFilters({ ...filters, year: e.target.value })}
          className="input w-28"
          placeholder="Year"
        />
      </div>

      {/* Attendance Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Hours</th>
              <th>Status</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-8">
                  <LoadingSpinner />
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-secondary-500">
                  No attendance records for this period
                </td>
              </tr>
            ) : (
              records.map((record) => (
                <tr key={record._id}>
                  <td>{formatDate(record.date)}</td>
                  <td>{record.checkIn ? formatDateTime(record.checkIn).split(',')[1] : '-'}</td>
                  <td>{record.checkOut ? formatDateTime(record.checkOut).split(',')[1] : '-'}</td>
                  <td>{record.hoursWorked || '-'}</td>
                  <td>
                    <Badge status={record.status}>{record.status}</Badge>
                  </td>
                  <td className="text-secondary-500">{record.notes || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyAttendance;
