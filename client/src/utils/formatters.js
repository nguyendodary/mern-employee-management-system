export const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatNumber = (num) => {
  if (num === null || num === undefined) return '-';
  return new Intl.NumberFormat('en-US').format(num);
};

export const getMonthName = (monthNumber) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[monthNumber - 1] || '-';
};

export const getLeaveTypeLabel = (type) => {
  const labels = {
    sick: 'Sick Leave',
    casual: 'Casual Leave',
    earned: 'Earned Leave',
    maternity: 'Maternity Leave',
    paternity: 'Paternity Leave',
    unpaid: 'Unpaid Leave',
  };
  return labels[type] || type;
};

export const getStatusColor = (status) => {
  const colors = {
    present: 'success',
    absent: 'danger',
    'half-day': 'warning',
    'on-leave': 'info',
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
    draft: 'secondary',
    paid: 'success',
  };
  return colors[status] || 'secondary';
};
