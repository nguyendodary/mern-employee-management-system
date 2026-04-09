import { useState, useEffect } from 'react';
import { FileText, Download, Calendar, DollarSign } from 'lucide-react';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatCurrency, getMonthName } from '../../utils/formatters';

const MyPayslips = () => {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayslip, setSelectedPayslip] = useState(null);

  useEffect(() => {
    fetchPayslips();
  }, []);

  const fetchPayslips = async () => {
    try {
      setLoading(true);
      const response = await api.get('/payroll/me');
      setPayslips(response.data);
    } catch (error) {
      console.error('Failed to fetch payslips:', error);
    } finally {
      setLoading(false);
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

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-secondary-900">My Payslips</h2>
        <p className="text-secondary-600">View and download your salary slips</p>
      </div>

      {/* Payslip Cards */}
      {payslips.length === 0 ? (
        <div className="card text-center py-12">
          <FileText className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-900">No payslips available</h3>
          <p className="text-secondary-600 mt-1">Your payslips will appear here once generated</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {payslips.map((payslip) => (
            <div key={payslip._id} className="card">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary-900">
                      {getMonthName(payslip.month)} {payslip.year}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <Badge status={payslip.status}>{payslip.status}</Badge>
                      {payslip.paidAt && (
                        <span className="text-xs text-secondary-500">
                          Paid on {new Date(payslip.paidAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-secondary-600">Net Salary</p>
                    <p className="text-xl font-bold text-primary-600">
                      {formatCurrency(payslip.netSalary)}
                    </p>
                  </div>
                  <button
                    onClick={() => viewPayslip(payslip._id)}
                    className="btn-primary"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payslip Detail Modal */}
      <Modal
        isOpen={!!selectedPayslip}
        onClose={() => setSelectedPayslip(null)}
        title="Payslip Details"
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

            {/* Earnings */}
            <div>
              <h4 className="font-semibold text-secondary-900 mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Earnings
              </h4>
              <div className="space-y-2 text-sm bg-green-50 p-4 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-secondary-600">Basic Salary</span>
                  <span className="font-medium">{formatCurrency(selectedPayslip.basicSalary)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-600">House Rent Allowance (HRA)</span>
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
                {selectedPayslip.allowances?.other > 0 && (
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Other Allowances</span>
                    <span className="font-medium">{formatCurrency(selectedPayslip.allowances?.other)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-green-200">
                  <span className="font-semibold text-green-800">Gross Salary</span>
                  <span className="font-bold text-green-700">{formatCurrency(selectedPayslip.grossSalary)}</span>
                </div>
              </div>
            </div>

            {/* Deductions */}
            <div>
              <h4 className="font-semibold text-secondary-900 mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Deductions
              </h4>
              <div className="space-y-2 text-sm bg-red-50 p-4 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-secondary-600">Provident Fund (PF)</span>
                  <span className="font-medium">{formatCurrency(selectedPayslip.deductions?.pf)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-600">Income Tax (TDS)</span>
                  <span className="font-medium">{formatCurrency(selectedPayslip.deductions?.tax)}</span>
                </div>
                {selectedPayslip.deductions?.other > 0 && (
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Other Deductions</span>
                    <span className="font-medium">{formatCurrency(selectedPayslip.deductions?.other)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-red-200">
                  <span className="font-semibold text-red-800">Total Deductions</span>
                  <span className="font-bold text-red-700">
                    {formatCurrency(selectedPayslip.deductions?.pf + selectedPayslip.deductions?.tax + selectedPayslip.deductions?.other)}
                  </span>
                </div>
              </div>
            </div>

            {/* Net Salary */}
            <div className="bg-primary-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-bold text-primary-900 text-lg">Net Salary</span>
                <span className="font-bold text-2xl text-primary-600">
                  {formatCurrency(selectedPayslip.netSalary)}
                </span>
              </div>
            </div>

            {/* Attendance Summary */}
            <div className="border-t border-secondary-200 pt-4">
              <h4 className="font-semibold text-secondary-900 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Attendance Summary
              </h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center p-3 bg-secondary-50 rounded-lg">
                  <p className="font-bold text-secondary-900">{selectedPayslip.workingDays}</p>
                  <p className="text-secondary-600">Working Days</p>
                </div>
                <div className="text-center p-3 bg-secondary-50 rounded-lg">
                  <p className="font-bold text-green-600">{selectedPayslip.presentDays}</p>
                  <p className="text-secondary-600">Present</p>
                </div>
                <div className="text-center p-3 bg-secondary-50 rounded-lg">
                  <p className="font-bold text-blue-600">{selectedPayslip.leaveDays}</p>
                  <p className="text-secondary-600">On Leave</p>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="flex justify-between items-center text-sm">
              <span className="text-secondary-600">
                Generated by: {selectedPayslip.generatedBy?.name || 'System'}
              </span>
              <Badge status={selectedPayslip.status}>{selectedPayslip.status}</Badge>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyPayslips;
