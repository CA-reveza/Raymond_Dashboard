import React, { useState } from 'react';
import { X, MapPin, Sparkles, Compass, Navigation, Phone, CheckCircle2, ChevronRight, Store } from 'lucide-react';
import { NewArrivalCollection } from '../types';
import { ReviewModal } from './ReviewModal';

interface CollectionModalProps {
  collection: NewArrivalCollection | null;
  onClose: () => void;
  onLocateBrand?: (location: string) => void;
}

export const CollectionModal: React.FC<CollectionModalProps> = ({ collection, onClose }) => {
  const [showWayfinding, setShowWayfinding] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  if (!collection) return null;

  const handleCloseWithReviewCheck = () => {
    const hasReviewed = sessionStorage.getItem('ss_portal_reviewed') === 'true';
    if (!hasReviewed) {
      setShowReviewModal(true);
    } else {
      onClose();
    }
  };

  // Generate specific rack & aisle details based on collection category
  const getRackDetails = (cat: string) => {
    switch (cat) {
      case 'WOMEN':
        return {
          floor: "Second Floor",
          zone: "Women's Fashion • Section A",
          aisle: "Aisle 4 • Rack #W-24",
          landmark: "Adjacent to Women's Fitting Rooms & Biba Counter",
          steps: [
            "Take the Central Escalator up to the 2nd Floor.",
            "Turn right towards Women's Ethnic & Western Wear.",
            "Walk past the Tommy Hilfiger counter into Aisle 4.",
            "Look for the gold 'JUST LANDED' overhead rack banner."
          ]
        };
      case 'MEN':
        return {
          floor: "First Floor",
          zone: "Men's Apparel • Section B",
          aisle: "Aisle 2 • Rack #M-12",
          landmark: "Opposite Levi's Denim Studio & Near Elevator 2",
          steps: [
            "Take the Central Escalator to the 1st Floor.",
            "Head straight past the Men's Footwear gallery.",
            "Enter Aisle 2 on your left next to the Denim Studio.",
            "Rack #M-12 is displayed at the front of the Casuals aisle."
          ]
        };
      case 'BEAUTY':
        return {
          floor: "Ground Floor",
          zone: "Beauty & Cosmetics Main Atrium",
          aisle: "Counter #B-08",
          landmark: "Opposite Estée Lauder & Next to M.A.C Counter",
          steps: [
            "Located on Ground Floor directly in the main entrance atrium.",
            "Walk past the central fragrance island towards Counter #B-08.",
            "Consult the beauty advisor at the station for live trial."
          ]
        };
      default:
        return {
          floor: "Ground Floor",
          zone: "Accessories & Watch Gallery",
          aisle: "Showcase #A-05",
          landmark: "Near Main Store Entrance & Escalator Landing",
          steps: [
            "Located on Ground Floor near the main store entrance.",
            "Look for Showcase #A-05 adjacent to the luxury watch island."
          ]
        };
    }
  };

  const details = getRackDetails(collection.category);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md animate-fade-in overflow-y-auto">
        <div className="relative w-full max-w-2xl bg-[#ffffff] border border-[#e5dec9] shadow-2xl rounded-2xl overflow-hidden my-auto">
          {/* Header Bar */}
          <div className="p-4 sm:p-5 border-b border-[#f0ebd9] flex items-center justify-between bg-[#faf8f5]">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#122B52]/10 text-[#122B52] text-[11px] font-bold uppercase tracking-wider">
                {collection.badge}
              </span>
              <span className="text-xs text-[#777063] font-medium uppercase tracking-wider">
                {collection.category} Collection
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
          <div className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
            {/* Main Hero Image */}
            <div className="relative h-64 sm:h-72 w-full rounded-xl overflow-hidden shadow-sm">
              <img
                src={collection.imageUrl}
                alt={collection.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-xs font-semibold uppercase tracking-widest text-[#f0d486] mb-1 block">
                  IN-STORE HIGHLIGHT
                </span>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold">
                  {collection.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-200 mt-1">
                  {collection.subtitle}
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#122B52]">
                ABOUT THIS COLLECTION
              </h4>
              <p className="text-sm text-[#4a453b] leading-relaxed">
                {collection.description}
              </p>
            </div>

            {/* In-Store Highlights */}
            <div className="space-y-3 bg-[#faf8f3] p-4 sm:p-5 rounded-xl border border-[#e8e2d5]">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#1a1a1a] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#122B52]" />
                <span>Key Arrival Racks</span>
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {collection.highlights.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-xs text-[#3a352c] font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#122B52]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Physical Store Location Banner & Action */}
            <div className="bg-[#122B52]/5 border border-[#122B52]/20 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-[#122B52] text-white rounded-lg shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#122B52] tracking-wider">
                    PHYSICAL STORE LOCATION
                  </div>
                  <div className="text-sm font-bold text-[#1a1a1a] mt-0.5">
                    {collection.storeLocation}
                  </div>
                  <div className="text-xs text-[#666052] mt-0.5">
                    Ask any sales advisor or follow overhead signage
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowWayfinding(!showWayfinding)}
                className="px-4 py-2.5 bg-[#122B52] hover:bg-[#0B2038] text-white text-xs font-bold tracking-wider uppercase rounded-lg transition-colors cursor-pointer shrink-0 flex items-center gap-2 shadow-xs"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>{showWayfinding ? 'Hide Wayfinding' : 'Head To Rack →'}</span>
              </button>
            </div>

            {/* INTERACTIVE WAYFINDING & EXACT RACK DETAILS DRAWER */}
            {showWayfinding && (
              <div className="bg-[#faf8f3] text-[#1a1a1a] p-5 rounded-2xl space-y-4 border border-[#e8e2d5] animate-fade-in shadow-md">
                <div className="flex items-center justify-between border-b border-[#e5dec9] pb-3">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-[#122B52]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#122B52]">In-Store Rack Navigation & Location Details</span>
                  </div>
                  <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-[#122B52]/10 text-[#122B52]">Live Wayfinding</span>
                </div>

                {/* Location Metadata Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-white p-3.5 rounded-xl border border-[#e5dec9]">
                    <div className="text-[10px] font-bold uppercase text-[#777063]">Target Floor & Zone</div>
                    <div className="text-xs font-bold text-[#1a1a1a] mt-1">{details.floor} • {details.zone}</div>
                  </div>
                  <div className="bg-white p-3.5 rounded-xl border border-[#e5dec9]">
                    <div className="text-[10px] font-bold uppercase text-[#122B52]">Specific Rack Identifier</div>
                    <div className="text-xs font-black text-[#122B52] font-mono mt-1">{details.aisle}</div>
                  </div>
                </div>

                {/* Nearby Landmark */}
                <div className="bg-white p-3.5 rounded-xl border border-[#e5dec9] flex items-center gap-2.5">
                  <Store className="w-4 h-4 text-[#c5a059] shrink-0" />
                  <div className="text-xs text-[#3a352c]">
                    <span className="font-bold text-[#1a1a1a]">Landmark:</span> {details.landmark}
                  </div>
                </div>

                {/* Step-by-Step Directions */}
                <div className="space-y-2 pt-1">
                  <div className="text-[11px] font-bold uppercase text-[#122B52] tracking-wider">Step-by-Step Floor Directions</div>
                  <div className="space-y-2">
                    {details.steps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-[#4a453b]">
                        <span className="w-5 h-5 rounded-full bg-[#122B52] text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                          {idx + 1}
                        </span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* In-Store Associate Helpline */}
                <div className="pt-3 border-t border-[#e5dec9] flex items-center justify-between text-xs text-[#666052]">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#122B52]" />
                    <span>Floor Advisor Desk Ext: <strong className="text-[#122B52] font-mono">#204</strong></span>
                  </div>
                  <button onClick={handleCloseWithReviewCheck} className="text-xs text-[#122B52] hover:underline font-bold cursor-pointer">
                    Close & Browse Store →
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => {
          setShowReviewModal(false);
          onClose();
        }}
      />
    </>
  );
};
