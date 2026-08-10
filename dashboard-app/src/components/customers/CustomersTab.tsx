import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Award,
  Phone,
  Mail,
  Calendar,
  Eye,
  Gift,
  Plus,
  Download,
} from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { LoyaltyBadge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { Customer, LoyaltyTier } from '../../types';
import { downloadReportFile } from '../../utils/exportAndPrint';
import { MarketplaceActivityPanel } from './MarketplaceActivityPanel';

interface CustomersTabProps {
  customers: Customer[];
  onEnrollCustomer?: (customer: Customer) => void;
  selectedCustomerFromApp?: Customer | null;
  onClearSelectedCustomerFromApp?: () => void;
}

export const CustomersTab: React.FC<CustomersTabProps> = ({
  customers,
  onEnrollCustomer,
  selectedCustomerFromApp,
  onClearSelectedCustomerFromApp,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('All');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    if (selectedCustomerFromApp) {
      setSelectedCustomer(selectedCustomerFromApp);
    }
  }, [selectedCustomerFromApp]);

  // Enroll Customer Modal State
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newTier, setNewTier] = useState<LoyaltyTier>('Silver');
  const [newCategory, setNewCategory] = useState('Beauty & Perfumes');
  const [welcomePoints, setWelcomePoints] = useState(500);

  const handleEnrollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim() || !newPhone.trim()) {
      alert('Please fill in the member full name, email, and phone number.');
      return;
    }

    const newCustomer: Customer = {
      id: `FC-${Math.floor(10000 + Math.random() * 90000)}`,
      name: newName.trim(),
      email: newEmail.trim(),
      phone: newPhone.trim(),
      loyaltyTier: newTier,
      loyaltyPoints: Number(welcomePoints) || 500,
      totalSpent: 0,
      totalOrders: 0,
      lastPurchaseDate: new Date().toISOString().split('T')[0],
      preferredCategory: newCategory,
      joinedDate: new Date().toISOString().split('T')[0],
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    };

    if (onEnrollCustomer) {
      onEnrollCustomer(newCustomer);
    }

    // Reset form
    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setNewTier('Silver');
    setNewCategory('Beauty & Perfumes');
    setWelcomePoints(500);
    setIsEnrollModalOpen(false);
  };

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const filteredCustomers = customers.filter((cust) => {
    const matchesSearch =
      (cust.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
      (cust.email || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
      cust.phone.includes(searchTerm);

    const matchesTier = tierFilter === 'All' || cust.loyaltyTier === tierFilter;

    return matchesSearch && matchesTier;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            First Citizen Loyalty CRM
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage high-net-worth retail shoppers & loyalty reward balances
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<Download className="w-3.5 h-3.5" />}
            onClick={() => {
              const exportRows = filteredCustomers.map((c) => ({
                'Member ID': c.id,
                'Full Name': c.name,
                'Email Address': c.email,
                'Phone Number': c.phone,
                'Loyalty Tier': c.loyaltyTier,
                'Reward Points Balance': c.points,
                'Lifetime Spend': c.totalSpent,
                'Total Orders': c.ordersCount,
                'Joined Date': c.joinDate,
              }));
              downloadReportFile('First_Citizen_Customers_CRM', 'CSV', 'Raymond Nationwide', exportRows);
            }}
          >
            Export Customers CSV
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsEnrollModalOpen(true)}
          >
            Enroll New Customer
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="p-4! space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search member by Name, Phone, Email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-white/5 hover:bg-slate-100/80 focus:bg-white dark:focus:bg-[#141F38] text-xs text-slate-900 dark:text-slate-100 pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 focus:border-[#122B52] focus:ring-2 focus:ring-[#122B52]/20 outline-none transition-all"
            />
          </div>

          <div className="relative">
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-white/5 hover:bg-slate-100/80 text-xs text-slate-800 dark:text-slate-200 font-medium py-2.5 px-3 rounded-xl border border-slate-200 dark:border-white/10 focus:border-[#122B52] outline-none appearance-none cursor-pointer"
            >
              <option value="All">All Loyalty Tiers</option>
              <option value="Black">Black First Citizen (VIP)</option>
              <option value="Platinum">Platinum First Citizen</option>
              <option value="Golden">Golden First Citizen</option>
              <option value="Silver">Silver First Citizen</option>
            </select>
          </div>

          <div className="flex items-center justify-end text-xs text-slate-500 dark:text-slate-400 font-semibold">
            Showing {filteredCustomers.length} Active Members
          </div>
        </div>
      </Card>

      {/* Customer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCustomers.map((cust) => (
          <Card
            key={cust.id}
            hoverEffect={true}
            className="flex flex-col justify-between cursor-pointer group hover:border-[#122B52]/30 hover:shadow-md transition-all"
            onClick={() => setSelectedCustomer(cust)}
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 leading-snug group-hover:text-[#122B52] transition-colors">{cust.name}</h3>
                  <div className="mt-1">
                    <LoyaltyBadge tier={cust.loyaltyTier} />
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-white/5 p-3 rounded-xl border border-slate-100 dark:border-white/10 my-3">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                  <span className="truncate">{cust.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                  <span>{cust.phone}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                <div className="p-2.5 bg-slate-100/70 rounded-xl">
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold">
                    Lifetime Spend
                  </div>
                  <div className="font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
                    {formatINR(cust.totalSpent)}
                  </div>
                </div>
                <div className="p-2.5 bg-amber-50/80 border border-amber-200/60 rounded-xl">
                  <div className="text-[10px] text-amber-800 uppercase font-semibold">
                    First Citizen Points
                  </div>
                  <div className="font-extrabold text-amber-900 mt-0.5">
                    {(cust.loyaltyPoints || 0).toLocaleString()} pts
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs mt-2">
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                Pref: <strong className="text-slate-800 dark:text-slate-200">{cust.preferredCategory}</strong>
              </span>
              <Button
                variant="outline"
                size="sm"
                icon={<Eye className="w-3.5 h-3.5 text-[#122B52]" />}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCustomer(cust);
                }}
              >
                Profile
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Customer Detail Profile Modal */}
      {selectedCustomer && (
        <Modal
          isOpen={!!selectedCustomer}
          onClose={() => {
            setSelectedCustomer(null);
            if (onClearSelectedCustomerFromApp) onClearSelectedCustomerFromApp();
          }}
          title={`Member Profile - ${selectedCustomer.name}`}
          subtitle={`First Citizen Member ID: ${selectedCustomer.id}`}
          maxWidth="lg"
          footer={
            <div className="flex items-center justify-between w-full">
              <Button
                variant="outline"
                size="sm"
                icon={<Gift className="w-3.5 h-3.5 text-[#122B52]" />}
                onClick={() => alert(`Bonus promo code issued to ${selectedCustomer.email}`)}
              >
                Send Exclusive Coupon
              </Button>
              <Button variant="primary" size="sm" onClick={() => setSelectedCustomer(null)}>
                Done
              </Button>
            </div>
          }
        >
          <div className="space-y-5">
            <div className="p-4 bg-slate-900 text-white rounded-2xl">
              <div>
                <h3 className="text-lg font-bold text-white">{selectedCustomer.name}</h3>
                <div className="mt-1">
                  <LoyaltyBadge tier={selectedCustomer.loyaltyTier} />
                </div>
                <div className="text-xs text-slate-300 mt-1">
                  Member since {selectedCustomer.joinedDate}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
                <div className="text-slate-400 dark:text-slate-500 uppercase font-semibold text-[10px]">
                  Total Completed Orders
                </div>
                <div className="text-lg font-bold text-slate-900 dark:text-slate-100">{selectedCustomer.totalOrders} Purchases</div>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-200 dark:border-amber-500/20">
                <div className="text-amber-700 dark:text-amber-400 uppercase font-semibold text-[10px]">
                  Reward Points Available
                </div>
                <div className="text-lg font-bold text-amber-900">
                  {selectedCustomer.loyaltyPoints.toLocaleString()} Points
                </div>
              </div>
            </div>

            <div className="p-4 border border-slate-200 dark:border-white/10 rounded-xl space-y-2 text-xs">
              <div className="font-bold text-slate-900 dark:text-slate-100">Contact & Preferences</div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Email:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{selectedCustomer.email}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Mobile Phone:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{selectedCustomer.phone}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Preferred Category:</span>
                <span className="font-semibold text-[#122B52]">
                  {selectedCustomer.preferredCategory}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Last Store Visit:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {selectedCustomer.lastPurchaseDate}
                </span>
              </div>
            </div>

            <div className="p-4 border border-slate-200 dark:border-white/10 rounded-xl space-y-2">
              <div className="font-bold text-slate-900 dark:text-slate-100 text-xs mb-1">
                Marketplace Activity
                <span className="font-normal text-slate-400 dark:text-slate-500 ml-1">
                  (Fashion, Restaurant &amp; Movie bookings across Axionik)
                </span>
              </div>
              <MarketplaceActivityPanel email={selectedCustomer.email} />
            </div>
          </div>
        </Modal>
      )}

      {/* Enroll New First Citizen Member Modal */}
      <Modal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        title="Enroll New First Citizen Loyalty Member"
        subtitle="Register a high-value customer and issue welcome reward points"
        maxWidth="lg"
      >
        <form onSubmit={handleEnrollSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Radhika Sharma"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-300 focus:bg-white dark:focus:bg-[#141F38] focus:border-[#122B52] focus:ring-2 focus:ring-[#122B52]/20 rounded-xl py-2 px-3 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="radhika.sharma@gmail.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-300 focus:bg-white dark:focus:bg-[#141F38] focus:border-[#122B52] focus:ring-2 focus:ring-[#122B52]/20 rounded-xl py-2 px-3 outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-300 focus:bg-white dark:focus:bg-[#141F38] focus:border-[#122B52] focus:ring-2 focus:ring-[#122B52]/20 rounded-xl py-2 px-3 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Loyalty Tier</label>
              <select
                value={newTier}
                onChange={(e) => setNewTier(e.target.value as LoyaltyTier)}
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-300 focus:bg-white dark:focus:bg-[#141F38] focus:border-[#122B52] rounded-xl py-2 px-3 outline-none cursor-pointer font-medium"
              >
                <option value="Silver">Silver First Citizen (Standard Entry)</option>
                <option value="Golden">Golden First Citizen (Mid-tier)</option>
                <option value="Platinum">Platinum First Citizen (Premium)</option>
                <option value="Black">Black First Citizen (VIP Exclusive)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Preferred Shopping Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-300 focus:bg-white dark:focus:bg-[#141F38] focus:border-[#122B52] rounded-xl py-2 px-3 outline-none cursor-pointer font-medium"
              >
                <option value="Ethnic & Womenswear">Ethnic & Womenswear</option>
                <option value="Beauty & Perfumes">Beauty & Perfumes</option>
                <option value="Luxury Watches">Luxury Watches</option>
                <option value="Menswear">Menswear</option>
                <option value="Kids & Toys">Kids & Toys</option>
                <option value="Home & Living">Home & Living</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
              Welcome Reward Points Bonus
            </label>
            <input
              type="number"
              min="0"
              max="10000"
              step="100"
              value={welcomePoints}
              onChange={(e) => setWelcomePoints(Number(e.target.value))}
              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-300 focus:bg-white dark:focus:bg-[#141F38] focus:border-[#122B52] focus:ring-2 focus:ring-[#122B52]/20 rounded-xl py-2 px-3 outline-none font-mono"
            />
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
              Initial bonus reward points granted upon instant enrollment.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEnrollModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Enroll Member
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
