import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import React, { useState, useEffect } from 'react';
import {
  Star,
  TrendingUp,
  ShoppingBag,
  Package,
  Users,
  RotateCcw,
  ChevronRight,
  Building2,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  Eye,
} from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Order, TabType } from '../../types';
import { STORE_LOCATIONS } from '../../data/mockData';
interface OverviewTabProps {
  orders: Order[];
  onNavigateTab: (tab: TabType) => void;
  onViewOrderDetails: (order: Order) => void;
  selectedStore: string;
  metrics: {
    totalSales: number;
    totalOrders: number;
    totalProducts: number;
    totalCustomers: number;
    totalReturns: number;
  };
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  orders,
  onNavigateTab,
  onViewOrderDetails,
  selectedStore,
  metrics,
}) => {
  const [selectedMonth, setSelectedMonth] = useState('July 2026');

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Dynamic Top Sales Products by Store
  const getTopSalesProductsByStore = (store: string) => {
    switch (store) {
      case 'Mumbai - Malad West Flagship':
        return [
          { id: 'TSP-MUM-1', name: 'Gucci GG Marmont Bag', category: 'Handbags & Accessories', price: 185000, discount: 'VIP 15%', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=200' },
          { id: 'TSP-MUM-2', name: 'Rolex Submariner Watch', category: 'Luxury Watches', price: 985000, discount: 'Flagship Off 10%', image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&q=80&w=200' },
          { id: 'TSP-MUM-3', name: 'Tom Ford Tobacco Vanille', category: 'Luxury Fragrances', price: 28500, discount: 'Off 20%', image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=200' },
          { id: 'TSP-MUM-4', name: 'MAC Powder Kiss Lipcolor', category: 'Cosmetics', price: 2450, discount: 'Off 15%', image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=200' },
          { id: 'TSP-MUM-5', name: 'Prada Monolith Boots', category: 'Footwear', price: 98000, discount: 'Off 25%', image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=200' },
          { id: 'TSP-MUM-6', name: 'Chanel Coco Mademoiselle', category: 'Fragrances', price: 16500, discount: 'Off 10%', image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=200' },
        ];
      case 'Delhi - Select CITYWALK Saket':
        return [
          { id: 'TSP-DEL-1', name: 'Chanel Coco Mademoiselle 100ml', category: 'Luxury Fragrances', price: 16500, discount: 'Festive Off 20%', image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=200' },
          { id: 'TSP-DEL-2', name: 'Louis Vuitton Damier Tote', category: 'Handbags & Accessories', price: 165000, discount: 'Off 10%', image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=200' },
          { id: 'TSP-DEL-3', name: 'Prada Monolith Boots', category: 'Footwear Salon', price: 98000, discount: 'Off 15%', image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=200' },
          { id: 'TSP-DEL-4', name: 'Dior Sauvage Spray 100ml', category: 'Fragrances', price: 12800, discount: 'Off 25%', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=200' },
          { id: 'TSP-DEL-5', name: 'Bvlgari Serpenti Diamond Watch', category: 'Luxury Watches', price: 645000, discount: 'Off 12%', image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=200' },
          { id: 'TSP-DEL-6', name: 'Forest Essentials Radiance Cream', category: 'Skincare', price: 6200, discount: 'Off 30%', image: 'https://images.unsplash.com/photo-1608248547160-fbc746581371?auto=format&fit=crop&q=80&w=200' },
        ];
      case 'Bengaluru - MG Road Metro':
        return [
          { id: 'TSP-BLR-1', name: 'Fossil Gen 6 Smartwatch', category: 'Smartwatches', price: 18495, discount: 'Tech Off 25%', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=200' },
          { id: 'TSP-BLR-2', name: 'Nike Air Force 1 Sneakers', category: 'Footwear & Sneakers', price: 8995, discount: 'Off 20%', image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=200' },
          { id: 'TSP-BLR-3', name: 'Ray-Ban Wayfarer Classic', category: 'Eyewear', price: 11490, discount: 'Off 15%', image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=200' },
          { id: 'TSP-BLR-4', name: 'Clinique Moisture Surge 100H', category: 'Skincare', price: 3550, discount: 'Off 30%', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=200' },
          { id: 'TSP-BLR-5', name: 'Casio G-Shock Carbon Core', category: 'Smartwatches', price: 9995, discount: 'Off 18%', image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=200' },
          { id: 'TSP-BLR-6', name: 'Hidesign Leather Briefcase', category: 'Bags & Luggage', price: 14999, discount: 'Off 22%', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=200' },
        ];
      case 'Kolkata - South City Mall':
        return [
          { id: 'TSP-KOL-1', name: 'Titan Raga Pearl Watch', category: 'Luxury Watches', price: 14495, discount: 'Festive Off 20%', image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&q=80&w=200' },
          { id: 'TSP-KOL-2', name: 'Estée Lauder Night Repair', category: 'Beauty & Skincare', price: 9500, discount: 'Off 15%', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=200' },
          { id: 'TSP-KOL-3', name: 'Forest Essentials Cream', category: 'Skincare', price: 6200, discount: 'Off 25%', image: 'https://images.unsplash.com/photo-1608248547160-fbc746581371?auto=format&fit=crop&q=80&w=200' },
          { id: 'TSP-KOL-4', name: 'Ray-Ban Wayfarer Classic', category: 'Eyewear', price: 11490, discount: 'Off 10%', image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=200' },
          { id: 'TSP-KOL-5', name: 'Aldo Stiletto Leather Pumps', category: 'Footwear', price: 9999, discount: 'Off 30%', image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=200' },
          { id: 'TSP-KOL-6', name: 'Home Centre Bedding Set', category: 'Bedding', price: 4999, discount: 'Off 35%', image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&q=80&w=200' },
        ];
      case 'Hyderabad - Inorbit Mall Hitec City':
        return [
          { id: 'TSP-HYD-1', name: 'Michael Kors Parker Chronograph', category: 'Luxury Watches', price: 24995, discount: 'VIP Off 20%', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=200' },
          { id: 'TSP-HYD-2', name: 'Casio G-Shock Carbon Core', category: 'Smartwatches', price: 9995, discount: 'Off 25%', image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=200' },
          { id: 'TSP-HYD-3', name: 'YSL Black Opium Perfume 90ml', category: 'Fragrances', price: 14200, discount: 'Off 15%', image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=200' },
          { id: 'TSP-HYD-4', name: 'Hidesign Leather Briefcase', category: 'Handbags & Accessories', price: 14999, discount: 'Off 30%', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=200' },
          { id: 'TSP-HYD-5', name: 'MAC Powder Kiss Lipcolor', category: 'Cosmetics', price: 2450, discount: 'Off 10%', image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=200' },
          { id: 'TSP-HYD-6', name: 'Nike Air Force 1 Sneakers', category: 'Footwear', price: 8995, discount: 'Off 20%', image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=200' },
        ];
      default:
        // 'All Stores (Nationwide)' or 'Online Store'
        return [
          { id: 'TSP-ALL-1', name: 'Gucci GG Marmont Shoulder Bag', category: 'Handbags & Accessories', price: 185000, discount: 'Off 15%', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=200' },
          { id: 'TSP-ALL-2', name: 'Rolex Submariner Date Watch', category: 'Luxury Watches', price: 985000, discount: 'Off 10%', image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&q=80&w=200' },
          { id: 'TSP-ALL-3', name: 'Tom Ford Tobacco Vanille', category: 'Fragrances', price: 28500, discount: 'Off 20%', image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=200' },
          { id: 'TSP-ALL-4', name: 'Prada Monolith Leather Boots', category: 'Footwear', price: 98000, discount: 'Off 25%', image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=200' },
          { id: 'TSP-ALL-5', name: 'Fossil Gen 6 Smartwatch', category: 'Smartwatches', price: 18495, discount: 'Off 15%', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=200' },
          { id: 'TSP-ALL-6', name: 'MAC Powder Kiss Lipcolor', category: 'Cosmetics', price: 2450, discount: 'Off 30%', image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=200' },
        ];
    }
  };

  const topSalesProducts = getTopSalesProductsByStore(selectedStore);

  // Most Viewed Products dataset
  const mostViewedProducts = [
    {
      id: 'MVP-01',
      name: 'Gucci GG Marmont Shoulder Bag',
      category: 'Handbags & Accessories',
      views: '18,450 views',
      price: 185000,
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=400',
    },
    {
      id: 'MVP-02',
      name: 'Rolex Submariner Date Watch',
      category: 'Luxury Watches',
      views: '16,210 views',
      price: 985000,
      image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&q=80&w=400',
    },
    {
      id: 'MVP-03',
      name: 'MAC Powder Kiss Liquid Lipcolor',
      category: 'Cosmetics',
      views: '14,980 views',
      price: 2450,
      image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=400',
    },
    {
      id: 'MVP-04',
      name: 'Tom Ford Tobacco Vanille 100ml',
      category: 'Luxury Fragrances',
      views: '12,840 views',
      price: 28500,
      image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=400',
    },
    {
      id: 'MVP-05',
      name: 'Prada Monolith Leather Boots',
      category: 'Footwear Salon',
      views: '11,320 views',
      price: 98000,
      image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=400',
    },
    {
      id: 'MVP-06',
      name: 'Michael Kors Parker Chronograph',
      category: 'Luxury Watches',
      views: '9,940 views',
      price: 24995,
      image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=400',
    },
    {
      id: 'MVP-07',
      name: 'Chanel Coco Mademoiselle 100ml',
      category: 'Luxury Fragrances',
      views: '9,410 views',
      price: 16500,
      image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=400',
    },
    {
      id: 'MVP-08',
      name: 'Nike Air Force 1 Triple White',
      category: 'Footwear & Sneakers',
      views: '8,890 views',
      price: 8995,
      image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=400',
    },
  ];

  // Orders Chart Data
  const ordersChartData = [
    { name: 'Jan', orders: 1200, sales: 2500, returns: 150 },
    { name: 'Feb', orders: 1900, sales: 3200, returns: 210 },
    { name: 'Mar', orders: 3400, sales: 2100, returns: 320 },
    { name: 'Apr', orders: 2100, sales: 1800, returns: 180 },
    { name: 'May', orders: 1800, sales: 2400, returns: 140 },
    { name: 'Jun', orders: 2300, sales: 2800, returns: 190 },
    { name: 'Jul', orders: 2800, sales: 3600, returns: 220 },
    { name: 'Aug', orders: 1900, sales: 2900, returns: 160 },
    { name: 'Sep', orders: 2400, sales: 3100, returns: 200 },
    { name: 'Oct', orders: 3100, sales: 4200, returns: 280 },
  ];

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Active Branch Context Banner */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-[18px] p-4 sm:p-5 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#2D74B2]/20 border border-[#2D74B2]/40 rounded-xl text-[#2D74B2]">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-rose-300">
                Active Store Branch
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                LIVE POS ONLINE
              </span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">{selectedStore}</h2>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-300 border-t md:border-t-0 border-gray-700/60 pt-3 md:pt-0 w-full md:w-auto justify-between md:justify-end">
          <div>
            <span className="text-gray-400">Total Store Footfall Today:</span>{' '}
            <strong className="text-white font-mono">14,280 visitors</strong>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-gray-700 text-gray-200 hover:bg-gray-800 hover:text-white"
            onClick={() => onNavigateTab('analytics')}
          >
            Live Analytics
          </Button>
        </div>
      </div>

      {/* 5 KPI Stat Cards Header Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Sales */}
        <div className="bg-white rounded-[18px] border border-gray-100 p-4 shadow-2xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between" onClick={() => onNavigateTab('reports')}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Sales</p>
              <p className="text-lg font-bold text-gray-900 mt-0.5">{formatINR(metrics.totalSales)}</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 hidden sm:block" />
        </div>

        {/* Orders */}
        <div className="bg-white rounded-[18px] border border-gray-100 p-4 shadow-2xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between" onClick={() => onNavigateTab('orders')}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Orders</p>
              <p className="text-lg font-bold text-gray-900 mt-0.5">{metrics.totalOrders.toLocaleString('en-IN')}</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 hidden sm:block" />
        </div>

        {/* Products */}
        <div className="bg-white rounded-[18px] border border-gray-100 p-4 shadow-2xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between" onClick={() => onNavigateTab('inventory')}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Products</p>
              <p className="text-lg font-bold text-gray-900 mt-0.5">{metrics.totalProducts.toLocaleString('en-IN')}</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 hidden sm:block" />
        </div>

        {/* Customers */}
        <div className="bg-white rounded-[18px] border border-gray-100 p-4 shadow-2xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between" onClick={() => onNavigateTab('customers')}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Customers</p>
              <p className="text-lg font-bold text-gray-900 mt-0.5">{metrics.totalCustomers.toLocaleString('en-IN')}</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 hidden sm:block" />
        </div>

        {/* Overall Feedback */}
        <div className="bg-white rounded-[18px] border border-amber-100 p-4 shadow-2xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between col-span-2 sm:col-span-1 bg-gradient-to-br from-white to-amber-50/20" onClick={() => onNavigateTab('feedback')}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
              <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Overall Feedback</p>
              <p className="text-lg font-bold text-gray-900 mt-0.5 flex items-center gap-1">
                4.8/5 <span className="text-amber-500 text-xs">★</span> <span className="text-xs text-gray-400 font-normal">(242)</span>
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 hidden sm:block" />
        </div>
      </div>

      {/* Middle Grid: Orders Status Chart & Top Sales Products */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Orders Status Chart (7 cols) */}
        <Card className="lg:col-span-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900 tracking-tight">
                  Orders Status
                </h3>
                <p className="text-xs text-gray-500">Monthly breakdown of sales, orders, and returns</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-gray-600 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Orders
                </span>
                <span className="flex items-center gap-1 text-gray-600 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Sales
                </span>
                <span className="flex items-center gap-1 text-gray-600 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-pink-500 inline-block" /> Returns
                </span>
              </div>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ordersChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorReturns" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EC4899" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#EC4899" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#94A3B8', fontSize: 12 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#94A3B8', fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      border: 'none',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    name="Sales"
                    stroke="#10B981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorSales)"
                  />
                  <Area
                    type="monotone"
                    dataKey="orders"
                    name="Orders"
                    stroke="#3B82F6"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorOrders)"
                  />
                  <Area
                    type="monotone"
                    dataKey="returns"
                    name="Returns"
                    stroke="#EC4899"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorReturns)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        {/* Right: Top Sales Products (5 cols) */}
        <Card className="lg:col-span-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900 tracking-tight">
                Top Sales Products
              </h3>
              <div className="relative">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700 py-1.5 px-2.5 rounded-lg focus:outline-none cursor-pointer"
                >
                  <option value="July 2026">July 2026</option>
                  <option value="June 2026">June 2026</option>
                  <option value="May 2026">May 2026</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {topSalesProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="flex items-center gap-3 p-2.5 bg-gray-50/60 hover:bg-gray-50 border border-gray-100 rounded-xl transition-all"
                >
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-12 h-12 rounded-lg object-cover bg-white border border-gray-200 shrink-0"
                  />
                  <div className="overflow-hidden">
                    <h4 className="text-xs font-bold text-gray-900 truncate">{prod.name}</h4>
                    <p className="text-xs font-semibold text-blue-600 mt-0.5">
                      {formatINR(prod.price)}
                    </p>
                    <span className="text-[10px] text-gray-400 font-medium">
                      {prod.discount}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Table Section: Recent Orders */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900 tracking-tight">
              Recent Orders
            </h3>
            <p className="text-xs text-gray-500">Live transactions across omnichannel touchpoints</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={<ArrowRight className="w-3.5 h-3.5 text-[#2D74B2]" />}
            onClick={() => onNavigateTab('orders')}
          >
            View All Orders
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-400 font-bold uppercase tracking-wider text-[11px] border-b border-gray-200">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Details</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Shipping Cost</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentOrders.map((order, idx) => {
                const customerAvatars = [
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100',
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100',
                  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=100',
                  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100',
                  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=100',
                ];
                const avatar = customerAvatars[idx % customerAvatars.length];
                const item = order.items[0];

                return (
                  <tr key={order.id} className="hover:bg-gray-50/60 transition-colors">
                    {/* Date */}
                    <td className="py-3.5 px-4 font-medium text-gray-500 font-mono">
                      {(order.date || order.orderDate || '2026-08-04').toString().split(' ')[0].split('-').reverse().join('.')}
                    </td>

                    {/* Customer Name */}
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-gray-900">{order.customerName}</span>
                    </td>

                    {/* Product item & thumbnail */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        {item && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-8 h-8 rounded-md object-cover bg-gray-100 border border-gray-200 shrink-0"
                          />
                        )}
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-gray-800 max-w-[160px] truncate">
                            {item ? item.name : 'Store Item'}
                          </span>
                          <span className="text-[10px] bg-gray-100 text-gray-600 font-bold px-1.5 py-0.5 rounded">
                            x{item ? item.quantity : 1}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Details / SKU */}
                    <td className="py-3.5 px-4 text-gray-500 font-mono text-[11px]">
                      {item ? item.sku : order.id}
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-4 font-bold text-gray-900">
                      {formatINR(order.totalAmount)}
                    </td>

                    {/* Shipping Cost */}
                    <td className="py-3.5 px-4 font-medium text-gray-600">
                      {idx % 2 === 0 ? <span className="text-emerald-600 font-semibold">Free</span> : '₹100'}
                    </td>

                    {/* Action / Status Badge */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onViewOrderDetails(order)}
                        className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                          order.status === 'Delivered'
                            ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                            : order.status === 'Processing' || order.status === 'In Transit'
                            ? 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                            : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                        }`}
                      >
                        {order.status === 'Delivered' ? 'Shipped' : order.status}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Bottom Showcase: Most Viewed Products */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900 tracking-tight">
              Most Viewed Products
            </h3>
            <p className="text-xs text-gray-500">Highest customer impression volume in store catalog</p>
          </div>
          <button
            onClick={() => onNavigateTab('inventory')}
            className="text-xs font-semibold text-[#2D74B2] hover:underline cursor-pointer"
          >
            Explore Catalog →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-4 gap-4">
          {mostViewedProducts.map((prod) => (
            <div
              key={prod.id}
              className="bg-gray-50/50 rounded-xl border border-gray-100 p-3 hover:shadow-md transition-all group cursor-pointer"
              onClick={() => onNavigateTab('inventory')}
            >
              <div className="aspect-square w-full rounded-lg overflow-hidden bg-white mb-2.5 border border-gray-200/80">
                <img
                  src={prod.image}
                  alt={prod.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=400';
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h4 className="font-bold text-xs text-gray-900 truncate">{prod.name}</h4>
              <p className="text-[10px] text-gray-400 font-medium truncate">{prod.category}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="font-bold text-xs text-gray-900">{formatINR(prod.price)}</span>
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                  {prod.views}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
