import React, { useState } from 'react';
import { X, MapPin, Navigation, Compass, Layers, Sparkles, CheckCircle2 } from 'lucide-react';
import { Brand } from '../types';
import { ReviewModal } from './ReviewModal';

interface BrandLocatorModalProps {
  brand: Brand | null;
  onClose: () => void;
}

export const BrandLocatorModal: React.FC<BrandLocatorModalProps> = ({ brand, onClose }) => {
  const [showReviewModal, setShowReviewModal] = useState(false);

  if (!brand) return null;

  const handleCloseWithReviewCheck = () => {
    const hasReviewed = sessionStorage.getItem('ss_portal_reviewed') === 'true';
    if (!hasReviewed) {
      setShowReviewModal(true);
    } else {
      onClose();
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md animate-fade-in overflow-y-auto">
        <div className="relative w-full max-w-lg bg-[#ffffff] border border-[#e5dec9] shadow-2xl rounded-2xl overflow-hidden my-auto">
          {/* Header Bar */}
          <div className="p-4 sm:p-5 border-b border-[#f0ebd9] flex items-center justify-between bg-[#faf8f5]">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#1a1a1a] text-white text-[11px] font-bold uppercase tracking-widest">
                IN-STORE BRAND LOCATOR
              </span>
            </div>
            <button
              onClick={handleCloseWithReviewCheck}
              className="p-2 rounded-full hover:bg-[#eae4d5] text-[#1a1a1a] transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content Body */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Brand Name Banner */}
            <div className="bg-gradient-to-r from-[#1a1a1a] via-[#2c2825] to-[#1a1a1a] p-6 rounded-xl text-white text-center shadow-inner relative overflow-hidden">
              <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-[#122B52]/30 pointer-events-none" />
              
              <div className="text-[10px] uppercase font-semibold tracking-[0.25em] text-[#d4af37] mb-1">
                SHOPPERS STOP PARTNER BRAND
              </div>

              <h3 className="text-3xl font-serif font-black tracking-wider uppercase mb-1">
                {brand.name}
              </h3>

              <p className="text-xs text-gray-300">
                {brand.category}
              </p>
            </div>

            {/* Location Summary Box */}
            <div className="bg-[#fcfaf7] border-2 border-[#122B52]/20 p-4 sm:p-5 rounded-xl space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-[#122B52] text-white rounded-lg shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase text-[#122B52] tracking-wider">
                    STORE LOCATION
                  </div>
                  <div className="text-lg font-bold text-[#1a1a1a] mt-0.5">
                    {brand.level} • {brand.section}
                  </div>
                  <p className="text-xs text-[#666052] mt-1">
                    {brand.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Floor Plan Visual Representation */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-[#555045]">
                <span className="font-bold uppercase tracking-wider text-[#1a1a1a] flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-[#122B52]" />
                  In-Store Wayfinding Map
                </span>
                <span className="text-[10px] font-medium text-[#122B52] bg-[#122B52]/10 px-2 py-0.5 rounded">
                  Active Floor Plan
                </span>
              </div>

              <div className="bg-[#f5f2eb] border border-[#d8d2c4] p-4 rounded-xl relative overflow-hidden">
                <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                  <div className="p-3 bg-white border border-[#e5dec9] rounded-lg text-[#888172]">
                    Escalators / Lift
                  </div>
                  <div className="p-3 bg-[#122B52] text-white font-bold rounded-lg shadow-md col-span-2 flex items-center justify-center gap-1.5 animate-pulse">
                    <MapPin className="w-4 h-4 text-[#ffd700]" />
                    <span>{brand.name} BOOTH</span>
                  </div>
                  <div className="p-3 bg-white border border-[#e5dec9] rounded-lg text-[#888172] col-span-2">
                    Trial Rooms & Mirror Lounge
                  </div>
                  <div className="p-3 bg-[#f0ebd9] border border-[#d6cca8] rounded-lg font-medium text-[#4a453b]">
                    Billing Desk
                  </div>
                </div>

                <div className="mt-3 text-[11px] text-[#666052] flex items-center gap-1.5 bg-white p-2 rounded border border-[#e5dec9]">
                  <Navigation className="w-3.5 h-3.5 text-[#122B52] shrink-0" />
                  <span>Take central atrium escalator to <strong>{brand.level}</strong> and follow overhead direction markers.</span>
                </div>
              </div>
            </div>

            {/* Popular Collections at this counter */}
            {brand.popularItems && brand.popularItems.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-widest text-[#4a453b]">
                  POPULAR LINES AT THIS COUNTER
                </h4>
                <div className="flex flex-wrap gap-2">
                  {brand.popularItems.map((item, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 text-xs bg-[#faf8f5] border border-[#e5dec9] text-[#3a352c] px-3 py-1 rounded-full font-medium"
                    >
                      <CheckCircle2 className="w-3 h-3 text-[#122B52]" />
                      <span>{item}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Close */}
            <button
              onClick={handleCloseWithReviewCheck}
              className="w-full py-3.5 bg-[#122B52] hover:bg-[#0B2038] text-white text-xs font-semibold tracking-wider uppercase rounded-xl transition-colors cursor-pointer"
            >
              Got It — I'm Walking Over
            </button>
          </div>
        </div>
      </div>

      <ReviewModal
        isOpen={showReviewModal}
        title="Was this brand location info helpful?"
        subtitle="Help us keep counter locations & floor maps updated."
        badgeText="Brand Wayfinding Review"
        onClose={() => {
          setShowReviewModal(false);
          onClose();
        }}
      />
    </>
  );
};
