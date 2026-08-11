import React, { useState } from 'react';
import { apiUrl } from '../../config/api';
import {
  Ticket,
  Plus,
  Copy,
  Check,
  Calendar,
  Percent,
  Tag,
  Search,
  Users,
  Download,
  Eye,
  ShoppingBag,
} from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { StatusBadge, LoyaltyBadge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { Coupon, CouponRedemption } from '../../types';
import { downloadReportFile } from '../../utils/exportAndPrint';

interface CouponsTabProps {
  coupons: Coupon[];
  onCreateCoupon: (coupon: Coupon) => void;
}

export const CouponsTab: React.FC<CouponsTabProps> = ({ coupons, onCreateCoupon }) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCouponForRedemptions, setSelectedCouponForRedemptions] = useState<Coupon | null>(null);
  const [redemptionSearchTerm, setRedemptionSearchTerm] = useState('');

  const [newCode, setNewCode] = useState('DIWALI25');
  const [newDesc, setNewDesc] = useState('Festive 25% Off across all designer categories');
  const [discountVal, setDiscountVal] = useState(25);
  const [minOrder, setMinOrder] = useState(3999);

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCreate = async () => {
    const created: Coupon = {
      id: `CPN-${Date.now().toString().slice(-4)}`,
      code: newCode.toUpperCase(),
      description: newDesc,
      discountType: 'Percentage',
      discountValue: discountVal,
      minOrderValue: minOrder,
      usageCount: 0,
      maxUsage: 1000,
      status: 'Active',
      startDate: '2026-07-27',
      endDate: '2026-08-31',
      applicableCategory: 'Site-wide',
      redemptions: [],
    };
    try {
      await fetch(apiUrl('/api/coupons'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(created)
      });
    } catch (e) {
      console.warn('Error syncing created coupon to server:', e);
    }
    onCreateCoupon(created);
    setIsModalOpen(false);
  };

  const activeCoupon = selectedCouponForRedemptions
    ? (coupons.find((cpn) => cpn && cpn.code && cpn.code.replace(/\s+/g, '').toUpperCase() === selectedCouponForRedemptions.code.replace(/\s+/g, '').toUpperCase()) || selectedCouponForRedemptions)
    : null;

  const activeRedemptions = activeCoupon?.redemptions || [];
  const filteredRedemptions = activeRedemptions.filter((r) => {
    if (!r) return false;
    const q = (redemptionSearchTerm || '').toLowerCase();
    return (
      (r.customerName || '').toLowerCase().includes(q) ||
      (r.customerEmail || '').toLowerCase().includes(q) ||
      (r.orderId || '').toLowerCase().includes(q) ||
      (r.storeLocation || '').toLowerCase().includes(q)
    );
  });

  const totalDiscountGiven = activeRedemptions.reduce((acc, curr) => acc + curr.discountSaved, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Promotional Coupons & Offer Manager
          </h2>
          <p className="text-xs text-slate-500">
            Configure automated discounts, campaign rules, and redemption limits
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => setIsModalOpen(true)}
        >
          Create New Campaign Coupon
        </Button>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
        {coupons.map((c) => {
          const usagePercent = Math.min(100, (c.usageCount / c.maxUsage) * 100);
          const redemptionCount = (c.redemptions || []).length;

          return (
            <Card key={c.id} className="relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-[#122B52]/10 text-[#122B52] rounded-xl font-bold">
                      <Ticket className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-base font-extrabold text-slate-900 font-mono tracking-wider">
                        {c.code}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        Category: {c.applicableCategory}
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={c.status} />
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-medium mb-4">
                  {c.description}
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4">
                  <div>
                    <span className="text-slate-400 font-medium">Discount Value:</span>
                    <div className="font-extrabold text-[#122B52] text-sm mt-0.5">
                      {c.discountType === 'Percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} FLAT`}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Min Order Value:</span>
                    <div className="font-bold text-slate-800 text-sm mt-0.5">
                      ₹{c.minOrderValue.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="space-y-1 text-xs mb-4">
                  <div className="flex justify-between text-slate-500 font-medium">
                    <span>Campaign Redemption Progress:</span>
                    <strong className="text-slate-800">
                      {c.usageCount} / {c.maxUsage} used ({usagePercent.toFixed(0)}%)
                    </strong>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-[#122B52] h-2 rounded-full"
                      style={{ width: `${usagePercent}%` }}
                    />
                  </div>
                </div>

                {/* Redeemed Customers Action Button */}
                <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-[#122B52]/10 rounded-lg text-[#122B52]">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        {redemptionCount} Redeemed Customer{redemptionCount !== 1 ? 's' : ''}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Track shoppers who redeemed {c.code}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="xs"
                    icon={<Eye className="w-3.5 h-3.5 text-[#122B52]" />}
                    onClick={() => {
                      setSelectedCouponForRedemptions(c);
                      setRedemptionSearchTerm('');
                    }}
                  >
                    View Customers
                  </Button>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs mt-4">
                <span className="text-slate-400 font-medium flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Valid till {c.endDate}
                </span>
                <button
                  onClick={() => copyToClipboard(c.code)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-[#122B52] cursor-pointer"
                >
                  {copiedCode === c.code ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied Code!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy Code
                    </>
                  )}
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Redeemed Customers List Modal */}
      <Modal
        isOpen={selectedCouponForRedemptions !== null}
        onClose={() => setSelectedCouponForRedemptions(null)}
        title={`Redeemed Customers for ${selectedCouponForRedemptions?.code || ''}`}
        subtitle={`Shoppers who successfully applied this promotional coupon code`}
        maxWidth="2xl"
        footer={
          <div className="flex items-center justify-between w-full text-xs">
            <span className="text-slate-500">
              Total Discount Value Saved:{' '}
              <strong className="text-[#122B52] font-mono text-sm">
                ₹{totalDiscountGiven.toLocaleString('en-IN')}
              </strong>
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={<Download className="w-3.5 h-3.5" />}
                onClick={() => {
                  if (!selectedCouponForRedemptions) return;
                  const exportRows = (selectedCouponForRedemptions.redemptions || []).map((r) => ({
                    'Coupon Code': r.couponCode,
                    'Customer Name': r.customerName,
                    'Customer Email': r.customerEmail,
                    'Customer Phone': r.customerPhone,
                    'Loyalty Tier': r.loyaltyTier,
                    'Order ID': r.orderId,
                    'Order Total (INR)': r.orderTotal,
                    'Discount Saved (INR)': r.discountSaved,
                    'Redemption Date & Time': r.redeemedAt,
                    'Store Location': r.storeLocation,
                  }));
                  downloadReportFile(
                    `Redeemed_Customers_${selectedCouponForRedemptions.code}`,
                    'CSV',
                    'Raymonds Nationwide',
                    exportRows
                  );
                }}
              >
                Export CSV
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setSelectedCouponForRedemptions(null)}
              >
                Close
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Summary Stats Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 font-medium block">Coupon Offer:</span>
              <span className="font-extrabold text-[#122B52] text-sm">
                {selectedCouponForRedemptions?.discountType === 'Percentage'
                  ? `${selectedCouponForRedemptions?.discountValue}% OFF`
                  : `₹${selectedCouponForRedemptions?.discountValue} FLAT`}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Redemption Count:</span>
              <span className="font-bold text-slate-800 text-sm">
                {activeRedemptions.length} Customer{activeRedemptions.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Applicable Scope:</span>
              <span className="font-semibold text-slate-700">
                {selectedCouponForRedemptions?.applicableCategory}
              </span>
            </div>
          </div>

          {/* Search Filter Bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by customer name, email, order ID, or store..."
              value={redemptionSearchTerm}
              onChange={(e) => setRedemptionSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white text-xs border border-slate-300 rounded-xl focus:border-[#122B52] outline-none"
            />
          </div>

          {/* Table of Redeemed Customers */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-3.5 py-2.5">Customer Info</th>
                  <th className="px-3.5 py-2.5">Loyalty Tier</th>
                  <th className="px-3.5 py-2.5">Order Details</th>
                  <th className="px-3.5 py-2.5">Store Location</th>
                  <th className="px-3.5 py-2.5 text-right">Discount Saved</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredRedemptions.length > 0 ? (
                  filteredRedemptions.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-3.5 py-3">
                        <div className="font-bold text-slate-900">{r.customerName}</div>
                        <div className="text-[11px] text-slate-400">{r.customerEmail}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{r.customerPhone}</div>
                      </td>
                      <td className="px-3.5 py-3">
                        <LoyaltyBadge tier={r.loyaltyTier} />
                      </td>
                      <td className="px-3.5 py-3 font-mono">
                        <div className="font-bold text-slate-800">{r.orderId}</div>
                        <div className="text-[10px] text-slate-400">{r.redeemedAt}</div>
                        <div className="text-[11px] text-slate-500">
                          Total: ₹{r.orderTotal.toLocaleString('en-IN')}
                        </div>
                      </td>
                      <td className="px-3.5 py-3 text-slate-700 font-medium">
                        {r.storeLocation}
                      </td>
                      <td className="px-3.5 py-3 text-right">
                        <div className="font-extrabold text-[#122B52] font-mono text-xs">
                          -₹{r.discountSaved.toLocaleString('en-IN')}
                        </div>
                        <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                          Saved
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-400 text-xs">
                      <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      No redemption records match your search query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>

      {/* Create Coupon Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Promotional Coupon Code"
        subtitle="Configure campaign rules & discount caps"
        maxWidth="md"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreate}>
              Publish Campaign Coupon
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Coupon Promo Code (Uppercase)
            </label>
            <input
              type="text"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              className="w-full font-mono uppercase font-bold text-sm bg-white p-2.5 rounded-xl border border-slate-300 focus:border-[#122B52] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Description / Terms
            </label>
            <input
              type="text"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full text-xs bg-white p-2.5 rounded-xl border border-slate-300 focus:border-[#122B52] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Discount Percentage (%)
              </label>
              <input
                type="number"
                value={discountVal}
                onChange={(e) => setDiscountVal(Number(e.target.value))}
                className="w-full font-bold bg-white p-2.5 rounded-xl border border-slate-300 focus:border-[#122B52] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Min Order Threshold (₹)
              </label>
              <input
                type="number"
                value={minOrder}
                onChange={(e) => setMinOrder(Number(e.target.value))}
                className="w-full font-bold bg-white p-2.5 rounded-xl border border-slate-300 focus:border-[#122B52] outline-none"
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
