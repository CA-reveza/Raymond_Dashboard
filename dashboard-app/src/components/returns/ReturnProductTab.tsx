import React, { useState } from 'react';
import {
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Package,
  FileText,
  DollarSign,
  User,
  ShoppingBag,
  Calendar,
  Filter,
  Search,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Download,
} from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { downloadReportFile } from '../../utils/exportAndPrint';
import {
  Order,
  InventoryItem,
  ReturnRecord,
  ReturnReason,
  ReturnStatus,
} from '../../types';

interface ReturnProductTabProps {
  orders?: Order[];
  inventory?: InventoryItem[];
  returns?: ReturnRecord[];
  onProcessReturn: (newReturn: Omit<ReturnRecord, 'id'>) => void;
}

export const ReturnProductTab: React.FC<ReturnProductTabProps> = ({
  orders = [],
  inventory = [],
  returns = [],
  onProcessReturn,
}) => {
  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeInventory = Array.isArray(inventory) ? inventory : [];
  const safeReturns = Array.isArray(returns) ? returns : [];

  // Form State
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [productName, setProductName] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<ReturnReason>('Damaged');
  const [refundAmount, setRefundAmount] = useState<string>('');
  const [returnDate, setReturnDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [status, setStatus] = useState<ReturnStatus>('Approved');
  const [restockInventory, setRestockInventory] = useState<boolean>(true);

  // Success Feedback Toast
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filter & Search for returns list
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Handle Order Selection auto-fill
  const handleOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const orderId = e.target.value;
    setSelectedOrderId(orderId);

    const foundOrder = safeOrders.find((o) => o.id === orderId);
    if (foundOrder) {
      setCustomerName(foundOrder.customerName);
      if (foundOrder.items && foundOrder.items.length > 0) {
        const item = foundOrder.items[0];
        setProductName(item.name);
        setQuantity(item.quantity || 1);
        setRefundAmount(foundOrder.totalAmount.toString());
      }
    }
  };

  // Handle Product selection auto-fill
  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const prodName = e.target.value;
    setProductName(prodName);

    const foundItem = safeInventory.find((i) => i.name === prodName);
    if (foundItem) {
      setRefundAmount((foundItem.price * quantity).toString());
    }
  };

  const handleQuantityChange = (newQty: number) => {
    const validQty = Math.max(1, newQty);
    setQuantity(validQty);

    const foundItem = safeInventory.find((i) => i.name === productName);
    if (foundItem) {
      setRefundAmount((foundItem.price * validQty).toString());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      alert('Please enter or select a customer name.');
      return;
    }
    if (!productName.trim()) {
      alert('Please select or enter a product name.');
      return;
    }
    const numericRefund = parseFloat(refundAmount);
    if (isNaN(numericRefund) || numericRefund < 0) {
      alert('Please enter a valid refund amount.');
      return;
    }

    const matchedInventoryItem = safeInventory.find(
      (i) => i.name.toLowerCase() === productName.toLowerCase()
    );

    onProcessReturn({
      orderId: selectedOrderId || `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      customerName,
      productName,
      sku: matchedInventoryItem?.sku || 'SKU-RET-GEN',
      quantity,
      reason,
      refundAmount: numericRefund,
      returnDate,
      status,
      restockInventory,
    });

    setSuccessMessage(
      `Return processed successfully! ${
        status === 'Approved'
          ? `₹${numericRefund.toLocaleString('en-IN')} deducted from Sales.`
          : 'Status set to ' + status + '.'
      } ${
        restockInventory && status === 'Approved'
          ? `+${quantity} unit(s) restocked to Inventory.`
          : ''
      }`
    );

    setTimeout(() => {
      setSuccessMessage(null);
    }, 6000);

    setSelectedOrderId('');
    setCustomerName('');
    setProductName('');
    setQuantity(1);
    setRefundAmount('');
  };

  const filteredReturns = safeReturns.filter((r) => {
    const matchesSearch =
      r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-[18px] p-5 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#2D74B2] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Returns & Refunds
            </span>
            <span className="text-xs text-gray-400 font-mono">Real-time Financial Sync</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Return Product & Refund Management Module
          </h2>
          <p className="text-xs text-gray-300 mt-1 max-w-2xl">
            Process customer returns, issue verified refunds, and update store inventory in real-time across all sales metric panels.
          </p>
        </div>

        <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 flex items-center gap-3">
          <RotateCcw className="w-8 h-8 text-[#2D74B2]" />
          <div>
            <div className="text-[10px] font-bold text-gray-300 uppercase font-mono">Total Approved Returns</div>
            <div className="text-lg font-bold text-white font-mono">
              {safeReturns.filter((r) => r.status === 'Approved').length + 866} Requests
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 flex items-start gap-3 shadow-sm animate-in slide-in-from-top duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-bold text-emerald-900">Return Process Completed Successfully</p>
            <p className="mt-0.5 text-emerald-700">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Main Grid: Return Form on Left, Log on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Return Process Form Card (5 cols) */}
        <Card className="lg:col-span-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-[#2D74B2]" />
                <h3 className="font-bold text-base text-gray-900">Process New Return</h3>
              </div>
              <span className="text-[10px] bg-rose-50 text-[#2D74B2] font-bold px-2 py-0.5 rounded">
                Live POS
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Order ID Selection */}
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Order ID <span className="text-gray-400 font-normal">(Select existing or enter new)</span>
                </label>
                <div className="flex gap-2">
                  <select
                    value={selectedOrderId}
                    onChange={handleOrderChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 font-medium text-gray-800 focus:outline-none focus:border-[#2D74B2] focus:ring-1 focus:ring-[#2D74B2]"
                  >
                    <option value="">-- Choose Recent Order --</option>
                    {safeOrders.map((ord) => (
                      <option key={ord.id} value={ord.id}>
                        {ord.id} - {ord.customerName} ({formatINR(ord.totalAmount)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Customer Name */}
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Customer Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ananya Deshmukh"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 font-medium text-gray-900 focus:outline-none focus:border-[#2D74B2] focus:ring-1 focus:ring-[#2D74B2]"
                />
              </div>

              {/* Product Name */}
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Product Name <span className="text-rose-500">*</span>
                </label>
                <select
                  value={productName}
                  onChange={handleProductChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 font-medium text-gray-900 focus:outline-none focus:border-[#2D74B2] focus:ring-1 focus:ring-[#2D74B2]"
                >
                  <option value="">-- Select Product From Catalog --</option>
                  {safeInventory.map((item) => (
                    <option key={item.id} value={item.name}>
                      {item.name} ({formatINR(item.price)})
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Or enter custom product name manually..."
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 mt-1 font-medium text-gray-800 text-[11px] focus:outline-none focus:border-[#2D74B2]"
                />
              </div>

              {/* Quantity & Refund Amount */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 font-mono font-bold text-gray-900 focus:outline-none focus:border-[#2D74B2]"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">
                    Refund Amount (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 2000"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 font-mono font-bold text-gray-900 focus:outline-none focus:border-[#2D74B2]"
                  />
                </div>
              </div>

              {/* Return Reason & Return Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Return Reason</label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value as ReturnReason)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 font-semibold text-gray-800 focus:outline-none focus:border-[#2D74B2]"
                  >
                    <option value="Damaged">Damaged</option>
                    <option value="Wrong Size">Wrong Size</option>
                    <option value="Wrong Product">Wrong Product</option>
                    <option value="Customer Changed Mind">Customer Changed Mind</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Return Date</label>
                  <input
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 font-medium text-gray-800 focus:outline-none focus:border-[#2D74B2]"
                  />
                </div>
              </div>

              {/* Return Status */}
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Return Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ReturnStatus)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 font-bold text-gray-900 focus:outline-none focus:border-[#2D74B2]"
                >
                  <option value="Approved">Approved (Deducts Sales immediately)</option>
                  <option value="Pending Inspection">Pending Inspection</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              {/* Restock Inventory Checkbox */}
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-gray-900 block">Restock Inventory</span>
                  <span className="text-[10px] text-gray-500">
                    If checked, increases Product Inventory by +{quantity} unit(s).
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={restockInventory}
                  onChange={(e) => setRestockInventory(e.target.checked)}
                  className="w-5 h-5 accent-[#2D74B2] rounded cursor-pointer"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full justify-center mt-2 shadow-sm font-bold"
                icon={<RotateCcw className="w-4 h-4" />}
              >
                Process Return
              </Button>
            </form>
          </div>
        </Card>

        {/* Processed Returns Log Table (7 cols) */}
        <Card className="lg:col-span-7 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3 mb-4">
              <div>
                <h3 className="font-bold text-base text-gray-900">Return History & Audit Log</h3>
                <p className="text-xs text-gray-500">
                  Itemized log of customer return requests and inventory restock state
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search returns..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-gray-50 border border-gray-200 text-xs rounded-lg pl-7 pr-2 py-1.5 focus:outline-none focus:border-[#2D74B2]"
                  />
                </div>

                <button
                  onClick={() => {
                    const exportRows = filteredReturns.map((r) => ({
                      'Return ID': r.id,
                      'Order ID': r.orderId,
                      'Customer Name': r.customerName,
                      'Product Item': r.productName,
                      'SKU Code': r.sku,
                      'Quantity': r.quantity,
                      'Return Reason': r.reason,
                      'Refund Amount (INR)': r.refundAmount,
                      'Return Date': r.returnDate,
                      'Restocked to Inventory': r.restockInventory ? 'Yes' : 'No',
                      'Audit Status': r.status,
                    }));
                    downloadReportFile('Returns_Refund_Audit_Ledger', 'CSV', 'Raymonds Nationwide', exportRows);
                  }}
                  className="p-1.5 bg-gray-50 border border-gray-200 hover:bg-gray-100 rounded-lg text-gray-600 cursor-pointer flex items-center gap-1 text-xs font-semibold"
                  title="Export Returns Audit CSV"
                >
                  <Download className="w-3.5 h-3.5 text-[#2D74B2]" />
                  <span>Export</span>
                </button>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-gray-50 border border-gray-200 text-xs font-semibold rounded-lg py-1.5 px-2 text-gray-700 cursor-pointer"
                >
                  <option value="All">All Status</option>
                  <option value="Approved">Approved</option>
                  <option value="Pending Inspection">Pending</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Returns Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gray-50 text-gray-400 font-bold uppercase tracking-wider text-[10px] border-b border-gray-200">
                    <th className="py-2.5 px-3">Return ID</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Product Item</th>
                    <th className="py-2.5 px-3">Reason</th>
                    <th className="py-2.5 px-3">Refund</th>
                    <th className="py-2.5 px-3">Restocked</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredReturns.map((ret) => (
                    <tr key={ret.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-gray-900">
                        {ret.id}
                        <div className="text-[10px] text-gray-400 font-normal">{ret.returnDate}</div>
                      </td>
                      <td className="py-3 px-3 font-semibold text-gray-800">
                        {ret.customerName}
                        <div className="text-[10px] text-gray-400 font-mono">{ret.orderId}</div>
                      </td>
                      <td className="py-3 px-3 text-gray-800">
                        <span className="font-medium max-w-[150px] block truncate">
                          {ret.productName}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">Qty: {ret.quantity}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="bg-gray-100 text-gray-700 text-[10px] font-semibold px-2 py-0.5 rounded">
                          {ret.reason}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-rose-600">
                        {formatINR(ret.refundAmount)}
                      </td>
                      <td className="py-3 px-3">
                        {ret.restockInventory ? (
                          <span className="bg-emerald-50 text-emerald-700 font-bold text-[10px] px-2 py-0.5 rounded inline-flex items-center gap-1">
                            ✓ Yes (+{ret.quantity})
                          </span>
                        ) : (
                          <span className="bg-gray-100 text-gray-500 font-medium text-[10px] px-2 py-0.5 rounded">
                            No
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span
                          className={`font-bold text-[10px] px-2 py-0.5 rounded inline-block ${
                            ret.status === 'Approved'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : ret.status === 'Pending Inspection'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {ret.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredReturns.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <RotateCcw className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-semibold">No returns match your search filter</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
