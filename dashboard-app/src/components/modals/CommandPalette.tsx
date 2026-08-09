import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, Users, Package, ArrowRight, X } from 'lucide-react';
import { Order, Customer, InventoryItem, TabType } from '../../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  customers: Customer[];
  inventory: InventoryItem[];
  onSelectOrder: (order: Order) => void;
  onSelectCustomer: (customer: Customer) => void;
  onSelectInventory: (item: InventoryItem) => void;
  onNavigateTab: (tab: TabType) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  orders,
  customers,
  inventory,
  onSelectOrder,
  onSelectCustomer,
  onSelectInventory,
  onNavigateTab,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const matchedOrders = orders.filter(
    (o) =>
      o.id.toLowerCase().includes(query.toLowerCase()) ||
      o.customerName.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3);

  const matchedCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.email.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3);

  const matchedInventory = inventory.filter(
    (i) =>
      i.name.toLowerCase().includes(query.toLowerCase()) ||
      i.sku.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4">
      <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-[#122B52]" />
          <input
            type="text"
            autoFocus
            placeholder="Search orders, First Citizen members, or SKUs... (Esc to close)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-sm font-medium text-slate-900 bg-transparent outline-none"
          />
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-100 text-xs">
          {/* Orders Section */}
          {matchedOrders.length > 0 && (
            <div className="py-2">
              <div className="px-3 text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1.5">
                <ShoppingBag className="w-3 h-3 text-[#122B52]" /> Orders
              </div>
              {matchedOrders.map((o) => (
                <button
                  key={o.id}
                  onClick={() => {
                    onSelectOrder(o);
                    onClose();
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-xl flex items-center justify-between cursor-pointer group"
                >
                  <div>
                    <span className="font-mono font-bold text-slate-900">{o.id}</span> •{' '}
                    <span className="text-slate-700 font-medium">{o.customerName}</span>
                  </div>
                  <div className="font-bold text-slate-900 flex items-center gap-1">
                    ₹{o.totalAmount.toLocaleString()} <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-[#122B52]" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Members Section */}
          {matchedCustomers.length > 0 && (
            <div className="py-2">
              <div className="px-3 text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1.5">
                <Users className="w-3 h-3 text-amber-500" /> First Citizen Members
              </div>
              {matchedCustomers.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    onSelectCustomer(c);
                    onClose();
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-xl flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <img src={c.avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                    <div>
                      <div className="font-semibold text-slate-900 group-hover:text-[#122B52] transition-colors">{c.name}</div>
                      <div className="text-[10px] text-slate-400">{c.email}</div>
                    </div>
                  </div>
                  <span className="text-slate-500 font-mono text-xs">{c.loyaltyTier} Tier</span>
                </button>
              ))}
            </div>
          )}

          {/* SKUs Section */}
          {matchedInventory.length > 0 && (
            <div className="py-2">
              <div className="px-3 text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1.5">
                <Package className="w-3 h-3 text-indigo-600" /> Products & SKUs
              </div>
              {matchedInventory.map((i) => (
                <button
                  key={i.id}
                  onClick={() => {
                    onSelectInventory(i);
                    onClose();
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded-xl flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <img src={i.image} alt="" className="w-6 h-6 rounded object-cover" />
                    <div>
                      <div className="font-medium text-slate-900 group-hover:text-[#122B52] transition-colors">{i.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">SKU: {i.sku}</div>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-slate-800">₹{i.price.toLocaleString()}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
