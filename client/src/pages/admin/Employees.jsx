import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate, formatCurrency } from '../../utils/formatters';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
    designation: '',
    phone: '',
    address: '',
    salary: '',
    dateOfJoining: '',
  });

  const fetchEmployees = async (page = 1) => {
    try {
      setLoading(true);
      const response = await api.get('/employees', {
        params: { page, limit: 10, search, department }
      });
      setEmployees(response.data.employees);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [search, department]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEmployee) {
        await api.put(`/employees/${editingEmployee._id}`, formData);
      } else {
        await api.post('/employees', formData);
      }
      setIsModalOpen(false);
      setEditingEmployee(null);
      resetForm();
      fetchEmployees(pagination.page);
    } catch (error) {
      alert(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    try {
      await api.delete(`/employees/${id}`);
      fetchEmployees(pagination.page);
    } catch (error) {
      alert('Failed to delete employee');
    }
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.user?.name || '',
      email: employee.user?.email || '',
      password: '',
      department: employee.department || '',
      designation: employee.designation || '',
      phone: employee.phone || '',
      address: employee.address || '',
      salary: employee.salary || '',
      dateOfJoining: employee.dateOfJoining ? employee.dateOfJoining.split('T')[0] : '',
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      department: '',
      designation: '',
      phone: '',
      address: '',
      salary: '',
      dateOfJoining: '',
    });
  };

  const openCreateModal = () => {
    setEditingEmployee(null);
    resetForm();
    setIsModalOpen(true);
  };

  const departments = [...new Set(employees.map(e => e.department))].filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900">Employees</h2>
          <p className="text-secondary-600">Manage your team members</p>
        </div>
        <button onClick={openCreateModal} className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Add Employee
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
          <input
            type="text"
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="input sm:w-48"
        >
          <option value="">All Departments</option>
          {departments.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>ID</th>
              <th>Department</th>
              <th>Designation</th>
              <th>Join Date</th>
              <th>Salary</th>
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
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-secondary-500">
                  No employees found
                </td>
              </tr>
            ) : (
              employees.map((employee) => (
                <tr key={employee._id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-700">
                          {employee.user?.name?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-secondary-900">{employee.user?.name}</p>
                        <p className="text-xs text-secondary-500">{employee.user?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>{employee.employeeId}</td>
                  <td>{employee.department}</td>
                  <td>{employee.designation}</td>
                  <td>{formatDate(employee.dateOfJoining)}</td>
                  <td>{formatCurrency(employee.salary)}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(employee)}
                        className="p-2 hover:bg-secondary-100 rounded-lg text-secondary-600"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(employee._id)}
                        className="p-2 hover:bg-red-50 rounded-lg text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.pages}
        onPageChange={fetchEmployees}
        totalItems={pagination.total}
        itemsPerPage={10}
      />

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEmployee ? 'Edit Employee' : 'Add Employee'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="input"
                required
              />
            </div>
          </div>
          
          {!editingEmployee && (
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="input"
                required={!editingEmployee}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Department</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Designation</label>
              <input
                type="text"
                value={formData.designation}
                onChange={(e) => setFormData({...formData, designation: e.target.value})}
                className="input"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="input"
              />
            </div>
            <div>
              <label className="label">Join Date</label>
              <input
                type="date"
                value={formData.dateOfJoining}
                onChange={(e) => setFormData({...formData, dateOfJoining: e.target.value})}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="label">Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className="input"
            />
          </div>

          <div>
            <label className="label">Salary</label>
            <input
              type="number"
              value={formData.salary}
              onChange={(e) => setFormData({...formData, salary: e.target.value})}
              className="input"
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
            <button type="submit" className="btn-primary">
              {editingEmployee ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Employees;
