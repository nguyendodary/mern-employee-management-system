import { useState, useEffect } from 'react';
import { Plus, DollarSign, CheckCircle, FileText } from 'lucide-react';
import api from '../../services/api';
import Pagination from '../../components/common/Pagination';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatCurrency, getMonthName } from '../../utils/formatters';

const AdminPayroll = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  const [generateModal, setGenerateModal] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  const [selectedPayslip, setSelectedPayslip] = useState(null);

  const fetchPayrolls = async (page = 1) => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (filters.month) params.month = filters.month;
      if (filters.year) params.year = filters.year;

      const response = await api.get('/payroll', { params });
      setPayrolls(response.data.payrolls);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to fetch payrolls:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees', { params: { limit: 1000 } });
      setEmployees(response.data.employees);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    }
  };

  useEffect(() => {
    fetchPayrolls();
    fetchEmployees();
  }, [filters]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/payroll/generate', formData);
      setGenerateModal(false);
      fetchPayrolls();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to generate payroll');
    }
  };

  const handleMarkPaid = async (id) => {
    if (!window.confirm('Mark this payroll as paid?')) return;
    try {
      await api.put(`/payroll/${id}/pay`);
      fetchPayrolls(pagination.page);
    } catch (error) {
      alert('Failed to mark as paid');
    }
  };

  const viewPayslip = async (id) => {
    try {
      const response = await api.get(`/payroll/${id}`);
      setSelectedPayslip(response.data);
    } catch (error) {
      alert('Failed to load payslip');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900">Payroll Management</h2>
          <p className="text-secondary-600">Generate and manage employee payrolls</p>
        </div>
        <button onClick={() => setGenerateModal(true)} className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Generate Payroll
        </button>
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

      {/* Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Period</th>
              <th>Basic Salary</th>
              <th>Gross Salary</th>
              <th>Net Salary</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center py-8">
                  <LoadingSpinner />
                </td>
              </tr>
            ) : payrolls.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-secondary-500">
                  No payroll records found
                </td>
              </tr>
            ) : (
              payrolls.map((payroll) => (
                <tr key={payroll._id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-700">
                          {payroll.employee?.user?.name?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-secondary-900">
                          {payroll.employee?.user?.name}
                        </p>
                        <p className="text-xs text-secondary-500">
                          {payroll.employee?.employeeId}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td>
                    {getMonthName(payroll.month)} {payroll.year}
                  </td>
                  <td>{formatCurrency(payroll.basicSalary)}</td>
                  <td>{formatCurrency(payroll.grossSalary)}</td>
                  <td className="font-medium">{formatCurrency(payroll.netSalary)}</td>
                  <td>
                    <Badge status={payroll.status}>{payroll.status}</Badge>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => viewPayslip(payroll._id)}
                        className="p-2 hover:bg-secondary-100 rounded-lg text-secondary-600"
                        title="View Payslip"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      {payroll.status === 'draft' && (
                        <button
                          onClick={() => handleMarkPaid(payroll._id)}
                          className="p-2 hover:bg-green-50 rounded-lg text-green-600"
                          title="Mark as Paid"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
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
        onPageChange={fetchPayrolls}
        totalItems={pagination.total}
        itemsPerPage={10}
      />

      {/* Generate Modal */}
      <Modal
        isOpen={generateModal}
        onClose={() => setGenerateModal(false)}
        title="Generate Payroll"
      >
        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="label">Employee</label>
            <select
              value={formData.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              className="input"
              required
            >
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.user?.name} ({emp.employeeId})
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Month</label>
              <select
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                className="input"
                required
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
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="input"
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setGenerateModal(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Generate
            </button>
          </div>
        </form>
      </Modal>

      {/* Payslip Modal */}
      <Modal
        isOpen={!!selectedPayslip}
        onClose={() => setSelectedPayslip(null)}
        title="Payslip"
        size="md"
      >
        {selectedPayslip && (
          <div className="space-y-6">
            <div className="text-center border-b border-secondary-200 pb-4">
              <h3 className="text-xl font-bold text-secondary-900">PAYSLIP</h3>
              <p className="text-secondary-600">
                {getMonthName(selectedPayslip.month)} {selectedPayslip.year}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-secondary-500">Employee Name</p>
                <p className="font-medium">{selectedPayslip.employee?.user?.name}</p>
              </div>
              <div>
                <p className="text-secondary-500">Employee ID</p>
                <p className="font-medium">{selectedPayslip.employee?.employeeId}</p>
              </div>
              <div>
                <p className="text-secondary-500">Department</p>
                <p className="font-medium">{selectedPayslip.employee?.department}</p>
              </div>
              <div>
                <p className="text-secondary-500">Designation</p>
                <p className="font-medium">{selectedPayslip.employee?.designation}</p>
              </div>
            </div>

            <div className="border-t border-secondary-200 pt-4">
              <h4 className="font-semibold text-secondary-900 mb-3">Earnings</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-secondary-600">Basic Salary</span>
                  <span className="font-medium">{formatCurrency(selectedPayslip.basicSalary)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-600">HRA</span>
                  <span className="font-medium">{formatCurrency(selectedPayslip.allowances?.hra)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-600">Transport Allowance</span>
                  <span className="font-medium">{formatCurrency(selectedPayslip.allowances?.transport)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-600">Medical Allowance</span>
                  <span className="font-medium">{formatCurrency(selectedPayslip.allowances?.medical)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-secondary-200">
                  <span className="font-semibold">Gross Salary</span>
                  <span className="font-bold text-green-600">{formatCurrency(selectedPayslip.grossSalary)}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-secondary-200 pt-4">
              <h4 className="font-semibold text-secondary-900 mb-3">Deductions</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-secondary-600">Provident Fund (PF)</span>
                  <span className="font-medium">{formatCurrency(selectedPayslip.deductions?.pf)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-600">Tax</span>
                  <span className="font-medium">{formatCurrency(selectedPayslip.deductions?.tax)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-secondary-200">
                  <span className="font-semibold">Total Deductions</span>
                  <span className="font-bold text-red-600">
                    {formatCurrency(selectedPayslip.deductions?.pf + selectedPayslip.deductions?.tax)}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t-2 border-secondary-300 pt-4">
              <div className="flex justify-between">
                <span className="font-bold text-secondary-900">Net Salary</span>
                <span className="font-bold text-xl text-primary-600">{formatCurrency(selectedPayslip.netSalary)}</span>
              </div>
            </div>

            <div className="text-xs text-secondary-500 text-center pt-4">
              <p>Working Days: {selectedPayslip.workingDays} | Present: {selectedPayslip.presentDays} | Leave: {selectedPayslip.leaveDays}</p>
              <p className="mt-1">Status: <Badge status={selectedPayslip.status}>{selectedPayslip.status}</Badge></p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminPayroll;
