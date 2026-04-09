import { useState, useEffect, useRef } from 'react';
import { Bell, Menu, X, CheckCircle, AlertCircle, Info, Trash2, Filter } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Header = ({ title, onMenuClick }) => {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const [filter, setFilter] = useState('all');
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'info', message: 'Welcome to EMS!', time: 'Just now', read: false, date: new Date() },
    { id: 2, type: 'success', message: 'Your profile was updated successfully', time: '2 hours ago', read: false, date: new Date(Date.now() - 2 * 60 * 60 * 1000) },
    { id: 3, type: 'warning', message: 'Please complete your attendance check-in', time: '5 hours ago', read: true, date: new Date(Date.now() - 5 * 60 * 60 * 1000) },
    { id: 4, type: 'error', message: 'Failed to upload document', time: '1 day ago', read: true, date: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    { id: 5, type: 'success', message: 'Leave request approved', time: '2 days ago', read: true, date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
    { id: 6, type: 'info', message: 'New company policy updated', time: '3 days ago', read: true, date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
  ]);
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const removeNotification = (id, e) => {
    e.stopPropagation();
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const handleViewAll = () => {
    setShowNotifications(false);
    setShowAllNotifications(true);
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.read;
    return n.type === filter;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <header className="bg-white border-b border-secondary-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-secondary-100 rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-semibold text-secondary-900">{title}</h2>
        </div>

        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-secondary-100 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5 text-secondary-600" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-secondary-200 z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-secondary-200">
                  <h3 className="font-semibold text-secondary-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllAsRead}
                      className="text-xs text-primary-600 hover:text-primary-700"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-secondary-500">
                      <Bell className="w-8 h-8 mx-auto mb-2 text-secondary-300" />
                      <p>No notifications</p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div 
                        key={notification.id}
                        onClick={() => markAsRead(notification.id)}
                        className={`flex items-start gap-3 px-4 py-3 hover:bg-secondary-50 cursor-pointer border-b border-secondary-100 last:border-0 ${
                          !notification.read ? 'bg-blue-50/50' : ''
                        }`}
                      >
                        {getIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${!notification.read ? 'font-medium text-secondary-900' : 'text-secondary-700'}`}>
                            {notification.message}
                          </p>
                          <p className="text-xs text-secondary-500 mt-1">{notification.time}</p>
                        </div>
                        <button 
                          onClick={(e) => removeNotification(notification.id, e)}
                          className="p-1 hover:bg-secondary-200 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3 text-secondary-400" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
                
                {notifications.length > 0 && (
                  <div className="px-4 py-2 border-t border-secondary-200 text-center">
                    <button 
                      onClick={handleViewAll}
                      className="text-xs text-primary-600 hover:text-primary-700"
                    >
                      View all notifications
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-secondary-700 hidden sm:block">
              {user?.name}
            </span>
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-sm font-medium text-primary-700">
                {user?.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Full Notifications Modal */}
      {showAllNotifications && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={() => setShowAllNotifications(false)}
          />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-secondary-200">
              <div>
                <h3 className="text-lg font-semibold text-secondary-900">All Notifications</h3>
                <p className="text-sm text-secondary-500">
                  {unreadCount} unread of {notifications.length} total
                </p>
              </div>
              <div className="flex items-center gap-2">
                {notifications.length > 0 && (
                  <>
                    <button
                      onClick={markAllAsRead}
                      className="text-sm text-primary-600 hover:text-primary-700 px-3 py-1.5 rounded-lg hover:bg-primary-50"
                    >
                      Mark all read
                    </button>
                    <button
                      onClick={clearAllNotifications}
                      className="text-sm text-red-600 hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
                <button 
                  onClick={() => setShowAllNotifications(false)}
                  className="p-2 hover:bg-secondary-100 rounded-lg"
                >
                  <X className="w-5 h-5 text-secondary-500" />
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 px-6 py-3 border-b border-secondary-200 overflow-x-auto">
              {[
                { key: 'all', label: 'All' },
                { key: 'unread', label: 'Unread' },
                { key: 'success', label: 'Success' },
                { key: 'warning', label: 'Warning' },
                { key: 'error', label: 'Error' },
                { key: 'info', label: 'Info' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filter === key
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-secondary-600 hover:bg-secondary-100'
                  }`}
                >
                  {label}
                  {key === 'unread' && unreadCount > 0 && (
                    <span className="ml-1.5 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                      {unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto p-4">
              {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-secondary-500">
                  <Bell className="w-12 h-12 text-secondary-300 mb-3" />
                  <p className="text-lg font-medium">No notifications</p>
                  <p className="text-sm">
                    {filter === 'all' 
                      ? "You're all caught up!" 
                      : `No ${filter} notifications found`}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => markAsRead(notification.id)}
                      className={`flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all ${
                        !notification.read 
                          ? 'bg-blue-50 border border-blue-100' 
                          : 'bg-secondary-50 hover:bg-secondary-100'
                      }`}
                    >
                      <div className="flex-shrink-0">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm ${!notification.read ? 'font-semibold text-secondary-900' : 'text-secondary-700'}`}>
                            {notification.message}
                          </p>
                          {!notification.read && (
                            <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-1.5"></span>
                          )}
                        </div>
                        <p className="text-xs text-secondary-500 mt-1">{notification.time}</p>
                      </div>
                      <button
                        onClick={(e) => removeNotification(notification.id, e)}
                        className="flex-shrink-0 p-1.5 hover:bg-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4 text-secondary-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-secondary-200 bg-secondary-50 rounded-b-xl">
              <p className="text-xs text-secondary-500 text-center">
                Showing {filteredNotifications.length} of {notifications.length} notifications
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
