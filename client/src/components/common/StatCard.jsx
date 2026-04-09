const StatCard = ({ title, value, icon: Icon, trend, color = 'primary' }) => {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-600',
    success: 'bg-green-50 text-green-600',
    warning: 'bg-yellow-50 text-yellow-600',
    danger: 'bg-red-50 text-red-600',
    info: 'bg-blue-50 text-blue-600',
  };

  return (
    <div className="stat-card">
      <div className={`stat-icon ${colorClasses[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm text-secondary-600">{title}</p>
        <p className="text-2xl font-bold text-secondary-900">{value}</p>
        {trend && (
          <p className="text-xs text-secondary-500 mt-1">{trend}</p>
        )}
      </div>
    </div>
  );
};

export default StatCard;
