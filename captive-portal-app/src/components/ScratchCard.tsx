import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Gift, Sparkles, CheckCircle2, Copy, Check, Ticket, ArrowRight } from 'lucide-react';
import { CustomerInfo } from '../types';
import { apiUrl } from '../config/api';

interface ScratchCardProps {
  customer: CustomerInfo;
  onExplore: () => void;
  onUpdateCustomerVoucher?: (updated: CustomerInfo) => void;
}

// EXACT 4 COUPONS FROM DASHBOARD
const DASHBOARD_COUPONS = [
  {
    code: 'FESTIVE20',
    discount: '20% OFF',
    label: 'ETHNIC & WOMENSWEAR',
    description: 'Flat 20% off on all Ethnic & Designer Collections for First Citizen Members',
    minOrder: '₹4,999'
  },
  {
    code: 'FIRSTCITIZEN15',
    discount: '15% OFF',
    label: 'SITE-WIDE VIP OFFER',
    description: 'Exclusive 15% bonus discount for Black & Platinum tier members',
    minOrder: '₹2,999'
  },
  {
    code: 'BEAUTYBUY2',
    discount: '₹1000 FLAT',
    label: 'BEAUTY & PERFUMES',
    description: 'Buy Beauty & Fragrance items above ₹5000 and get ₹1000 Instant Off',
    minOrder: '₹5,000'
  },
  {
    code: 'ENDOFSEASON50',
    discount: '50% OFF',
    label: 'MENSWEAR CLEARANCE',
    description: 'End of Season Sale - Scheduled clearance for select Menswear lines',
    minOrder: '₹9,999'
  }
];

export const ScratchCard: React.FC<ScratchCardProps> = ({ customer, onExplore, onUpdateCustomerVoucher }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isScratching, setIsScratching] = useState(false);
  const [scratchPercentage, setScratchPercentage] = useState(0);
  const [copied, setCopied] = useState(false);

  // Randomly select one of the exact 4 dashboard coupons
  const [assignedCoupon] = useState(() => {
    return DASHBOARD_COUPONS[Math.floor(Math.random() * DASHBOARD_COUPONS.length)];
  });

  const broadcastRedemption = useCallback((coupon: typeof DASHBOARD_COUPONS[0]) => {
    // 1. Update customer object metadata
    if (onUpdateCustomerVoucher) {
      onUpdateCustomerVoucher({
        ...customer,
        sessionVoucherCode: coupon.code,
        sessionVoucherDiscount: coupon.discount,
        sessionVoucherDesc: coupon.description,
        sessionVoucherMinOrder: coupon.minOrder
      });
    }

    // 2. Post to Telemetry & Customer Sync API (Port 63265)
    const custName = customer.fullName || customer.name || customer.username || 'Wi-Fi Guest';
    const custPhone = customer.phone || '9876543210';
    const custEmail = customer.email || `${custPhone}@ss-wifi.in`;

    // Save customer + assigned_coupon in Supabase customers table
    fetch(apiUrl('/api/customers'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: custName,
        phone: custPhone,
        email: custEmail,
        coupon: coupon.code
      })
    }).catch(() => {});

    // Save redemption in Supabase redemptions & coupons table
    fetch(apiUrl('/api/redemptions'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        couponCode: coupon.code,
        customerName: custName,
        customerPhone: custPhone,
        customerEmail: custEmail,
        storeLocation: 'Mumbai - Malad West Flagship'
      })
    }).catch(() => {});

    // 3. Broadcast Event
    const payload = {
      type: 'COUPON_REDEEMED',
      payload: {
        couponCode: coupon.code,
        discountLabel: coupon.discount,
        customerName: customer.fullName || 'Wi-Fi Guest',
        customerPhone: customer.phone || '9876543210',
        customerEmail: customer.email || `${customer.phone || '9876543210'}@ss-wifi.in`,
        connectedAt: customer.connectedAt || new Date().toLocaleTimeString(),
        redeemedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      },
      timestamp: Date.now()
    };

    try {
      localStorage.setItem('ss_wifi_telemetry_event', JSON.stringify(payload));
    } catch (e) {}

    try {
      const channel = new BroadcastChannel('ss_wifi_channel');
      channel.postMessage(payload);
    } catch (e) {}
  }, [customer, onUpdateCustomerVoucher]);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    const width = rect.width;
    const height = rect.height;

    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#e6c875');
    gradient.addColorStop(0.3, '#d4af37');
    gradient.addColorStop(0.5, '#f5e6a3');
    gradient.addColorStop(0.7, '#c5a059');
    gradient.addColorStop(1, '#9e7d32');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1;
    for (let i = -height; i < width + height; i += 12) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + height, height);
      ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(158, 0, 28, 0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(8, 8, width - 16, height - 16);

    ctx.fillStyle = '#4a3b12';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✨ SCRATCH WITH FINGER / MOUSE', width / 2, height / 2 - 8);

    ctx.fillStyle = '#122B52';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('TO REVEAL DASHBOARD VOUCHER', width / 2, height / 2 + 12);
  }, []);

  useEffect(() => {
    initCanvas();
    if (assignedCoupon) {
      broadcastRedemption(assignedCoupon);
    }
  }, [initCanvas, assignedCoupon, broadcastRedemption]);

  const scratch = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 24, 0, Math.PI * 2);
    ctx.fill();

    checkScratchPercentage();
  };

  const checkScratchPercentage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparentPixels = 0;

    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) transparentPixels++;
    }

    const percentage = Math.round((transparentPixels / (pixels.length / 4)) * 100);
    setScratchPercentage(percentage);

    if (percentage > 45 && !isRevealed) {
      setIsRevealed(true);
      broadcastRedemption(assignedCoupon);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsScratching(true);
    scratch(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isScratching) return;
    scratch(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    setIsScratching(false);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    setIsScratching(true);
    if (e.touches[0]) {
      scratch(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isScratching) return;
    if (e.touches[0]) {
      scratch(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchEnd = () => {
    setIsScratching(false);
  };

  const handleQuickTapReveal = () => {
    setIsRevealed(true);
    setScratchPercentage(100);
    broadcastRedemption(assignedCoupon);
  };

  const copyVoucher = () => {
    navigator.clipboard.writeText(assignedCoupon.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-md bg-[#ffffff] border border-[#e8e2d5] shadow-2xl rounded-2xl overflow-hidden my-auto">
        <div className="h-1.5 w-full bg-[#122B52]" />

        <div className="p-6 sm:p-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#122B52]/10 text-[#122B52] text-xs font-semibold uppercase tracking-wider mb-3">
            <Gift className="w-3.5 h-3.5" />
            <span>Wi-Fi Welcome Gift</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1a1a1a] tracking-tight mb-2">
            🎁 Surprise Gift Unlocked!
          </h2>

          <p className="text-sm text-[#555045] mb-6 leading-relaxed">
            Scratch below to reveal your live Dashboard campaign voucher
          </p>

          {/* Card Container */}
          <div className="relative mx-auto w-full max-w-xs h-56 rounded-xl overflow-hidden shadow-lg border border-[#d4cfc1] bg-gradient-to-br from-[#faf7f2] via-[#f5efdf] to-[#ebe1cb] flex flex-col items-center justify-center p-4">
            {/* Underlying Revealed Reward */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center select-none bg-gradient-to-br from-[#ffffff] via-[#fffdf9] to-[#f7f2e6]">
              <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-[#d4af37]/10 pointer-events-none" />
              <div className="absolute -left-6 -top-6 w-20 h-20 rounded-full bg-[#122B52]/5 pointer-events-none" />

              <span className="text-[10px] font-bold uppercase tracking-widest text-[#122B52] mb-1">
                SHOPPERS STOP DASHBOARD COUPON
              </span>

              <div className="text-3xl sm:text-4xl font-serif font-black text-[#1a1a1a] tracking-tight text-shadow-sm my-0.5">
                {assignedCoupon.discount}
              </div>

              <div className="text-[10px] font-bold uppercase tracking-wider text-[#122B52] bg-[#122B52]/10 px-2.5 py-0.5 rounded-full mb-2">
                {assignedCoupon.label}
              </div>

              <div className="flex items-center justify-center gap-1.5 text-xs font-mono text-[#4a453b] bg-[#f0ebd9] px-3 py-1 rounded border border-[#d6cca8] mb-2">
                <Ticket className="w-3.5 h-3.5 text-[#122B52]" />
                <span className="font-extrabold text-[#122B52] tracking-wider">{assignedCoupon.code}</span>
              </div>

              {/* POS BARCODE GRAPHIC INTERFACE */}
              <div className="w-full bg-white p-1.5 rounded border border-[#e5dec9] space-y-0.5">
                <div className="h-6 w-full flex items-center justify-center gap-0.5 overflow-hidden opacity-90">
                  {[3,1,2,4,1,3,2,1,4,2,1,3,1,2,3,1,4,2,1,3,2,1,4,1,3,1,2,4].map((w, idx) => (
                    <div key={idx} className="bg-black h-full" style={{ width: `${w * 1.2}px` }} />
                  ))}
                </div>
                <p className="text-[9px] text-[#777063] font-mono">POS Billing Barcode • Present at counter</p>
              </div>
            </div>

            {/* Interactive Scratch Canvas Overlay */}
            {!isRevealed && (
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="absolute inset-0 w-full h-full cursor-pointer z-10 transition-opacity duration-500"
              />
            )}
          </div>

          {!isRevealed ? (
            <div className="mt-4 flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={handleQuickTapReveal}
                className="inline-flex items-center gap-1.5 text-xs text-[#122B52] font-bold hover:underline cursor-pointer py-1.5 px-4 rounded-full bg-[#122B52]/10 hover:bg-[#122B52]/20 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>TAP TO REVEAL CODE</span>
              </button>
              <span className="text-[11px] text-[#888172]">
                {scratchPercentage > 0 ? `Scratched: ${scratchPercentage}%` : 'Swipe mouse or finger over card'}
              </span>
            </div>
          ) : (
            <div className="mt-4 space-y-3 animate-fade-in">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1a7f37] bg-[#ebf7ee] px-3 py-1 rounded-full border border-[#b8e5c0]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Coupon Code Saved & Synced to Dashboard</span>
              </div>

              <p className="text-xs text-[#666052]">
                {assignedCoupon.description} (Min Spend: {assignedCoupon.minOrder})
              </p>

              <div className="bg-[#faf8f3] border border-[#e5dec9] p-3 rounded-xl flex items-center justify-between text-left">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-[#888172] font-semibold">Active Campaign Code</div>
                  <div className="text-sm font-extrabold font-mono text-[#122B52]">{assignedCoupon.code}</div>
                </div>

                <button
                  onClick={copyVoucher}
                  className="px-3 py-1.5 bg-[#122B52] hover:bg-[#0B2038] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>

              <button
                onClick={onExplore}
                className="w-full py-3 bg-[#1a1a1a] hover:bg-black text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                <span>EXPLORE IN-STORE ARRIVALS</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
