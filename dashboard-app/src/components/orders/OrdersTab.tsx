import React, { useState } from 'react';
import {
  Search,
  Filter,
  Eye,
  Printer,
  ShoppingBag,
  Clock,
  MapPin,
  CreditCard,
  Truck,
  CheckCircle2,
  XCircle,
  FileText,
  ChevronRight,
  Send,
} from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { StatusBadge, LoyaltyBadge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { Order, OrderStatus } from '../../types';
import { printOrderInvoice, printPicklists, downloadReportFile } from '../../utils/exportAndPrint';

interface OrdersTabProps {
  orders: Order[];
  onViewOrderDetails: (order: Order) => void;
  selectedOrder: Order | null;
  isOrderModalOpen: boolean;
  onCloseOrderModal: () => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
}

export const OrdersTab: React.FC<OrdersTabProps> = ({
  orders,
  onViewOrderDetails,
  selectedOrder,
  isOrderModalOpen,
  onCloseOrderModal,
  onUpdateOrderStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [paymentFilter, setPaymentFilter] = useState<string>('All');
  const [selectedOrdersList, setSelectedOrdersList] = useState<string[]>([]);

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      (order.id || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
      (order.customerName || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
      (order.customerEmail || '').toLowerCase().includes((searchTerm || '').toLowerCase());

    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    const matchesPayment = paymentFilter === 'All' || order.paymentMethod === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  const toggleSelectAll = () => {
    if (selectedOrdersList.length === filteredOrders.length) {
      setSelectedOrdersList([]);
    } else {
      setSelectedOrdersList(filteredOrders.map((o) => o.id));
    }
  };

  const toggleSelectOrder = (id: string) => {
    if (selectedOrdersList.includes(id)) {
      setSelectedOrdersList(selectedOrdersList.filter((item) => item !== id));
    } else {
      setSelectedOrdersList([...selectedOrdersList, id]);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Quick Stats Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Order Management</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Track, process, and inspect omnichannel retail orders
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<Printer className="w-3.5 h-3.5" />}
            onClick={() => {
              const targetOrders = selectedOrdersList.length > 0
                ? orders.filter((o) => selectedOrdersList.includes(o.id))
                : filteredOrders;
              printPicklists(targetOrders);
            }}
          >
            Print Picklists ({selectedOrdersList.length || filteredOrders.length})
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<FileText className="w-3.5 h-3.5" />}
            onClick={() => {
              const targetOrders = selectedOrdersList.length > 0
                ? orders.filter((o) => selectedOrdersList.includes(o.id))
                : filteredOrders;
              const exportRows = targetOrders.map((o) => ({
                'Order ID': o.id,
                'Customer Name': o.customerName,
                'Email': o.customerEmail,
                'Phone': o.customerPhone,
                'Loyalty Tier': o.loyaltyTier,
                'Store Location': o.storeLocation,
                'Total Amount': o.totalAmount,
                'Payment Method': o.paymentMethod,
                'Status': o.status,
                'Date': `${o.date} ${o.time}`,
                'Shipping Address': o.shippingAddress,
              }));
              downloadReportFile('Orders_Ledger_Export', 'CSV', 'Raymond Nationwide', exportRows);
            }}
          >
            Export Selected CSV
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-4! space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search Order ID, Name, Email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-white/5 hover:bg-slate-100/80 focus:bg-white dark:focus:bg-[#141F38] text-xs text-slate-900 dark:text-slate-100 pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 focus:border-[#122B52] focus:ring-2 focus:ring-[#122B52]/20 outline-none transition-all"
            />
          </div>

          {/* Status Dropdown */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-white/5 hover:bg-slate-100/80 text-xs text-slate-800 dark:text-slate-200 font-medium py-2.5 px-3 rounded-xl border border-slate-200 dark:border-white/10 focus:border-[#122B52] focus:ring-2 focus:ring-[#122B52]/20 outline-none appearance-none cursor-pointer"
            >
              <option value="All">All Order Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Delivered">Delivered</option>
              <option value="Processing">Processing</option>
              <option value="In Transit">In Transit</option>
              <option value="Returned">Returned</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <Filter className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute right-3 top-3.5 pointer-events-none" />
          </div>

          {/* Payment Method Filter */}
          <div className="relative">
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-white/5 hover:bg-slate-100/80 text-xs text-slate-800 dark:text-slate-200 font-medium py-2.5 px-3 rounded-xl border border-slate-200 dark:border-white/10 focus:border-[#122B52] focus:ring-2 focus:ring-[#122B52]/20 outline-none appearance-none cursor-pointer"
            >
              <option value="All">All Payment Types</option>
              <option value="First Citizen Pay">First Citizen Pay</option>
              <option value="UPI">UPI Payment</option>
              <option value="Razorpay">Razorpay</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Store Card">Store Card</option>
              <option value="COD">Cash On Delivery (COD)</option>
            </select>
            <Filter className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute right-3 top-3.5 pointer-events-none" />
          </div>

          {/* Clear Filters */}
          <div className="flex items-center justify-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('All');
                setPaymentFilter('All');
              }}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-[#122B52] font-semibold underline cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </Card>

      {/* Orders Table */}
      <Card className="p-0! overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={
                      selectedOrdersList.length === filteredOrders.length &&
                      filteredOrders.length > 0
                    }
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300 text-[#122B52] focus:ring-[#122B52]"
                  />
                </th>
                <th className="py-3.5 px-4">Order ID & Date</th>
                <th className="py-3.5 px-4">Customer Info</th>
                <th className="py-3.5 px-4">Loyalty Tier</th>
                <th className="py-3.5 px-4">Store Location</th>
                <th className="py-3.5 px-4">Items</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/10">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    No orders matched your search criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isSelected = selectedOrdersList.includes(order.id);
                  return (
                    <tr
                      key={order.id}
                      onClick={() => onViewOrderDetails(order)}
                      className={`hover:bg-slate-50/80 transition-colors cursor-pointer group ${
                        isSelected ? 'bg-rose-50/20' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOrder(order.id)}
                          className="rounded border-slate-300 text-[#122B52] focus:ring-[#122B52]"
                        />
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#122B52] transition-colors">{order.id}</div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" /> {order.date} • {order.time}
                        </div>
                        {order.channel && (
                          <span className="inline-flex items-center mt-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#122B52]/10 dark:bg-sky-400/10 text-[#122B52] dark:text-sky-300 border border-[#122B52]/20 dark:border-sky-400/20">
                            {order.channel}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">{order.customerName}</div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate max-w-[160px]">
                          {order.customerEmail}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <LoyaltyBadge tier={order.loyaltyTier} />
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium truncate max-w-[150px]">
                        {order.storeLocation}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-semibold">
                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-slate-900 dark:text-slate-100">
                        {formatINR(order.totalAmount)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                        {order.paymentMethod}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1">
                        <button
                          onClick={() => onViewOrderDetails(order)}
                          className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-[#122B52] hover:bg-[#122B52]/10 rounded-lg transition-colors cursor-pointer"
                          title="View Order Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => printOrderInvoice(order)}
                          className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                          title="Print Tax Invoice"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Order Details Modal Dialog */}
      {selectedOrder && (
        <Modal
          isOpen={isOrderModalOpen}
          onClose={onCloseOrderModal}
          title={`Order Invoice Details - ${selectedOrder.id}`}
          subtitle={`Placed on ${selectedOrder.date} at ${selectedOrder.time} via ${selectedOrder.storeLocation}${selectedOrder.channel ? ` — ${selectedOrder.channel}` : ''}`}
          maxWidth="2xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Update Status:</span>
                <select
                  value={selectedOrder.status}
                  onChange={(e) =>
                    onUpdateOrderStatus(selectedOrder.id, e.target.value as OrderStatus)
                  }
                  className="bg-white dark:bg-[#141F38] text-xs font-semibold text-slate-800 dark:text-slate-200 border border-slate-300 rounded-lg px-2.5 py-1 focus:ring-2 focus:ring-[#122B52]/20"
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Processing">Processing</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Returned">Returned</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={onCloseOrderModal}>
                  Close
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Printer className="w-3.5 h-3.5" />}
                  onClick={() => printOrderInvoice(selectedOrder)}
                >
                  Print / Download Tax Invoice
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-6">
            {/* Status Stepper Timeline */}
            <div className="p-4 bg-slate-50 dark:bg-white/5 border border-slate-200/80 rounded-2xl">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                Order Delivery Status Tracker
              </div>
              <div className="grid grid-cols-4 gap-2 text-center relative">
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold mb-1">
                    ✓
                  </div>
                  <span className="text-[11px] font-semibold text-slate-900 dark:text-slate-100">Order Placed</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">{selectedOrder.time}</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold mb-1">
                    ✓
                  </div>
                  <span className="text-[11px] font-semibold text-slate-900 dark:text-slate-100">POS Verified</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">Payment OK</span>
                </div>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${
                      selectedOrder.status === 'In Transit' || selectedOrder.status === 'Delivered'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-200 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Truck className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-900 dark:text-slate-100">Dispatched</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                    {selectedOrder.trackingNumber || 'AWB-PENDING'}
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${
                      selectedOrder.status === 'Delivered'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-200 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-900 dark:text-slate-100">Delivered</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">{selectedOrder.status}</span>
                </div>
              </div>
            </div>

            {/* Customer & Shipping Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white dark:bg-[#141F38] border border-slate-200 dark:border-white/10 rounded-xl">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 flex items-center gap-1.5">
                  Customer & Loyalty
                </div>
                <div className="font-bold text-sm text-slate-900 dark:text-slate-100">{selectedOrder.customerName}</div>
                <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{selectedOrder.customerEmail}</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">{selectedOrder.customerPhone}</div>
                <div className="mt-2">
                  <LoyaltyBadge tier={selectedOrder.loyaltyTier} />
                </div>
              </div>

              <div className="p-4 bg-white dark:bg-[#141F38] border border-slate-200 dark:border-white/10 rounded-xl">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#122B52]" /> Shipping Address
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {selectedOrder.shippingAddress}
                </p>
                <div className="mt-2 text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" /> Payment via{' '}
                  <span className="text-[#122B52]">{selectedOrder.paymentMethod}</span>
                </div>
              </div>
            </div>

            {/* Itemized Products Table */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Purchased Line Items
              </div>
              <div className="border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-white/10">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="p-3 bg-white dark:bg-[#141F38] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover border border-slate-200 dark:border-white/10"
                      />
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-slate-100">{item.name}</div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                          SKU: {item.sku} • Category: {item.category}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-xs text-slate-900 dark:text-slate-100">
                        {formatINR(item.unitPrice * item.quantity)}
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500">
                        {item.quantity} x {formatINR(item.unitPrice)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Calculation */}
            <div className="p-4 bg-slate-900 text-white rounded-xl flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">
                  Grand Total (incl. 18% GST)
                </div>
                <div className="text-[10px] text-emerald-400 font-mono">
                  First Citizen Points Earned: +{Math.floor(selectedOrder.totalAmount / 100)} Points
                </div>
              </div>
              <div className="text-xl font-extrabold text-white">
                {formatINR(selectedOrder.totalAmount)}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
