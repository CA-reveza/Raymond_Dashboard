import React from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  ShoppingBag,
  Users,
  Package,
  RotateCcw,
  Ticket,
  BarChart3,
  FileSpreadsheet,
  HelpCircle,
  Settings,
  Store,
  ChevronDown,
  X,
} from 'lucide-react';
import { TabType } from '../../types';
import { STORE_LOCATIONS } from '../../data/mockData';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  selectedStore: string;
  setSelectedStore: (store: string) => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  selectedStore,
  setSelectedStore,
  isOpenMobile,
  setIsOpenMobile,
}) => {
  const menuItems: { id: TabType; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'orders', label: 'Orders', icon: <ShoppingBag className="w-5 h-5" />, badge: '7 New' },
    { id: 'customers', label: 'Customers', icon: <Users className="w-5 h-5" /> },
    { id: 'inventory', label: 'Inventory', icon: <Package className="w-5 h-5" />, badge: 'Low' },
    { id: 'feedback', label: 'Customer Feedback', icon: <MessageSquare className="w-5 h-5 text-amber-500" /> },
    { id: 'return_product', label: 'Return Product', icon: <RotateCcw className="w-5 h-5" /> },
    { id: 'coupons', label: 'Coupons', icon: <Ticket className="w-5 h-5" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'reports', label: 'Reports', icon: <FileSpreadsheet className="w-5 h-5" /> },
    { id: 'help', label: 'Help Center', icon: <HelpCircle className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-xs"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white text-gray-700 flex flex-col border-r border-gray-200 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#2D74B2] flex items-center justify-center text-white font-black text-lg shadow-xs tracking-tighter">
              SS
            </div>
            <div>
              <div className="font-extrabold text-gray-900 text-sm tracking-wider uppercase">
                RAYMONDS
              </div>
              <div className="text-[10px] text-gray-400 uppercase tracking-widest font-mono">
                Retail Dashboard
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsOpenMobile(false)}
            className="lg:hidden text-gray-400 hover:text-gray-700 p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Store Selector */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5 flex items-center gap-1.5">
            <Store className="w-3.5 h-3.5 text-[#2D74B2]" /> Active Branch
          </label>
          <div className="relative">
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="w-full bg-white hover:bg-gray-50 text-xs text-gray-800 font-semibold py-2 pl-3 pr-8 rounded-lg border border-gray-200 focus:border-[#2D74B2] focus:ring-1 focus:ring-[#2D74B2] appearance-none cursor-pointer truncate transition-colors shadow-2xs"
            >
              {STORE_LOCATIONS.map((loc) => (
                <option key={loc} value={loc} className="bg-white text-gray-800">
                  {loc}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Main Navigation
          </div>
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpenMobile(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg font-medium text-sm transition-all duration-150 cursor-pointer group ${
                  isActive
                    ? 'bg-rose-50 text-[#2D74B2] font-semibold'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`transition-colors ${
                      isActive ? 'text-[#2D74B2]' : 'text-gray-400 group-hover:text-gray-600'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      item.badge === 'Low'
                        ? 'bg-amber-50 text-amber-600 border border-amber-200/60'
                        : 'bg-rose-100 text-[#2D74B2]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-3.5 border-t border-gray-200 bg-gray-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-[#2D74B2]/10 text-[#2D74B2] font-bold text-xs flex items-center justify-center border border-[#2D74B2]/20 shrink-0">
              JS
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-gray-900 truncate">Jordan Smith</div>
              <div className="text-[10px] text-gray-500 truncate">Store Manager</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
