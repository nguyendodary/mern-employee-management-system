import { getStatusColor } from '../../utils/formatters';

const Badge = ({ status, children }) => {
  const colorClass = getStatusColor(status);
  
  const classes = {
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
    info: 'badge-info',
    secondary: 'badge-secondary',
  };

  return (
    <span className={classes[colorClass] || 'badge-secondary'}>
      {children || status}
    </span>
  );
};

export default Badge;
