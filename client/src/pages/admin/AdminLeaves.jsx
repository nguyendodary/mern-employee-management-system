import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import api from '../../services/api';
import Pagination from '../../components/common/Pagination';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate, getLeaveTypeLabel } from '../../utils/formatters';

const AdminLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [statusFilter, setStatusFilter] = useState('');
  const [reviewModal, setReviewModal] = useState({ isOpen: false, leave: null });
  const [reviewData, setReviewData] = useState({ status: 'approved', adminComment: '' });

  const fetchLeaves = async (page = 1) => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;

      const response = await api.get('/leaves', { params });
      setLeaves(response.data.leaves);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to fetch leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [statusFilter]);

  const handleReview = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/leaves/${reviewModal.leave._id}/review`, reviewData);
      setReviewModal({ isOpen: false, leave: null });
      setReviewData({ status: 'approved', adminComment: '' });
      fetchLeaves(pagination.page);
    } catch (error) {
      alert(error.response?.data?.message || 'Review failed');
    }
  };

  const openReviewModal = (leave) => {
    setReviewModal({ isOpen: true, leave });
    setReviewData({ status: 'approved', adminComment: '' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-secondary-900">Leave Requests</h2>
        <p className="text-secondary-600">Review and manage employee leave applications</p>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input w-40"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Leave Type</th>
              <th>Duration</th>
              <th>Days</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Applied On</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="text-center py-8">
                  <LoadingSpinner />
                </td>
              </tr>
            ) : leaves.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-8 text-secondary-500">
                  No leave requests found
                </td>
              </tr>
            ) : (
              leaves.map((leave) => (
                <tr key={leave._id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-700">
                          {leave.employee?.user?.name?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-secondary-900">
                          {leave.employee?.user?.name}
                        </p>
                        <p className="text-xs text-secondary-500">
                          {leave.employee?.employeeId}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td>{getLeaveTypeLabel(leave.leaveType)}</td>
                  <td>
                    <div className="text-sm">
                      <p>{formatDate(leave.startDate)}</p>
                      <p className="text-secondary-500">to {formatDate(leave.endDate)}</p>
                    </div>
                  </td>
                  <td>{leave.totalDays} days</td>
                  <td className="max-w-xs truncate">{leave.reason}</td>
                  <td>
                    <Badge status={leave.status}>{leave.status}</Badge>
                  </td>
                  <td>{formatDate(leave.createdAt)}</td>
                  <td>
                    {leave.status === 'pending' && (
                      <button
                        onClick={() => openReviewModal(leave)}
                        className="btn-primary text-sm py-1.5 px-3"
                      >
                        Review
                      </button>
                    )}
                    {leave.status !== 'pending' && (
                      <span className="text-sm text-secondary-500">
                        by {leave.reviewedBy?.name}
                      </span>
                    )}
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
        onPageChange={fetchLeaves}
        totalItems={pagination.total}
        itemsPerPage={10}
      />

      {/* Review Modal */}
      <Modal
        isOpen={reviewModal.isOpen}
        onClose={() => setReviewModal({ isOpen: false, leave: null })}
        title="Review Leave Request"
      >
        {reviewModal.leave && (
          <form onSubmit={handleReview} className="space-y-4">
            <div className="bg-secondary-50 p-4 rounded-lg">
              <p className="font-medium text-secondary-900">
                {reviewModal.leave.employee?.user?.name}
              </p>
              <p className="text-sm text-secondary-600">
                {getLeaveTypeLabel(reviewModal.leave.leaveType)} • {reviewModal.leave.totalDays} day(s)
              </p>
              <p className="text-sm text-secondary-600 mt-1">
                {formatDate(reviewModal.leave.startDate)} to {formatDate(reviewModal.leave.endDate)}
              </p>
              <p className="text-sm mt-2 italic">"{reviewModal.leave.reason}"</p>
            </div>

            <div>
              <label className="label">Decision</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="approved"
                    checked={reviewData.status === 'approved'}
                    onChange={(e) => setReviewData({ ...reviewData, status: e.target.value })}
                    className="w-4 h-4 text-green-600"
                  />
                  <span className="flex items-center gap-1 text-green-700">
                    <CheckCircle className="w-4 h-4" /> Approve
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="rejected"
                    checked={reviewData.status === 'rejected'}
                    onChange={(e) => setReviewData({ ...reviewData, status: e.target.value })}
                    className="w-4 h-4 text-red-600"
                  />
                  <span className="flex items-center gap-1 text-red-700">
                    <XCircle className="w-4 h-4" /> Reject
                  </span>
                </label>
              </div>
            </div>

            <div>
              <label className="label">Comment (Optional)</label>
              <textarea
                value={reviewData.adminComment}
                onChange={(e) => setReviewData({ ...reviewData, adminComment: e.target.value })}
                className="input min-h-[80px] resize-none"
                placeholder="Add a comment for the employee..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setReviewModal({ isOpen: false, leave: null })}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Submit Decision
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default AdminLeaves;
