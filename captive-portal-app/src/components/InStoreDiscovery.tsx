import React, { useState, useEffect } from 'react';
import {
  Wifi,
  Sparkles,
  MapPin,
  ChevronRight,
  Ticket,
  Compass,
  Layers,
  Search,
  Tag,
  ArrowUpRight,
  Gift,
  PhoneCall,
  Clock,
  Building2,
  Info,
  LogOut
} from 'lucide-react';
import { CustomerInfo, NewArrivalCollection, Brand, StoreCategory, TrendingEdit } from '../types';
import { NEW_ARRIVALS, BRANDS, STORE_FLOOR_DIRECTORY, TRENDING_EDITS, STORE_INFO, IN_STORE_EVENTS } from '../data/mockStoreData';
import { CollectionModal } from './CollectionModal';
import { BrandLocatorModal } from './BrandLocatorModal';
import { FloorDetailModal } from './FloorDetailModal';
import { VoucherModal } from './VoucherModal';
import { ReviewModal } from './ReviewModal';

interface InStoreDiscoveryProps {
  customer: CustomerInfo;
  onViewVoucher: () => void;
  onLogout?: () => void;
}

export const InStoreDiscovery: React.FC<InStoreDiscoveryProps> = ({ customer, onViewVoucher, onLogout }) => {
  const [selectedCollection, setSelectedCollection] = useState<NewArrivalCollection | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<StoreCategory | null>(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string | undefined>(undefined);
  const [showVoucherModal, setShowVoucherModal] = useState(false);

  const [brandCategoryFilter, setBrandCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [reviewModalConfig, setReviewModalConfig] = useState<{
    isOpen: boolean;
    title?: string;
    subtitle?: string;
    badgeText?: string;
    onComplete?: () => void;
  }>({ isOpen: false });

  // Auto In-Store Pulse Quality Check (48 Seconds Interval)
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const alreadyChecked = sessionStorage.getItem('ss_portal_pulse_checked') === 'true';
        if (!alreadyChecked) {
          setReviewModalConfig({
            isOpen: true,
            title: "In-Store Wi-Fi & Shopping Check",
            subtitle: "Is everything going smoothly during your visit to Shoppers Stop?",
            badgeText: "In-Store Quality Check",
            onComplete: () => {
              try {
                sessionStorage.setItem('ss_portal_pulse_checked', 'true');
              } catch (e) {}
            }
          });
        }
      } catch (e) {}
    }, 48000); // 48 seconds

    return () => clearTimeout(timer);
  }, []);

  const handleInitiateLogout = () => {
    setReviewModalConfig({
      isOpen: true,
      title: "How was your overall Shoppers Stop In-Store & Wi-Fi Experience?",
      subtitle: "Help us enhance future shopping visits before you disconnect.",
      badgeText: "Overall Shopping Review",
      onComplete: () => {
        if (onLogout) onLogout();
      }
    });
  };

  const handleSignalLatencyClick = () => {
    setReviewModalConfig({
      isOpen: true,
      title: "Weak Wi-Fi Signal / Low Frequency Check",
      subtitle: "Did your connection slow down or drop in certain store aisles?",
      badgeText: "Wi-Fi Signal Diagnostic",
      onComplete: () => {}
    });
  };

  // Brand filter logic
  const filteredBrands = BRANDS.filter((brand) => {
    const matchesFilter =
      brandCategoryFilter === 'ALL' ||
      brand.category.toLowerCase().includes(brandCategoryFilter.toLowerCase()) ||
      brand.level.toLowerCase().includes(brandCategoryFilter.toLowerCase());

    const matchesSearch =
      !searchQuery.trim() ||
      brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brand.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brand.section.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const handleOpenFloor = (floor: StoreCategory, categoryName?: string) => {
    setSelectedFloor(floor);
    setSelectedCategoryName(categoryName);
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#1a1a1a] pb-24">
      {/* ==================================================
          TOP HEADER - NO BAG / CART / CHECKOUT
      ================================================== */}
      <header className="sticky top-0 z-40 bg-[#ffffff]/95 backdrop-blur-md border-b border-[#e8e2d5] shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          {/* Logo & Greeting */}
          <div className="flex items-center gap-4">
            <div>
              <div className="text-xl sm:text-2xl font-serif font-black tracking-wider uppercase text-[#1a1a1a]">
                SHOPPERS STOP
              </div>
              <div className="text-[10px] font-bold tracking-[0.2em] text-[#122B52] uppercase hidden sm:block">
                IN-STORE DIGITAL COMPANION
              </div>
            </div>

            <div className="h-6 w-px bg-[#e5dec9] hidden md:block" />

            <div className="hidden md:flex flex-col">
              <span className="text-xs font-bold text-[#1a1a1a]">
                Hi {customer.fullName}!
              </span>
              <span className="text-[11px] text-[#777063] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                <span>Wi-Fi Connected</span>
              </span>
            </div>
          </div>

          {/* Customer Status, Wi-Fi Signal, Reward Pill & Logout */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Wi-Fi Signal Latency Diagnostic Pill */}
            <button
              onClick={handleSignalLatencyClick}
              className="px-2.5 py-1 bg-[#ebf7ee] border border-[#b8e5c0] text-[#1a7f37] hover:bg-[#d8f3de] rounded-full text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1 hidden sm:flex"
              title="Click to check signal strength or test low coverage review"
            >
              <Wifi className="w-3 h-3 text-[#1a7f37]" />
              <span>5G (-48 dBm)</span>
            </button>

            {/* Mobile Greeting */}
            <div className="text-right md:hidden">
              <div className="text-xs font-bold text-[#1a1a1a]">Hi {customer.fullName.split(' ')[0]}</div>
              <div className="text-[10px] text-emerald-700 font-medium flex items-center justify-end gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                <span>Connected</span>
              </div>
            </div>

            {/* Reward Active Button */}
            <button
              onClick={() => setShowVoucherModal(true)}
              className="px-3 py-1.5 bg-[#122B52]/10 border border-[#122B52]/30 hover:bg-[#122B52]/20 text-[#122B52] rounded-full text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <Ticket className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Voucher Active:</span> {customer.sessionVoucherCode || 'WELCOME500'}
            </button>

            {/* Logout Button */}
            <button
              onClick={handleInitiateLogout}
              className="px-3 py-1.5 bg-[#faf8f5] hover:bg-[#eae4d5] border border-[#d8d2c4] text-[#1a1a1a] rounded-full text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
              title="End session and log out"
            >
              <LogOut className="w-3.5 h-3.5 text-[#122B52]" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* ==================================================
          MAIN EDITORIAL CONTENT
      ================================================== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 space-y-12 sm:space-y-16">

        {/* HERO SECTION — NEW ARRIVALS */}
        <section className="space-y-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#122B52]/10 text-[#122B52] text-xs font-bold uppercase tracking-widest mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>JUST IN • PHYSICAL STORE RACKS</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-serif font-extrabold text-[#1a1a1a] tracking-tight leading-tight">
              New Arrivals
            </h1>

            <p className="text-sm sm:text-base text-[#555045] mt-2 leading-relaxed">
              "Discover the latest styles, collections and trends now available in store."
            </p>
          </div>

          {/* Large Hero Banner */}
          <div className="relative rounded-2xl overflow-hidden border border-[#e5dec9] shadow-lg group">
            <div className="aspect-16/9 sm:aspect-21/9 w-full bg-[#1a1a1a] overflow-hidden">
              <img
                src={NEW_ARRIVALS[0]?.imageUrl || "data:image/jpeg;base64,..."}
                alt="New Season Arrivals Showcase"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-90"
              />
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6 sm:p-10 text-white">
              <div className="max-w-xl space-y-2">
                <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#ffd700]">
                  THE IN-STORE EDIT 2026
                </span>
                <h2 className="text-2xl sm:text-4xl font-serif font-bold">
                  Autumn Runway & Contemporary Elegance
                </h2>
                <p className="text-xs sm:text-sm text-gray-200 line-clamp-2">
                  Handpicked couture, Italian-finish linen suits, and exclusive designer capsules now on display across First Floor & Second Floor.
                </p>

                <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-[#f0d486]">
                  <MapPin className="w-4 h-4 text-[#122B52]" />
                  <span>Available on First Floor (Men) & Second Floor (Women)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Discovery Category Cards Grid (WOMEN, MEN, BEAUTY, ACCESSORIES) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pt-2">
            {NEW_ARRIVALS.map((collection) => (
              <div
                key={collection.id}
                onClick={() => setSelectedCollection(collection)}
                className="bg-white border border-[#e8e2d5] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  {/* Visual Card Image */}
                  <div className="relative aspect-4/3 w-full overflow-hidden bg-[#f5f0e6]">
                    <img
                      src={collection.imageUrl}
                      alt={collection.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-[#1a1a1a]/90 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded">
                      {collection.category}
                    </div>
                  </div>

                  {/* Card Info */}
                  <div className="p-4 sm:p-5 space-y-2">
                    <span className="text-[11px] font-bold uppercase text-[#122B52] tracking-wider block">
                      {collection.badge}
                    </span>
                    <h3 className="text-lg font-serif font-bold text-[#1a1a1a]">
                      {collection.title}
                    </h3>
                    <p className="text-xs text-[#666052] line-clamp-2 leading-relaxed">
                      {collection.subtitle}
                    </p>
                  </div>
                </div>

                {/* Explore CTA - NO PRICES */}
                <div className="p-4 pt-0 border-t border-transparent group-hover:border-[#f0ebd9] transition-colors flex items-center justify-between">
                  <span className="text-xs font-bold text-[#122B52] uppercase tracking-wider group-hover:underline">
                    Explore →
                  </span>
                  <span className="text-[10px] text-[#888172] font-mono">
                    {collection.storeLocation.split('•')[0]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ==================================================
            EXPLORE BRANDS SECTION
        ================================================== */}
        <section className="space-y-6 pt-4 border-t border-[#eae4d5]">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-[#122B52] mb-1">
                IN-STORE BOUTIQUES
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-extrabold text-[#1a1a1a]">
                Explore Brands
              </h2>
              <p className="text-xs sm:text-sm text-[#555045] mt-1">
                "Discover brands available at this store."
              </p>
            </div>

            {/* Search Input for brands */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-[#888172] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search store brands..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-[#d8d2c4] rounded-lg text-xs text-[#1a1a1a] placeholder:text-[#a39c8e] focus:outline-none focus:border-[#122B52]"
              />
            </div>
          </div>

          {/* Brand Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {['ALL', 'Ground Floor', 'First Floor', 'Second Floor', 'Beauty', 'Denim'].map((filter) => (
              <button
                key={filter}
                onClick={() => setBrandCategoryFilter(filter)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                  brandCategoryFilter === filter
                    ? 'bg-[#1a1a1a] text-white shadow-xs'
                    : 'bg-white border border-[#e2dccf] text-[#555045] hover:bg-[#f5ebd2]'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Horizontal / Responsive Grid Brand Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBrands.map((brand) => (
              <div
                key={brand.id}
                className="bg-white border border-[#e8e2d5] rounded-xl p-5 hover:border-[#c5a059] shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold font-serif tracking-widest text-[#1a1a1a] uppercase bg-[#faf8f3] px-2.5 py-1 border border-[#e5dec9] rounded">
                      {brand.name}
                    </span>
                    <span className="text-[10px] font-mono text-[#888172] bg-[#f2eee5] px-2 py-0.5 rounded">
                      {brand.level}
                    </span>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-[#122B52]">{brand.category}</div>
                    <div className="text-xs text-[#555045] mt-1 font-medium flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#122B52] shrink-0" />
                      <span>{brand.section}</span>
                    </div>
                  </div>

                  <p className="text-xs text-[#666052] leading-relaxed pt-1">
                    {brand.description}
                  </p>
                </div>

                {/* FIND IN STORE Button */}
                <div className="pt-4 mt-3 border-t border-[#f0ebd9] flex items-center justify-between">
                  <span className="text-[11px] text-[#888172] font-medium">In Stock Today</span>
                  <button
                    onClick={() => setSelectedBrand(brand)}
                    className="px-3.5 py-2 bg-[#faf8f5] hover:bg-[#122B52] text-[#122B52] hover:text-white border border-[#122B52]/30 rounded-lg text-xs font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer flex items-center gap-1"
                  >
                    <span>FIND IN STORE</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ==================================================
            FIND IT IN STORE — STORE DIRECTORY / WAYFINDING
        ================================================== */}
        <section className="space-y-6 pt-4 border-t border-[#eae4d5]">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-[#122B52] mb-1">
              FLOOR NAVIGATION
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-extrabold text-[#1a1a1a]">
              Find It In Store
            </h2>
            <p className="text-xs sm:text-sm text-[#555045] mt-1">
              "Find your favourite categories without searching the whole store."
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {STORE_FLOOR_DIRECTORY.map((floor) => (
              <div
                key={floor.id}
                className="bg-white border border-[#e8e2d5] rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Floor Header Bar */}
                  <div className="bg-[#1a1a1a] text-white p-4 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-bold text-[#d4af37] tracking-widest uppercase">
                        {floor.level}
                      </div>
                      <div className="text-lg font-serif font-bold">
                        {floor.name}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-gray-300 bg-white/10 px-2 py-0.5 rounded">
                      {floor.aisle}
                    </span>
                  </div>

                  {/* Categories List */}
                  <div className="p-4 space-y-2">
                    <p className="text-xs text-[#777063] font-medium mb-2">
                      {floor.subtitle}
                    </p>

                    <div className="space-y-1.5">
                      {floor.subcategories.slice(0, 4).map((sub, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleOpenFloor(floor, sub)}
                          className="w-full text-left p-2 rounded-lg bg-[#faf8f5] hover:bg-[#f2ebd9] border border-[#e5dec9] text-xs font-semibold text-[#3a352c] transition-colors flex items-center justify-between cursor-pointer group"
                        >
                          <span>{sub}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-[#888172] group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <button
                    onClick={() => handleOpenFloor(floor)}
                    className="w-full py-2.5 bg-white border border-[#1a1a1a] text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer text-center"
                  >
                    View Floor Layout →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ==================================================
            TRENDING IN STORE
        ================================================== */}
        <section className="space-y-6 pt-4 border-t border-[#eae4d5]">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-[#122B52] mb-1">
              CURATED ESSENTIALS
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-extrabold text-[#1a1a1a]">
              Trending In Store
            </h2>
            <p className="text-xs sm:text-sm text-[#555045] mt-1">
              Popular looks, festive edits, and beauty trends on physical display today.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {TRENDING_EDITS.map((trend) => (
              <div
                key={trend.id}
                className="bg-white border border-[#e8e2d5] rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all group cursor-pointer flex flex-col justify-between"
                onClick={() => {
                  // Find matching floor or brand for location
                  const matchedFloor = STORE_FLOOR_DIRECTORY.find(f => trend.location.includes(f.level));
                  if (matchedFloor) {
                    handleOpenFloor(matchedFloor, trend.title);
                  }
                }}
              >
                <div>
                  <div className="relative aspect-4/3 w-full overflow-hidden bg-[#f0ebd9]">
                    <img
                      src={trend.imageUrl}
                      alt={trend.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-xs text-[#122B52] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-[#e5dec9]">
                      {trend.tag}
                    </div>
                  </div>

                  <div className="p-4 space-y-1.5">
                    <h3 className="text-base font-serif font-bold text-[#1a1a1a]">
                      {trend.title}
                    </h3>
                    <p className="text-xs text-[#666052] leading-relaxed line-clamp-2">
                      {trend.description}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <span className="text-xs font-bold text-[#122B52] uppercase tracking-wider flex items-center gap-1 group-hover:underline">
                    <span>Explore Collection</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ==================================================
            IN-STORE EVENTS & EXPERIENCES
        ================================================== */}
        <section className="bg-gradient-to-br from-[#ffffff] via-[#fffdf9] to-[#f7f2e6] border border-[#e5dec9] rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#122B52]" />
            <span className="text-xs font-bold text-[#122B52] uppercase tracking-widest">
              TODAY'S IN-STORE EXPERIENCES
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {IN_STORE_EVENTS.map((evt) => (
              <div key={evt.id} className="bg-white p-5 rounded-xl border border-[#e8e2d5] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#1a1a1a] text-white text-[10px] font-bold uppercase tracking-wider">
                    {evt.badge}
                  </span>
                  <span className="text-xs text-[#888172] font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#122B52]" />
                    {evt.time}
                  </span>
                </div>

                <h3 className="text-base font-serif font-bold text-[#1a1a1a]">
                  {evt.title}
                </h3>

                <p className="text-xs text-[#555045] leading-relaxed">
                  {evt.description}
                </p>

                <div className="text-xs text-[#122B52] font-semibold flex items-center gap-1 pt-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{evt.location}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ==================================================
            WELCOME REWARD PERSISTENT CARD
        ================================================== */}
        <section className="bg-white border-2 border-dashed border-[#c5a059] rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[#122B52] text-white rounded-xl shrink-0">
              <Gift className="w-7 h-7 text-[#ffd700]" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-[#122B52] tracking-widest">
                YOUR WELCOME REWARD
              </div>
              <div className="text-2xl font-serif font-extrabold text-[#1a1a1a]">
                25% OFF
              </div>
              <p className="text-xs text-[#666052] mt-0.5">
                Unlocked through Shoppers Stop In-Store Wi-Fi • Valid for this store session
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowVoucherModal(true)}
            className="w-full sm:w-auto px-6 py-3.5 bg-[#1a1a1a] hover:bg-black text-white text-xs font-bold tracking-wider uppercase rounded-xl transition-colors cursor-pointer whitespace-nowrap"
          >
            VIEW REWARD & BARCODE
          </button>
        </section>
      </main>

      {/* ==================================================
          FOOTER — IN-STORE ASSISTANCE
      ================================================== */}
      <footer className="mt-16 bg-[#ffffff] border-t border-[#e8e2d5] py-8 px-4 sm:px-6 lg:px-8 text-center text-xs text-[#777063] space-y-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#f0ebd9] pb-6">
          <div className="text-left">
            <div className="font-serif font-bold text-sm text-[#1a1a1a] uppercase">
              SHOPPERS STOP IN-STORE WI-FI
            </div>
            <p className="text-xs text-[#888172]">
              {STORE_INFO.name} • {STORE_INFO.address}
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-[#1a1a1a]">
            <span className="flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-[#122B52]" />
              First Citizen VIP Desk
            </span>
            <span className="flex items-center gap-1">
              <PhoneCall className="w-3.5 h-3.5 text-[#122B52]" />
              In-Store Helpline
            </span>
          </div>
        </div>

        <p className="text-[11px] text-[#888172]">
          © 2026 Shoppers Stop Ltd. Wi-Fi captive portal designed for in-store guest navigation and customer rewards.
        </p>
      </footer>

      {/* Modals */}
      <CollectionModal
        collection={selectedCollection}
        onClose={() => setSelectedCollection(null)}
      />

      <BrandLocatorModal
        brand={selectedBrand}
        onClose={() => setSelectedBrand(null)}
      />

      <FloorDetailModal
        floor={selectedFloor}
        selectedCategoryName={selectedCategoryName}
        onClose={() => {
          setSelectedFloor(null);
          setSelectedCategoryName(undefined);
        }}
      />

      {showVoucherModal && (
        <VoucherModal
          customer={customer}
          onClose={() => setShowVoucherModal(false)}
        />
      )}

      <ReviewModal
        isOpen={reviewModalConfig.isOpen}
        title={reviewModalConfig.title}
        subtitle={reviewModalConfig.subtitle}
        badgeText={reviewModalConfig.badgeText}
        onCompleteAction={reviewModalConfig.onComplete}
        onClose={() => setReviewModalConfig({ ...reviewModalConfig, isOpen: false })}
      />
    </div>
  );
};
