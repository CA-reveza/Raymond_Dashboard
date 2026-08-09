import React, { useState } from 'react';
import { X, MapPin, Layers, ChevronRight, Info, Coffee, HelpCircle } from 'lucide-react';
import { StoreCategory } from '../types';
import { ReviewModal } from './ReviewModal';

interface FloorDetailModalProps {
  floor: StoreCategory | null;
  selectedCategoryName?: string;
  onClose: () => void;
}

export const FloorDetailModal: React.FC<FloorDetailModalProps> = ({
  floor,
  selectedCategoryName,
  onClose,
}) => {
  const [showReviewModal, setShowReviewModal] = useState(false);

  if (!floor) return null;

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
              <Layers className="w-4 h-4 text-[#122B52]" />
              <span className="text-xs font-bold text-[#1a1a1a] uppercase tracking-wider">
                IN-STORE DIRECTORY & WAYFINDING
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
            {/* Floor Header */}
            <div className="flex items-start justify-between border-b border-[#f0ebd9] pb-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-[#122B52]">
                  {floor.level}
                </div>
                <h3 className="text-2xl font-serif font-extrabold text-[#1a1a1a] mt-0.5">
                  {floor.name}
                </h3>
                <p className="text-xs text-[#666052] mt-1">
                  {floor.subtitle}
                </p>
              </div>
              <span className="text-xs font-mono font-semibold bg-[#f5f0e1] border border-[#d8d0b8] text-[#554d3d] px-2.5 py-1 rounded-md">
                {floor.aisle}
              </span>
            </div>

            {/* Direct Category Highlight Guidance */}
            {selectedCategoryName && (
              <div className="bg-[#122B52] text-white p-4 rounded-xl shadow-md flex items-center gap-3">
                <MapPin className="w-6 h-6 text-[#ffd700] shrink-0" />
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#ffd700]">
                    WAYFINDING DIRECTION
                  </div>
                  <div className="text-sm font-bold mt-0.5">
                    "Head to {floor.level} — {selectedCategoryName}"
                  </div>
                </div>
              </div>
            )}

            {/* Subcategories Directory List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#4a453b]">
                CATEGORIES AVAILABLE ON THIS FLOOR
              </h4>

              <div className="grid grid-cols-1 gap-2">
                {floor.subcategories.map((sub, idx) => {
                  const isMatch = selectedCategoryName && sub.toLowerCase().includes(selectedCategoryName.toLowerCase());
                  return (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                        isMatch
                          ? 'bg-[#122B52]/10 border-[#122B52] text-[#122B52] font-bold'
                          : 'bg-[#faf8f5] border-[#e8e2d5] text-[#1a1a1a] hover:bg-[#f5f0e3]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 text-xs">
                        <span className="w-2 h-2 rounded-full bg-[#122B52]" />
                        <span className="font-semibold">{sub}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#888172]" />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Amenities & Assistance */}
            <div className="p-4 bg-[#f7f4ec] rounded-xl border border-[#e5dec9] space-y-2 text-xs text-[#555045]">
              <div className="font-bold uppercase tracking-wider text-[#1a1a1a] flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[#122B52]" />
                <span>Floor Services & Comfort</span>
              </div>
              <ul className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <li className="flex items-center gap-1.5">
                  • Trial Rooms & Fitting Lounge
                </li>
                <li className="flex items-center gap-1.5">
                  • Billing & Loyalty Counter
                </li>
                <li className="flex items-center gap-1.5">
                  • Water & Seating Area
                </li>
                <li className="flex items-center gap-1.5">
                  • Store Associate Assistance Desk
                </li>
              </ul>
            </div>

            <button
              onClick={handleCloseWithReviewCheck}
              className="w-full py-3.5 bg-[#1a1a1a] hover:bg-black text-white text-xs font-semibold tracking-wider uppercase rounded-xl transition-colors cursor-pointer"
            >
              Close Directory
            </button>
          </div>
        </div>
      </div>

      <ReviewModal
        isOpen={showReviewModal}
        title="Was this floor directory info helpful?"
        subtitle="Help us keep floor directory details accurate."
        badgeText="Directory Review"
        onClose={() => {
          setShowReviewModal(false);
          onClose();
        }}
      />
    </>
  );
};
