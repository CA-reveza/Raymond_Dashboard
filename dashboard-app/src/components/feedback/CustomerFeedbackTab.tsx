import React, { useState, useEffect } from 'react';
import { apiUrl } from '../../config/api';
import {
  Star,
  Search,
  Filter,
  Download,
  MessageSquare,
  TrendingUp,
  Award,
  CheckCircle,
  ThumbsUp,
  Building2,
  Calendar,
  User,
  Sparkles,
} from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { LoyaltyBadge } from '../common/Badge';
import { downloadReportFile } from '../../utils/exportAndPrint';

export interface CustomerReview {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  loyaltyTier: 'Black' | 'Platinum' | 'Golden' | 'Silver';
  storeLocation: string;
  category: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  time: string;
  sentiment: 'Delighted' | 'Positive' | 'Needs Improvement';
  verifiedPurchase: boolean;
  helpfulCount?: number;
  managerResponse?: string | null;
}

const INITIAL_REVIEWS: CustomerReview[] = [
  {
    id: "REV-1001",
    customerName: "Ananya Deshmukh",
    customerEmail: "ananya.d@gmail.com",
    customerPhone: "+91 98201 44321",
    loyaltyTier: "Black",
    storeLocation: "Mumbai - Malad West Flagship",
    category: "Ethnic & Womenswear",
    rating: 5,
    title: "Exceptional Bridal Saree Consultation",
    comment: "The personal shopper service in Ethnic Wear was world-class. VIP Lounge billing was seamless and staff offered expert fitting guidance!",
    date: "2026-08-02",
    time: "16:45 PM",
    sentiment: "Delighted",
    verifiedPurchase: true,
    managerResponse: "Thank you Ananya! We are thrilled to hear about your bridal styling experience at Malad Flagship."
  },
  {
    id: "REV-1002",
    customerName: "Vikramaditya Roy",
    customerEmail: "v.roy@consultant.com",
    customerPhone: "+91 98112 09844",
    loyaltyTier: "Platinum",
    storeLocation: "Delhi - Select CITYWALK Saket",
    category: "Luxury Watches",
    rating: 5,
    title: "Rolex Submariner Vault Service Excellent",
    comment: "Flawless verification & hospitality at the luxury watch counter. Fast First Citizen discount redemption!",
    date: "2026-08-01",
    time: "14:15 PM",
    sentiment: "Delighted",
    verifiedPurchase: true,
    managerResponse: "Appreciate your loyalty Vikramaditya! Always a pleasure serving you at CITYWALK Saket."
  },
  {
    id: "REV-1003",
    customerName: "Kavita Reddy",
    customerEmail: "kavita.reddy@gmail.com",
    customerPhone: "+91 97011 22900",
    loyaltyTier: "Black",
    storeLocation: "Hyderabad - Inorbit Mall Hitec City",
    category: "Beauty & Perfumes",
    rating: 5,
    title: "Chanel Fragrance Masterclass & Gifting",
    comment: "Exclusive VIP masterclass was fantastic. Complimentary travel pouch & double reward points added instantly.",
    date: "2026-07-31",
    time: "18:20 PM",
    sentiment: "Delighted",
    verifiedPurchase: true,
    managerResponse: "We look forward to hosting you at our next perfume launch Kavita!"
  },
  {
    id: "REV-1004",
    customerName: "Rahul Verma",
    customerEmail: "rahul.verma@techcorp.io",
    customerPhone: "+91 97112 88401",
    loyaltyTier: "Platinum",
    storeLocation: "Bengaluru - MG Road Metro",
    category: "Wi-Fi & Digital Kiosk",
    rating: 4,
    title: "Instant Wi-Fi Captive Portal & Easy Checkout",
    comment: "Connecting to Wi-Fi portal was smooth. 15% discount voucher popped up automatically on phone screen!",
    date: "2026-07-30",
    time: "11:30 AM",
    sentiment: "Positive",
    verifiedPurchase: true
  },
  {
    id: "REV-1005",
    customerName: "Tanvi Agarwal",
    customerEmail: "tanvi.agarwal@corp.in",
    customerPhone: "+91 98210 99887",
    loyaltyTier: "Platinum",
    storeLocation: "Mumbai - Malad West Flagship",
    category: "Handbags & Accessories",
    rating: 5,
    title: "Prada Collection Assistance",
    comment: "Great stock availability and courteous floor staff. Handbag reservation was kept safely at vault.",
    date: "2026-07-29",
    time: "15:10 PM",
    sentiment: "Delighted",
    verifiedPurchase: true
  }
];

export const CustomerFeedbackTab: React.FC = () => {
  const [reviews, setReviews] = useState<CustomerReview[]>(INITIAL_REVIEWS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStore, setSelectedStore] = useState('All Stores');
  const [ratingFilter, setRatingFilter] = useState<number | 'All'>('All');

  // Fetch live feedbacks from backend API / Firebase
  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const res = await fetch(apiUrl('/api/feedbacks'));
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.feedbacks) && data.feedbacks.length > 0) {
            setReviews(prev => {
              const merged = [...prev];
              data.feedbacks.forEach((fb: any) => {
                if (!merged.some(m => m.id === fb.id || (m.customerName === fb.customerName && m.comment === fb.comment))) {
                  merged.unshift({
                    id: fb.id || `REV-${Math.floor(Math.random() * 90000)}`,
                    customerName: fb.customerName || fb.name || "Store Shopper",
                    customerEmail: fb.customerEmail || fb.email || "shopper@ss.in",
                    customerPhone: fb.customerPhone || fb.phone || "+91 98201 00000",
                    loyaltyTier: fb.loyaltyTier || "Black",
                    storeLocation: fb.storeLocation || "Mumbai - Malad West Flagship",
                    category: fb.category || "Wi-Fi & Store Kiosk",
                    rating: Number(fb.rating || 5),
                    title: fb.title || "Store Service Feedback",
                    comment: fb.comment || fb.feedback || "Great shopping experience at Raymond!",
                    date: fb.date || new Date().toISOString().split('T')[0],
                    time: fb.time || new Date().toLocaleTimeString(),
                    sentiment: fb.rating >= 4 ? "Delighted" : "Positive",
                    verifiedPurchase: true,
                    managerResponse: fb.managerResponse || null
                  });
                }
              });
              return merged;
            });
          }
        }
      } catch (e) {}
    };

    fetchFeedbacks();
    const interval = setInterval(fetchFeedbacks, 2000);
    return () => clearInterval(interval);
  }, []);

  const filteredReviews = reviews.filter(r => {
    const matchesSearch =
      r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStore = selectedStore === 'All Stores' || r.storeLocation === selectedStore;
    const matchesRating = ratingFilter === 'All' || r.rating === ratingFilter;

    return matchesSearch && matchesStore && matchesRating;
  });

  const avgRating = (reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1)).toFixed(1);
  const csatPercentage = Math.round((reviews.filter(r => r.rating >= 4).length / (reviews.length || 1)) * 100);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-[18px] p-5 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-amber-500 text-slate-900 dark:text-slate-100 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Customer Voice & CSAT
            </span>
            <span className="text-xs text-amber-300 font-mono font-bold">
              ★ {avgRating} / 5.0 Average Rating
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Customer Feedback & Store Review Analytics
          </h2>
          <p className="text-xs text-gray-300 mt-1 max-w-2xl">
            Inspect shopper reviews, store service CSAT ratings, and verified buyer testimonials across all Raymond branches.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={<Download className="w-3.5 h-3.5" />}
          onClick={() => {
            const rows = filteredReviews.map(r => ({
              'Review ID': r.id,
              'Customer Name': r.customerName,
              'Email': r.customerEmail,
              'Phone': r.customerPhone,
              'Loyalty Tier': r.loyaltyTier,
              'Store Branch': r.storeLocation,
              'Category': r.category,
              'Rating': `${r.rating} Stars`,
              'Title': r.title,
              'Comment': r.comment,
              'Date': `${r.date} ${r.time}`
            }));
            downloadReportFile('Raymond_CSAT_Reviews_Report', 'CSV', 'All Stores', rows);
          }}
        >
          Download Feedback Report
        </Button>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Overall Rating</span>
            <div className="p-2 bg-amber-50 dark:bg-amber-500/10 rounded-lg text-amber-600 dark:text-amber-400">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900 dark:text-gray-100">{avgRating} / 5</span>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">({reviews.length} Reviews)</span>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">CSAT Score</span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg text-emerald-600 dark:text-emerald-400">
              <ThumbsUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900 dark:text-gray-100">{csatPercentage}%</span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Positive Sentiment</span>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Feedback Logged</span>
            <div className="p-2 bg-rose-50 dark:bg-rose-500/10 rounded-lg text-[#2D74B2]">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900 dark:text-gray-100">{reviews.length}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Verified Reviews</span>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-indigo-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Manager Responses</span>
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900 dark:text-gray-100">
              {reviews.filter(r => r.managerResponse).length}
            </span>
            <span className="text-xs text-indigo-600 font-semibold">Replies Published</span>
          </div>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search feedback by customer name, department, title, or review text..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-xs font-medium text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#2D74B2]"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-[#141F38] border border-gray-200 dark:border-white/10 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 focus:border-[#2D74B2] cursor-pointer"
            >
              <option value="All Stores">All Stores</option>
              <option value="Mumbai - Malad West Flagship">Mumbai - Malad West Flagship</option>
              <option value="Delhi - Select CITYWALK Saket">Delhi - Select CITYWALK Saket</option>
              <option value="Bengaluru - MG Road Metro">Bengaluru - MG Road Metro</option>
              <option value="Kolkata - South City Mall">Kolkata - South City Mall</option>
              <option value="Hyderabad - Inorbit Mall Hitec City">Hyderabad - Inorbit Mall Hitec City</option>
            </select>

            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value === 'All' ? 'All' : Number(e.target.value))}
              className="px-3 py-2 bg-white dark:bg-[#141F38] border border-gray-200 dark:border-white/10 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 focus:border-[#2D74B2] cursor-pointer"
            >
              <option value="All">All Ratings</option>
              <option value="5">5 Stars (★ ★ ★ ★ ★)</option>
              <option value="4">4 Stars (★ ★ ★ ★)</option>
              <option value="3">3 Stars (★ ★ ★)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Reviews List Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredReviews.map((r) => (
          <Card key={r.id} className="p-5 hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{r.customerName}</span>
                  <LoyaltyBadge tier={r.loyaltyTier} />
                  <span className="bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                    {r.category}
                  </span>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">
                    {r.storeLocation}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 mt-1 flex items-center gap-2">
                  <span>{r.title}</span>
                  <span className="text-amber-500 font-mono text-xs">
                    {'★'.repeat(r.rating)}
                  </span>
                </h4>

                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50/70 p-3 rounded-xl border border-gray-100 dark:border-white/10 mt-2">
                  "{r.comment}"
                </p>

                {r.managerResponse && (
                  <div className="mt-3 pl-3 border-l-2 border-l-[#2D74B2] bg-rose-50/50 p-2.5 rounded-r-xl">
                    <span className="text-[10px] font-bold text-[#2D74B2] uppercase tracking-wider block">
                      Store Manager Response
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">{r.managerResponse}</p>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-end gap-1 text-[11px] text-gray-400 dark:text-gray-500 font-mono shrink-0">
                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md">
                  <CheckCircle className="w-3 h-3" /> Verified Purchase
                </div>
                <span>{r.date} • {r.time}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
