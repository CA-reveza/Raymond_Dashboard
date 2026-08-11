import React, { useState, useEffect } from 'react';
import {
  Package,
  Search,
  AlertTriangle,
  RefreshCw,
  Plus,
  Layers,
  ArrowUpDown,
  ChevronRight,
  Filter,
  X,
  Download,
} from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { StatusBadge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { InventoryItem } from '../../types';
import { downloadReportFile } from '../../utils/exportAndPrint';

interface InventoryTabProps {
  inventory: InventoryItem[];
  onUpdateStock: (itemId: string, newStock: number) => void;
  selectedItemFromApp?: InventoryItem | null;
  onClearSelectedItemFromApp?: () => void;
  selectedStore?: string;
}

type StockFilter = 'All' | 'In Stock' | 'Low Stock' | 'Out of Stock';

export const InventoryTab: React.FC<InventoryTabProps> = ({
  inventory,
  onUpdateStock,
  selectedItemFromApp,
  onClearSelectedItemFromApp,
  selectedStore = 'All Stores (Nationwide)',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentTab, setDepartmentTab] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<StockFilter>('All');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [adjustmentQty, setAdjustmentQty] = useState<number>(10);

  useEffect(() => {
    if (selectedItemFromApp) {
      setSelectedItem(selectedItemFromApp);
      setAdjustmentQty(10);
    }
  }, [selectedItemFromApp]);

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const departments = [
    'All',
    'Menswear',
    'Womenswear',
    'Beauty & Perfumes',
    'Luxury Watches',
    'Handbags & Accessories',
    'Footwear',
    'Home & Living',
  ];

  const getStoreInventory = (items: InventoryItem[], store: string) => {
    if (store === 'All Stores (Nationwide)') return items;
    const prefixMap: Record<string, string> = {
      'Mumbai - Malad West Flagship': 'MUM',
      'Delhi - Select CITYWALK Saket': 'DEL',
      'Bengaluru - MG Road Metro': 'BLR',
      'Kolkata - South City Mall': 'KOL',
      'Hyderabad - Inorbit Mall Hitec City': 'HYD',
      'Online Store (eCom Direct)': 'ECOM',
    };
    const prefix = prefixMap[store] || 'RAY';
    const storeShort = (store || '').split(' - ')[0] || 'Store';

    return items.map((item) => ({
      ...item,
      sku: `${prefix}-${item.sku}`,
      location: `${storeShort} ${item.location}`,
    }));
  };

  const activeInventory = getStoreInventory(inventory, selectedStore);

  const filteredInventory = activeInventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = departmentTab === 'All' || item.department === departmentTab;

    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'In Stock' && item.status === 'In Stock') ||
      (statusFilter === 'Low Stock' && item.status === 'Low Stock') ||
      (statusFilter === 'Out of Stock' && item.status === 'Out of Stock');

    return matchesSearch && matchesDept && matchesStatus;
  });

  const lowStockCount = inventory.filter((i) => i.status === 'Low Stock').length;
  const outOfStockCount = inventory.filter((i) => i.status === 'Out of Stock').length;
  const inStockCount = inventory.length - lowStockCount - outOfStockCount;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Inventory & Warehouse Telemetry
          </h2>
          <p className="text-xs text-slate-500">
            Real-time stock audit across store aisles & central fulfillment centers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<Download className="w-3.5 h-3.5" />}
            onClick={() => {
              const exportRows = filteredInventory.map((i) => ({
                'SKU Code': i.sku,
                'Product Name': i.name,
                'Category': i.category,
                'Unit Price (INR)': i.price,
                'Current Stock Level': i.stock,
                'Min Threshold': i.lowStockThreshold,
                'Store Location': i.location,
                'Status': i.stock === 0 ? 'Out of Stock' : i.stock <= i.lowStockThreshold ? 'Low Stock' : 'In Stock',
              }));
              downloadReportFile('Store_Inventory_Valuation_Ledger', 'CSV', 'Raymonds Flagship', exportRows);
            }}
          >
            Export Stock CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCw className="w-3.5 h-3.5 text-[#2D74B2]" />}
            onClick={() => alert('ERP Stock Sync Completed')}
          >
            ERP Sync
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => alert('Add New SKU Modal Opened')}
          >
            Add New SKU
          </Button>
        </div>
      </div>

      {/* Stock Overview Banner (Interactive Filter Buttons) */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* Total Monitored SKUs */}
        <button
          onClick={() => setStatusFilter('All')}
          className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
            statusFilter === 'All'
              ? 'bg-slate-900 text-white border-slate-900 ring-2 ring-slate-900/20 shadow-md scale-[1.01]'
              : 'bg-white text-slate-900 border-slate-200 hover:border-slate-300 hover:shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${statusFilter === 'All' ? 'text-slate-300' : 'text-slate-400'}`}>
              Total Monitored SKUs
            </span>
            <ChevronRight className={`w-4 h-4 ${statusFilter === 'All' ? 'text-white' : 'text-slate-400'}`} />
          </div>
          <div className="text-2xl font-bold mt-1">{inventory.length} SKUs</div>
          <p className={`text-[10px] mt-1 ${statusFilter === 'All' ? 'text-slate-300 font-medium' : 'text-slate-400'}`}>
            {statusFilter === 'All' ? '✓ Showing All Items' : 'Click to view all SKUs'}
          </p>
        </button>

        {/* In Stock & Available */}
        <button
          onClick={() => setStatusFilter('In Stock')}
          className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
            statusFilter === 'In Stock'
              ? 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-600/20 shadow-md scale-[1.01]'
              : 'bg-emerald-50/50 text-emerald-900 border-emerald-200/60 hover:border-emerald-300 hover:shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${statusFilter === 'In Stock' ? 'text-emerald-100' : 'text-emerald-700'}`}>
              In Stock & Available
            </span>
            <ChevronRight className={`w-4 h-4 ${statusFilter === 'In Stock' ? 'text-white' : 'text-emerald-500'}`} />
          </div>
          <div className="text-2xl font-bold mt-1">{inStockCount} SKUs</div>
          <p className={`text-[10px] mt-1 ${statusFilter === 'In Stock' ? 'text-emerald-100 font-medium' : 'text-emerald-600'}`}>
            {statusFilter === 'In Stock' ? '✓ Showing In-Stock Items' : 'Click to filter in-stock'}
          </p>
        </button>

        {/* Low Stock Alerts */}
        <button
          onClick={() => setStatusFilter('Low Stock')}
          className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
            statusFilter === 'Low Stock'
              ? 'bg-amber-600 text-white border-amber-600 ring-2 ring-amber-600/20 shadow-md scale-[1.01]'
              : 'bg-amber-50/50 text-amber-900 border-amber-200/60 hover:border-amber-300 hover:shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${statusFilter === 'Low Stock' ? 'text-amber-100' : 'text-amber-700'}`}>
              Low Stock Alerts
            </span>
            <ChevronRight className={`w-4 h-4 ${statusFilter === 'Low Stock' ? 'text-white' : 'text-amber-500'}`} />
          </div>
          <div className="text-2xl font-bold mt-1">{lowStockCount} Items</div>
          <p className={`text-[10px] mt-1 ${statusFilter === 'Low Stock' ? 'text-amber-100 font-medium' : 'text-amber-600'}`}>
            {statusFilter === 'Low Stock' ? '✓ Showing Low Stock Items' : 'Click to view low stock'}
          </p>
        </button>

        {/* Out of Stock */}
        <button
          onClick={() => setStatusFilter('Out of Stock')}
          className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
            statusFilter === 'Out of Stock'
              ? 'bg-rose-600 text-white border-rose-600 ring-2 ring-rose-600/20 shadow-md scale-[1.01]'
              : 'bg-rose-50/50 text-rose-900 border-rose-200/60 hover:border-rose-300 hover:shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${statusFilter === 'Out of Stock' ? 'text-rose-100' : 'text-rose-700'}`}>
              Out of Stock
            </span>
            <ChevronRight className={`w-4 h-4 ${statusFilter === 'Out of Stock' ? 'text-white' : 'text-rose-500'}`} />
          </div>
          <div className="text-2xl font-bold mt-1">{outOfStockCount} Items</div>
          <p className={`text-[10px] mt-1 ${statusFilter === 'Out of Stock' ? 'text-rose-100 font-medium' : 'text-rose-600'}`}>
            {statusFilter === 'Out of Stock' ? '✓ Showing Out of Stock' : 'Click to view out of stock'}
          </p>
        </button>
      </div>

      {/* Active Status Filter Indicator Banner */}
      {statusFilter !== 'All' && (
        <div className="flex items-center justify-between bg-gray-900 text-white rounded-xl px-4 py-2.5 text-xs shadow-sm">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#2D74B2]" />
            <span className="font-semibold text-gray-300">Active Stock Filter:</span>
            <span className={`font-bold px-2 py-0.5 rounded-md text-[11px] ${
              statusFilter === 'In Stock'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : statusFilter === 'Low Stock'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}>
              {statusFilter} ({filteredInventory.length} SKUs found)
            </span>
          </div>
          <button
            onClick={() => setStatusFilter('All')}
            className="text-xs font-semibold text-gray-300 hover:text-white hover:underline cursor-pointer flex items-center gap-1"
          >
            <X className="w-3 h-3" /> Reset Filter
          </button>
        </div>
      )}

      {/* Filter Tabs & Search */}
      <Card className="p-4! space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Department Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0 custom-scrollbar">
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setDepartmentTab(dept)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  departmentTab === dept
                    ? 'bg-[#122B52] text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search product SKU or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs text-slate-900 pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#122B52] focus:ring-2 focus:ring-[#122B52]/20 outline-none transition-all"
            />
          </div>
        </div>
      </Card>

      {/* Inventory Table */}
      <Card className="p-0! overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">SKU & Item Name</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Aisle Location</th>
                <th className="py-3.5 px-4">Retail Price</th>
                <th className="py-3.5 px-4">Stock Level</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInventory.map((item) => {
                const stockRatio = Math.min(100, Math.max(0, (item.stock / 30) * 100));
                return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    onClick={() => {
                      setSelectedItem(item);
                      setAdjustmentQty(10);
                    }}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-slate-900 group-hover:text-[#122B52] transition-colors line-clamp-1">{item.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            SKU: {item.sku}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">{item.department}</td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                      {item.location}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-900">
                      {formatINR(item.price)}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 mb-1">{item.stock} Units</div>
                      <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full ${
                            item.stock === 0
                              ? 'bg-rose-500'
                              : item.stock <= item.minThreshold
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${stockRatio}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedItem(item);
                          setAdjustmentQty(10);
                        }}
                      >
                        Adjust Stock
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Adjust Stock Modal */}
      {selectedItem && (
        <Modal
          isOpen={!!selectedItem}
          onClose={() => {
            setSelectedItem(null);
            if (onClearSelectedItemFromApp) onClearSelectedItemFromApp();
          }}
          title={`Adjust Inventory Level - ${selectedItem.sku}`}
          subtitle={selectedItem.name}
          maxWidth="md"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <Button variant="outline" size="sm" onClick={() => setSelectedItem(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  onUpdateStock(selectedItem.id, selectedItem.stock + adjustmentQty);
                  setSelectedItem(null);
                }}
              >
                Save Adjustment
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-slate-400 font-medium">Current Stock On Hand:</span>
                <div className="text-lg font-bold text-slate-900">{selectedItem.stock} Units</div>
              </div>
              <StatusBadge status={selectedItem.status} />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Stock Quantity Change (+/- Units)
              </label>
              <input
                type="number"
                value={adjustmentQty}
                onChange={(e) => setAdjustmentQty(Number(e.target.value))}
                className="w-full bg-white text-sm font-mono font-bold text-slate-900 p-2.5 rounded-xl border border-slate-300 focus:border-[#122B52] focus:ring-2 focus:ring-[#122B52]/20 outline-none"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                New stock total will be:{' '}
                <strong className="text-slate-900">{selectedItem.stock + adjustmentQty} Units</strong>
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Warehouse Adjustment Reason / PO Note
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Received shipment from Tommy Hilfiger distributor PO-9812..."
                className="w-full bg-white text-xs p-2.5 rounded-xl border border-slate-300 focus:border-[#122B52] outline-none"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
