import React, { useState } from 'react';
import { X, Ticket, Copy, Check, Info, ShieldCheck } from 'lucide-react';
import { CustomerInfo } from '../types';

interface VoucherModalProps {
  customer: CustomerInfo | null;
  onClose: () => void;
}

export const VoucherModal: React.FC<VoucherModalProps> = ({ customer, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!customer) return null;

  const voucherCode = customer.sessionVoucherCode || 'FESTIVE20';
  const discountLabel = customer.sessionVoucherDiscount || '20% OFF';
  const voucherDesc = customer.sessionVoucherDesc || 'Flat 20% off on all Ethnic & Designer Collections';
  const minOrder = customer.sessionVoucherMinOrder || '₹2,999';

  const copyVoucher = () => {
    navigator.clipboard.writeText(voucherCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-md bg-[#ffffff] border border-[#e5dec9] shadow-2xl rounded-2xl overflow-hidden my-auto">
        <div className="h-1.5 bg-[#122B52] w-full" />

        <div className="p-4 sm:p-5 border-b border-[#f0ebd9] flex items-center justify-between bg-[#faf8f5]">
          <div className="flex items-center gap-2">
            <Ticket className="w-4 h-4 text-[#122B52]" />
            <span className="text-xs font-bold text-[#1a1a1a] uppercase tracking-wider">
              IN-STORE WI-FI WELCOME VOUCHER
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#eae4d5] text-[#1a1a1a] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6 text-center">
          <div className="bg-gradient-to-br from-[#ffffff] via-[#fffdfa] to-[#f8f3e6] border-2 border-dashed border-[#c5a059] rounded-2xl p-6 relative shadow-sm">
            <div className="absolute -left-3.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/60 border-r border-[#c5a059]" />
            <div className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/60 border-l border-[#c5a059]" />

            <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#122B52] mb-1">
              EXCLUSIVE SHOPPERS STOP REWARD
            </div>

            <h3 className="text-4xl font-serif font-black text-[#1a1a1a]">
              {discountLabel}
            </h3>

            <p className="text-xs font-semibold text-[#0B2038] tracking-wide uppercase mt-1">
              CAMPAIGN CODE: {voucherCode}
            </p>

            <div className="my-4 py-2 px-3 bg-[#f2ebd9] border border-[#d6cca8] rounded-xl flex items-center justify-between">
              <span className="text-sm font-mono font-extrabold text-[#122B52] tracking-wider">
                {voucherCode}
              </span>
              <button
                onClick={copyVoucher}
                className="px-2.5 py-1 bg-white border border-[#c5beaf] rounded-lg text-xs font-semibold text-[#1a1a1a] hover:bg-[#eae4d5] transition-colors flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-green-700" /> : <Copy className="w-3 h-3 text-[#122B52]" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* POS BARCODE GRAPHIC */}
            <div className="bg-white p-2.5 rounded-lg border border-[#e5dec9] space-y-1">
              <div className="h-10 w-full flex items-center justify-center gap-1 overflow-hidden opacity-90">
                {[3,1,2,4,1,3,2,1,4,2,1,3,1,2,3,1,4,2,1,3,2,1,4,1,3,1,2,4,2,1,3].map((w, idx) => (
                  <div key={idx} className="bg-black h-full" style={{ width: `${w * 1.5}px` }} />
                ))}
              </div>
              <p className="text-[10px] text-[#777063] font-mono">Present at cashier billing counter</p>
            </div>
          </div>

          <div className="text-left bg-[#fcfaf7] p-4 rounded-xl border border-[#e8e2d5] space-y-2 text-xs text-[#555045]">
            <div className="font-bold text-[#1a1a1a] flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <Info className="w-3.5 h-3.5 text-[#122B52]" />
              <span>Voucher Terms & Conditions</span>
            </div>
            <ul className="space-y-1 text-[11px] list-disc list-inside text-[#666052]">
              <li>{voucherDesc}</li>
              <li>Minimum purchase requirement: <strong>{minOrder}</strong>.</li>
              <li>Valid for in-store purchases at Shoppers Stop flagship stores.</li>
              <li>Assigned to Wi-Fi guest: <strong>{customer.fullName}</strong>.</li>
            </ul>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3.5 bg-[#122B52] hover:bg-[#0B2038] text-white text-xs font-semibold tracking-wider uppercase rounded-xl transition-colors cursor-pointer"
          >
            Continue Exploring Store
          </button>
        </div>
      </div>
    </div>
  );
};
