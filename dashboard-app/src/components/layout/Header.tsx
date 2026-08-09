import React, { useState } from 'react';
import {
  Search,
  Bell,
  Download,
  Calendar,
  Menu,
  Check,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { Button } from '../common/Button';

export interface AppNotification {
  id: string;
  title: string;
  desc: string;
  time: string;
  unread: boolean;
}

interface HeaderProps {
  title: string;
  subtitle?: string;
  onOpenMobileSidebar: () => void;
  onOpenCommandPalette: () => void;
  onOpenDownloadModal: () => void;
  dateRange: string;
  setDateRange: (range: string) => void;
  notifications: AppNotification[];
  onMarkAllRead: () => void;
  onMarkOneRead: (id: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle = 'Raymonds Retail Operations Center',
  onOpenMobileSidebar,
  onOpenCommandPalette,
  onOpenDownloadModal,
  dateRange,
  setDateRange,
  notifications,
  onMarkAllRead,
  onMarkOneRead,
}) => {
  const [now, setNow] = useState(new Date());
  React.useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  const formattedDate = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const formattedTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  const liveDateDisplay = `Today (${formattedDate}) • ${formattedTime}`;

  const [showNotifications, setShowNotifications] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);

  const dateOptions = [
    'Today (Jul 27, 2026)',
    'Last 7 Days',
    'This Month (July 2026)',
    'Q2 FY26-27',
    'Custom Date Range',
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleMarkAllAsRead = () => {
    onMarkAllRead();
    setShowNotifications(false);
  };

  const handleMarkSingleAsRead = (id: string) => {
    onMarkOneRead(id);
    setShowNotifications(false);
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 px-4 sm:px-8 flex items-center justify-between transition-all">
      {/* Mobile Toggle & Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search trigger */}
        <div className="relative w-full">
          <button
            onClick={onOpenCommandPalette}
            className="w-full flex items-center gap-2 pl-3 pr-4 py-2 bg-gray-50 hover:bg-gray-100/80 border border-gray-200 rounded-lg text-sm text-gray-500 transition-all cursor-pointer text-left"
          >
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="hidden sm:inline text-xs font-medium text-gray-500">Search orders, inventory, or customers...</span>
            <span className="sm:hidden text-xs font-medium text-gray-500">Search...</span>
            <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-gray-400 bg-white rounded border border-gray-200 ml-auto shadow-2xs">
              ⌘K
            </kbd>
          </button>
        </div>
      </div>

      {/* Right Controls & Actions */}
      <div className="flex items-center gap-3">
        {/* Date Range Selector Dropdown */}
        <div className="relative hidden md:block">
          <button
            onClick={() => setShowDateDropdown(!showDateDropdown)}
            className="flex items-center gap-1.5 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold py-2 px-3 rounded-lg border border-gray-200 shadow-2xs transition-colors cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-[#2D74B2]" />
            <span className="font-mono font-bold text-xs">{(!dateRange || dateRange.includes("Today")) ? liveDateDisplay : dateRange}</span>
          </button>

          {showDateDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Select Time Period
              </div>
              {dateOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    setDateRange(opt);
                    setShowDateDropdown(false);
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-between cursor-pointer"
                >
                  <span>{opt}</span>
                  {dateRange === opt && <Check className="w-3.5 h-3.5 text-[#2D74B2]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Download Report Button */}
        <button
          onClick={onOpenDownloadModal}
          className="flex items-center gap-2 px-3.5 sm:px-4 py-2 bg-[#2D74B2] hover:bg-[#1B3A6B] text-white text-xs sm:text-sm font-semibold rounded-lg transition-all shadow-xs cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Download Report</span>
          <span className="sm:hidden">Report</span>
        </button>

        {/* Notifications Toggle */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#2D74B2] ring-2 ring-white" />
            )}
          </button>

          {/* Notification Flyout */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                <div className="font-bold text-sm text-gray-900">Notifications</div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    unreadCount > 0
                      ? 'bg-[#2D74B2]/10 text-[#2D74B2]'
                      : 'bg-emerald-50 text-emerald-600'
                  }`}
                >
                  {unreadCount > 0 ? `${unreadCount} New` : 'All Read'}
                </span>
              </div>
              <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleMarkSingleAsRead(n.id)}
                    className={`p-3.5 hover:bg-gray-50 transition-colors cursor-pointer ${
                      n.unread ? 'bg-rose-50/40' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-1.5 font-semibold text-xs text-gray-900">
                        {n.unread && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#2D74B2] shrink-0" />
                        )}
                        <span>{n.title}</span>
                      </div>
                      <span className="text-[10px] text-gray-400">{n.time}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed pl-3">{n.desc}</p>
                  </div>
                ))}
              </div>
              <div className="px-4 pt-2 border-t border-gray-100 flex items-center justify-between">
                {unreadCount > 0 ? (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-[#2D74B2] font-semibold hover:underline cursor-pointer py-1"
                  >
                    Mark all as read
                  </button>
                ) : (
                  <span className="text-xs text-emerald-600 font-medium py-1">
                    ✓ All notifications caught up
                  </span>
                )}
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer py-1 ml-auto"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Badge */}
        <div className="w-8 h-8 rounded-full bg-[#2D74B2]/10 text-[#2D74B2] font-bold text-xs flex items-center justify-center border border-[#2D74B2]/20 shrink-0 hidden sm:flex">
          JS
        </div>
      </div>
    </header>
  );
};
