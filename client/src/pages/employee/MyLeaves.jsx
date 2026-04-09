import { useState, useEffect } from 'react';
import { Plus, Calendar } from 'lucide-react';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate, getLeaveTypeLabel } from '../../utils/formatters';

const MyLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    leaveType: 'casual',
    startDate: '',
    endDate: '',
    reason: '',
  });

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const response = await api.get('/leaves/me');
      setLeaves(response.data);
    } catch (error) {
      console.error('Failed to fetch leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/leaves', formData);
      setIsModalOpen(false);
      setFormData({ leaveType: 'casual', startDate: '', endDate: '', reason: '' });
      fetchLeaves();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to apply for leave');
    } finally {
      setSubmitting(false);
    }
  };

  const calculateDays = (start, end) => {
    if (!start || !end) return 0;
    const diff = new Date(end) - new Date(start);
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900">My Leaves</h2>
          <p className="text-secondary-600">Apply for leave and track your applications</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Apply for Leave
        </button>
      </div>

      {/* Leave Cards */}
      {loading ? (
        <LoadingSpinner fullScreen />
      ) : leaves.length === 0 ? (
        <div className="card text-center py-12">
          <Calendar className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-900">No leave applications yet</h3>
          <p className="text-secondary-600 mt-1">Apply for your first leave to get started</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {leaves.map((leave) => (
            <div key={leave._id} className="card">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-secondary-900">
                      {getLeaveTypeLabel(leave.leaveType)}
                    </h3>
                    <Badge status={leave.status}>{leave.status}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-secondary-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                    </span>
                    <span>{leave.totalDays} day(s)</span>
                  </div>
                  <p className="text-sm text-secondary-700 mt-2">
                    <span className="font-medium">Reason:</span> {leave.reason}
                  </p>
                  {leave.adminComment && (
                    <p className="text-sm text-secondary-600 mt-1">
                      <span className="font-medium">Admin Note:</span> {leave.adminComment}
                    </p>
                  )}
                </div>
                <div className="text-right text-sm text-secondary-500">
                  <p>Applied on</p>
                  <p>{formatDate(leave.createdAt)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Apply Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Apply for Leave"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Leave Type</label>
            <select
              value={formData.leaveType}
              onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
              className="input"
              required
            >
              <option value="sick">Sick Leave</option>
              <option value="casual">Casual Leave</option>
              <option value="earned">Earned Leave</option>
              <option value="maternity">Maternity Leave</option>
              <option value="paternity">Paternity Leave</option>
              <option value="unpaid">Unpaid Leave</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="input"
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label className="label">End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="input"
                required
                min={formData.startDate}
              />
            </div>
          </div>

          {formData.startDate && formData.endDate && (
            <div className="p-3 bg-secondary-50 rounded-lg text-sm">
              <span className="font-medium">Total Days:</span>{' '}
              {calculateDays(formData.startDate, formData.endDate)} day(s)
            </div>
          )}

          <div>
            <label className="label">Reason</label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="input min-h-[100px] resize-none"
              placeholder="Please provide a reason for your leave..."
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MyLeaves;
