import { useState } from 'react';
import { User, Mail, Phone, MapPin, Briefcase, Building, DollarSign, Edit, Save, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { formatDate, formatCurrency } from '../../utils/formatters';

const MyProfile = () => {
  const { user, employeeProfile, updateProfile, fetchUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: employeeProfile?.phone || '',
    address: employeeProfile?.address || '',
    bankAccount: {
      accountNumber: employeeProfile?.bankAccount?.accountNumber || '',
      bankName: employeeProfile?.bankAccount?.bankName || '',
      ifsc: employeeProfile?.bankAccount?.ifsc || '',
    },
    emergencyContact: {
      name: employeeProfile?.emergencyContact?.name || '',
      phone: employeeProfile?.emergencyContact?.phone || '',
      relation: employeeProfile?.emergencyContact?.relation || '',
    },
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      // Update user profile (name)
      if (formData.name !== user.name) {
        await updateProfile({ name: formData.name });
      }
      
      // Update employee profile
      await api.put('/employees/me/profile', {
        phone: formData.phone,
        address: formData.address,
        bankAccount: formData.bankAccount,
        emergencyContact: formData.emergencyContact,
      });
      
      await fetchUser();
      setEditing(false);
    } catch (error) {
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const InfoRow = ({ icon: Icon, label, value, editable, name, type = 'text', children }) => (
    <div className="flex items-start gap-3 py-3 border-b border-secondary-100 last:border-0">
      <Icon className="w-5 h-5 text-secondary-400 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm text-secondary-500">{label}</p>
        {editing && editable ? (
          children || (
            <input
              type={type}
              value={value}
              onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
              className="input mt-1"
            />
          )
        ) : (
          <p className="font-medium text-secondary-900">{value || '-'}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900">My Profile</h2>
          <p className="text-secondary-600">View and update your personal information</p>
        </div>
        {editing ? (
          <div className="flex gap-2">
            <button
              onClick={() => setEditing(false)}
              className="btn-secondary"
              disabled={saving}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="btn-primary"
              disabled={saving}
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} className="btn-primary">
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Info */}
        <div className="card lg:col-span-2">
          <h3 className="font-semibold text-secondary-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-primary-600" />
            Personal Information
          </h3>
          
          <InfoRow
            icon={User}
            label="Full Name"
            value={formData.name}
            editable
            name="name"
          />
          
          <InfoRow
            icon={Mail}
            label="Email Address"
            value={user?.email}
          />
          
          <InfoRow
            icon={Phone}
            label="Phone Number"
            value={formData.phone}
            editable
            name="phone"
          />
          
          <InfoRow
            icon={MapPin}
            label="Address"
            value={formData.address}
            editable
            name="address"
          />

          <InfoRow
            icon={Briefcase}
            label="Employee ID"
            value={employeeProfile?.employeeId}
          />
          
          <InfoRow
            icon={Building}
            label="Department"
            value={employeeProfile?.department}
          />
          
          <InfoRow
            icon={Briefcase}
            label="Designation"
            value={employeeProfile?.designation}
          />
          
          <InfoRow
            icon={DollarSign}
            label="Base Salary"
            value={formatCurrency(employeeProfile?.salary)}
          />
        </div>

        {/* Side Info */}
        <div className="space-y-6">
          {/* Bank Details */}
          <div className="card">
            <h3 className="font-semibold text-secondary-900 mb-4">Bank Details</h3>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-secondary-500">Account Number</p>
                {editing ? (
                  <input
                    type="text"
                    value={formData.bankAccount.accountNumber}
                    onChange={(e) => setFormData({
                      ...formData,
                      bankAccount: { ...formData.bankAccount, accountNumber: e.target.value }
                    })}
                    className="input mt-1"
                  />
                ) : (
                  <p className="font-medium text-secondary-900">
                    {employeeProfile?.bankAccount?.accountNumber || '-'}
                  </p>
                )}
              </div>
              
              <div>
                <p className="text-sm text-secondary-500">Bank Name</p>
                {editing ? (
                  <input
                    type="text"
                    value={formData.bankAccount.bankName}
                    onChange={(e) => setFormData({
                      ...formData,
                      bankAccount: { ...formData.bankAccount, bankName: e.target.value }
                    })}
                    className="input mt-1"
                  />
                ) : (
                  <p className="font-medium text-secondary-900">
                    {employeeProfile?.bankAccount?.bankName || '-'}
                  </p>
                )}
              </div>
              
              <div>
                <p className="text-sm text-secondary-500">IFSC Code</p>
                {editing ? (
                  <input
                    type="text"
                    value={formData.bankAccount.ifsc}
                    onChange={(e) => setFormData({
                      ...formData,
                      bankAccount: { ...formData.bankAccount, ifsc: e.target.value }
                    })}
                    className="input mt-1"
                  />
                ) : (
                  <p className="font-medium text-secondary-900">
                    {employeeProfile?.bankAccount?.ifsc || '-'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="card">
            <h3 className="font-semibold text-secondary-900 mb-4">Emergency Contact</h3>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-secondary-500">Name</p>
                {editing ? (
                  <input
                    type="text"
                    value={formData.emergencyContact.name}
                    onChange={(e) => setFormData({
                      ...formData,
                      emergencyContact: { ...formData.emergencyContact, name: e.target.value }
                    })}
                    className="input mt-1"
                  />
                ) : (
                  <p className="font-medium text-secondary-900">
                    {employeeProfile?.emergencyContact?.name || '-'}
                  </p>
                )}
              </div>
              
              <div>
                <p className="text-sm text-secondary-500">Phone</p>
                {editing ? (
                  <input
                    type="text"
                    value={formData.emergencyContact.phone}
                    onChange={(e) => setFormData({
                      ...formData,
                      emergencyContact: { ...formData.emergencyContact, phone: e.target.value }
                    })}
                    className="input mt-1"
                  />
                ) : (
                  <p className="font-medium text-secondary-900">
                    {employeeProfile?.emergencyContact?.phone || '-'}
                  </p>
                )}
              </div>
              
              <div>
                <p className="text-sm text-secondary-500">Relationship</p>
                {editing ? (
                  <input
                    type="text"
                    value={formData.emergencyContact.relation}
                    onChange={(e) => setFormData({
                      ...formData,
                      emergencyContact: { ...formData.emergencyContact, relation: e.target.value }
                    })}
                    className="input mt-1"
                  />
                ) : (
                  <p className="font-medium text-secondary-900">
                    {employeeProfile?.emergencyContact?.relation || '-'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Join Date */}
          <div className="card">
            <h3 className="font-semibold text-secondary-900 mb-2">Employment Info</h3>
            <p className="text-sm text-secondary-500">Date of Joining</p>
            <p className="font-medium text-secondary-900">
              {formatDate(employeeProfile?.dateOfJoining)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
