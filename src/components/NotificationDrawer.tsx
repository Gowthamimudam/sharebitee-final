import React, { useState } from 'react';
import { X, CheckCheck, Bell, Zap, Truck, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { NotificationItem } from '../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead, unreadNotificationCount } = useApp();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  if (!isOpen) return null;

  const filteredNotifs = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'urgent':
        return <Zap className="w-4 h-4 text-red-500 fill-current" />;
      case 'mission':
        return <Truck className="w-4 h-4 text-amber-500" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      default:
        return <Bell className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                  Notifications
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {unreadNotificationCount} unread system alert{unreadNotificationCount === 1 ? '' : 's'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {unreadNotificationCount > 0 && (
                <button
                  onClick={markAllNotificationsAsRead}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-md transition-colors"
                  title="Mark all read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Mark read</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 flex gap-2 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                filter === 'all'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                filter === 'unread'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Unread ({unreadNotificationCount})
            </button>
          </div>

          {/* Notification List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 p-2">
            {filteredNotifs.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mb-3">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  All caught up!
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  No notifications match your current filter. New donation matches and mission updates will appear here.
                </p>
              </div>
            ) : (
              filteredNotifs.map((item) => (
                <div
                  key={item.id}
                  onClick={() => markNotificationAsRead(item.id)}
                  className={`p-3.5 rounded-xl transition-all cursor-pointer ${
                    !item.isRead
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/20 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-800 shadow-xs border border-slate-100 dark:border-slate-700/60 shrink-0 mt-0.5">
                      {getIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {item.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                          {item.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                        {item.message}
                      </p>
                      {item.actionUrl && (
                        <Link
                          to={item.actionUrl}
                          onClick={onClose}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline mt-2"
                        >
                          <span>Open details</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                    {!item.isRead && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-2" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer note */}
          <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 text-center">
            Live dispatch alerts powered by the ShareBite Rescue Engine
          </div>
        </div>
      </div>
    </div>
  );
};
