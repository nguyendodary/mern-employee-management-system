import { useState, useEffect } from 'react';
import { Calendar, Filter, Download } from 'lucide-react';
import api from '../../services/api';
import Pagination from '../../components/common/Pagination';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDateTime, formatDate } from '../../utils/formatters';

const AdminAttendance = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState({
    date: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  const fetchAttendance = async (page = 1) => {
    try {
      setLoading(true);
      const params = { page, limit: 20 };
      if (filters.date) params.date = filters.date;
      if (filters.month) params.month = filters.month;
      if (filters.year) params.year = filters.year;

      const response = await api.get('/attendance', { params });
      setRecords(response.data.records);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [filters]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-secondary-900">Attendance Records</h2>
        <p className="text-secondary-600">View and manage employee attendance</p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="label">Specific Date</label>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value, month: '', year: '' })}
              className="input"
            />
          </div>
          <div>
            <label className="label">Month</label>
            <select
              value={filters.month}
              onChange={(e) => setFilters({ ...filters, month: e.target.value, date: '' })}
              className="input"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(2024, i).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Year</label>
            <input
              type="number"
              value={filters.year}
              onChange={(e) => setFilters({ ...filters, year: e.target.value })}
              className="input w-28"
            />
          </div>
          <button
            onClick={() => fetchAttendance(1)}
            className="btn-secondary"
          >
            <Filter className="w-4 h-4 mr-2" />
            Apply Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Date</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Hours</th>
              <th>Status</th>
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
                  No attendance records found
                </td>
              </tr>
            ) : (
              records.map((record) => (
                <tr key={record._id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-700">
                          {record.employee?.user?.name?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-secondary-900">
                          {record.employee?.user?.name}
                        </p>
                        <p className="text-xs text-secondary-500">
                          {record.employee?.employeeId}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td>{formatDate(record.date)}</td>
                  <td>{record.checkIn ? formatDateTime(record.checkIn).split(',')[1] : '-'}</td>
                  <td>{record.checkOut ? formatDateTime(record.checkOut).split(',')[1] : '-'}</td>
                  <td>{record.hoursWorked || '-'}</td>
                  <td>
                    <Badge status={record.status}>{record.status}</Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.pages}
        onPageChange={fetchAttendance}
        totalItems={pagination.total}
        itemsPerPage={20}
      />
    </div>
  );
};

export default AdminAttendance;
