export const formatCurrency = (amount, currency = 'INR') =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);

export const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export const formatRelativeTime = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

export const getInitials = (name = '') =>
  name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

export const truncate = (str = '', len = 40) =>
  str.length > len ? `${str.slice(0, len)}…` : str;

export const getStatusBadge = (status) => {
  const map = {
    pending: { label: 'Pending', class: 'badge-warning' },
    confirmed: { label: 'Confirmed', class: 'badge-success' },
    completed: { label: 'Completed', class: 'badge-info' },
    referred: { label: 'Referred ✅', class: 'badge-success' },
    rejected: { label: 'Rejected', class: 'badge-danger' },
    cancelled: { label: 'Cancelled', class: 'badge-muted' },
    active: { label: 'Active', class: 'badge-success' },
    paused: { label: 'Paused', class: 'badge-warning' },
    closed: { label: 'Closed', class: 'badge-danger' },
    expired: { label: 'Expired', class: 'badge-muted' },
  };
  return map[status] || { label: status, class: 'badge-muted' };
};
