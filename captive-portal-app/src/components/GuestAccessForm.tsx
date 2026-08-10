import React, { useState, useEffect } from 'react';
import { Wifi, Phone, Lock, User, Mail, Sparkles, ShieldCheck, ArrowRight, CheckCircle2, AlertCircle, UserCheck, KeyRound, UserPlus } from 'lucide-react';
import { STORE_INFO } from '../data/mockStoreData';
import { CustomerInfo } from '../types';
import { apiUrl } from '../config/api';

interface GuestAccessFormProps {
  onSuccessNewUser: (customer: CustomerInfo) => void;
  onSuccessReturningUser: (customer: CustomerInfo) => void;
}

export const GuestAccessForm: React.FC<GuestAccessFormProps> = ({ onSuccessNewUser, onSuccessReturningUser }) => {
  // Active Tab: 'new' vs 'returning'
  const [activeTab, setActiveTab] = useState<'new' | 'returning'>('new');

  // Shared Form Fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [timer, setTimer] = useState(30);

  const [consentOffers, setConsentOffers] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(true);

  const [connectingStep, setConnectingStep] = useState(0); // 0 = idle, 1 = verifying, 2 = assigning ip, 3 = connected
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Stored Customers Directory & Existing User Match
  const [storedCustomers, setStoredCustomers] = useState<any[]>([]);
  const [recognizedMember, setRecognizedMember] = useState<any | null>(null);
  const [existingUserFound, setExistingUserFound] = useState<any | null>(null);

  // Load existing customers on mount
  useEffect(() => {
    const loadStored = async () => {
      let customersArr: any[] = [];
      try {
        const local = localStorage.getItem('SS_STORED_CUSTOMERS');
        if (local) customersArr = JSON.parse(local);
      } catch (e) {}

      try {
        const res = await fetch(apiUrl('/api/customers'));
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.customers)) {
            customersArr = data.customers;
          }
        }
      } catch (e) {}

      setStoredCustomers(customersArr);
    };

    loadStored();
  }, []);

  // Handle Phone Number Change for New Users (Check if already registered)
  const handleNewPhoneChange = (inputPhone: string) => {
    setPhone(inputPhone);
    const cleanDigits = inputPhone.replace(/\D/g, '').slice(-10);

    if (cleanDigits.length === 10) {
      const match = storedCustomers.find((c) => {
        const cDigits = (c.phone || '').replace(/\D/g, '').slice(-10);
        return cDigits === cleanDigits;
      });

      if (match) {
        setExistingUserFound(match);
        setErrors((prev) => ({
          ...prev,
          phone: `This mobile number is already registered under First Citizen registry. Please switch to Returning Member Login to continue.`,
        }));
      } else {
        setExistingUserFound(null);
        setErrors((prev) => ({ ...prev, phone: '' }));
      }
    } else {
      setExistingUserFound(null);
      setErrors((prev) => ({ ...prev, phone: '' }));
    }
  };

  // Handle Returning Member Phone Lookup
  const handleReturningPhoneChange = (inputPhone: string) => {
    setPhone(inputPhone);
    const cleanDigits = inputPhone.replace(/\D/g, '').slice(-10);

    if (cleanDigits.length === 10) {
      const match = storedCustomers.find((c) => {
        const cDigits = (c.phone || '').replace(/\D/g, '').slice(-10);
        return cDigits === cleanDigits;
      });

      if (match) {
        setRecognizedMember(match);
        setFullName(match.name);
        if (match.email) setEmail(match.email);
        setErrors((prev) => ({ ...prev, phone: '' }));
      } else {
        setRecognizedMember(null);
        setErrors((prev) => ({
          ...prev,
          phone: `Mobile number not found in First Citizen registry. Please select 'New Guest Access' tab to register.`,
        }));
      }
    } else {
      setRecognizedMember(null);
      setErrors((prev) => ({ ...prev, phone: '' }));
    }
  };

  const switchToReturningTab = (existingCustomer?: any) => {
    setActiveTab('returning');
    setExistingUserFound(null);
    setErrors({});
    setOtpSent(false);
    setOtpVerified(false);

    if (existingCustomer) {
      setPhone(existingCustomer.phone || phone);
      setRecognizedMember(existingCustomer);
      setFullName(existingCustomer.name);
      if (existingCustomer.email) setEmail(existingCustomer.email);
    } else if (phone) {
      handleReturningPhoneChange(phone);
    }
  };

  const handleSendOtp = () => {
    if (!phone.trim() || phone.trim().length < 10) {
      setErrors((prev) => ({ ...prev, phone: 'Please enter a valid 10-digit mobile number' }));
      return;
    }

    if (activeTab === 'new' && existingUserFound) {
      setErrors((prev) => ({
        ...prev,
        phone: `This mobile number already exists. Click below to switch to Returning Member Login.`,
      }));
      return;
    }

    if (activeTab === 'returning' && !recognizedMember) {
      setErrors((prev) => ({
        ...prev,
        phone: `Mobile number not registered. Switch to 'New Guest Access' to sign up.`,
      }));
      return;
    }

    setErrors((prev) => ({ ...prev, phone: '' }));
    setOtpSent(true);
    setTimer(30);

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleVerifyOtp = (code: string) => {
    setOtpCode(code);
    if (code.length === 4) {
      if (code === '1234' || code.length === 4) {
        setOtpVerified(true);
        setErrors((prev) => ({ ...prev, otp: '' }));
      }
    }
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!phone.trim() || phone.trim().length < 10) {
      newErrors.phone = 'Valid 10-digit mobile number required';
    }

    if (activeTab === 'new') {
      if (!fullName.trim()) {
        newErrors.fullName = 'Full Name is required for First Citizen registration';
      }
      if (existingUserFound) {
        newErrors.phone = 'Mobile number already registered. Please switch to Returning Member Login.';
      }
    }

    if (activeTab === 'returning' && !recognizedMember) {
      newErrors.phone = `Mobile number not found. Please switch to 'New Guest Access' tab to register.`;
    }

    if (!otpVerified) {
      newErrors.otp = 'Please enter SMS OTP (Demo OTP: 1234) to verify mobile number';
    }

    if (!termsAccepted) {
      newErrors.terms = 'Please accept the Wi-Fi terms & conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setConnectingStep(1);

    setTimeout(() => {
      setConnectingStep(2);
    }, 900);

    setTimeout(() => {
      setConnectingStep(3);
    }, 1800);

    setTimeout(() => {
      const cleanName = fullName.trim() || recognizedMember?.name || 'Wi-Fi Member';
      const cleanPhone = phone.trim();
      const cleanEmail = email.trim() || recognizedMember?.email || '';
      const formattedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      if (activeTab === 'returning') {
        // RETURNING MEMBER LOGIN -> Direct to Companion Discovery
        const returningCust: CustomerInfo = {
          fullName: recognizedMember?.name || cleanName,
          phone: cleanPhone,
          email: cleanEmail,
          consentOffers,
          termsAccepted,
          connectedAt: formattedTime,
          sessionVoucherCode: recognizedMember?.sessionVoucherCode || 'FESTIVE20',
          sessionVoucherDiscount: '20% OFF',
          sessionVoucherDesc: 'Flat 20% off on all Ethnic & Designer Collections',
          sessionVoucherMinOrder: '₹4,999'
        };

        const returningCoupon = returningCust.sessionVoucherCode || 'FESTIVE20';
        fetch(apiUrl('/api/customers'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: cleanName, phone: cleanPhone, email: cleanEmail, coupon: returningCoupon })
        }).catch(() => {});

        try {
          const eventPayload = {
            type: 'RETURNING_CUSTOMER_LOGIN',
            payload: {
              fullName: cleanName,
              phone: cleanPhone,
              email: cleanEmail,
              connectedAt: formattedTime,
              sessionVoucherCode: returningCust.sessionVoucherCode
            },
            timestamp: Date.now()
          };
          localStorage.setItem('ss_wifi_telemetry_event', JSON.stringify(eventPayload));
          const channel = new BroadcastChannel('ss_wifi_channel');
          channel.postMessage(eventPayload);
        } catch (e) {}

        onSuccessReturningUser(returningCust);
      } else {
        // NEW GUEST ACCESS -> Advance to Scratch Card
        const voucherCode = `FESTIVE20`;
        const newCustObj = {
          id: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
          name: cleanName,
          email: cleanEmail || `${cleanPhone}@ss-wifi.in`,
          phone: cleanPhone.startsWith('+91') ? cleanPhone : `+91 ${cleanPhone}`,
          loyaltyTier: 'Black',
          loyaltyPoints: 1250,
          totalSpent: 0,
          totalOrders: 0,
          lastPurchaseDate: '2026-07-27',
          preferredCategory: 'In-Store Guest Wi-Fi',
          joinedDate: '2026-07-27',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'
        };

        fetch(apiUrl('/api/customers'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: cleanName, phone: cleanPhone, email: cleanEmail, coupon: voucherCode })
        }).catch(() => {});

        try {
          const existingStr = localStorage.getItem('SS_STORED_CUSTOMERS');
          let existingArr = existingStr ? JSON.parse(existingStr) : [];
          if (!Array.isArray(existingArr)) existingArr = [];
          existingArr = existingArr.filter((c: any) => c.name.toLowerCase() !== cleanName.toLowerCase());
          existingArr = [newCustObj, ...existingArr];
          localStorage.setItem('SS_STORED_CUSTOMERS', JSON.stringify(existingArr));
        } catch (e) {}

        try {
          const eventPayload = {
            type: 'NEW_CUSTOMER_LOGIN',
            payload: {
              fullName: cleanName,
              phone: cleanPhone,
              email: cleanEmail,
              connectedAt: formattedTime,
              sessionVoucherCode: voucherCode
            },
            timestamp: Date.now()
          };
          localStorage.setItem('ss_wifi_telemetry_event', JSON.stringify(eventPayload));
          const channel = new BroadcastChannel('ss_wifi_channel');
          channel.postMessage(eventPayload);
        } catch (e) {}

        onSuccessNewUser({
          fullName: cleanName,
          phone: cleanPhone,
          email: cleanEmail,
          consentOffers,
          termsAccepted,
          connectedAt: formattedTime,
          sessionVoucherCode: voucherCode,
        });
      }
    }, 2600);
  };

  return (
    <div className="min-h-screen w-full bg-[#faf8f5] flex flex-col justify-center items-center relative overflow-hidden py-8 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#122B52]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md mx-auto">
        <div className="bg-[#ffffff] border border-[#e5dec9] shadow-2xl rounded-2xl overflow-hidden transition-all duration-300">
          <div className="h-2 w-full bg-gradient-to-r from-[#122B52] via-[#c5a059] to-[#122B52]" />

          {/* TOP SEGMENTED TABS: NEW USER VS RETURNING MEMBER */}
          <div className="grid grid-cols-2 bg-[#faf8f5] border-b border-[#e8e2d5] p-1.5 gap-1">
            <button
              type="button"
              onClick={() => {
                setActiveTab('new');
                setErrors({});
                setOtpVerified(false);
                setOtpSent(false);
                setExistingUserFound(null);
              }}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'new'
                  ? 'bg-white text-[#122B52] shadow-xs border border-[#e5dec9]'
                  : 'text-[#666052] hover:text-[#1a1a1a]'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>NEW GUEST ACCESS</span>
            </button>

            <button
              type="button"
              onClick={() => switchToReturningTab()}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'returning'
                  ? 'bg-white text-[#122B52] shadow-xs border border-[#e5dec9]'
                  : 'text-[#666052] hover:text-[#1a1a1a]'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>RETURNING MEMBER</span>
            </button>
          </div>

          <div className="p-6 sm:p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#122B52]/10 text-[#122B52] text-xs font-bold uppercase tracking-wider mb-2">
                <Wifi className="w-3.5 h-3.5" />
                <span>{activeTab === 'new' ? 'Shoppers Stop Guest Wi-Fi' : 'First Citizen Member Login'}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#1a1a1a] tracking-tight">
                SHOPPERS STOP
              </h1>
              <p className="text-xs text-[#777063] uppercase tracking-widest font-semibold mt-0.5">
                {activeTab === 'new' ? 'NEW GUEST REGISTRATION & REWARD' : 'RESUME MEMBER WI-FI SESSION'}
              </p>
              <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-[#555045] bg-[#faf8f3] px-3 py-1.5 rounded-lg border border-[#e8e2d5]">
                <ShieldCheck className="w-4 h-4 text-[#122B52]" />
                <span>{STORE_INFO.location}</span>
              </div>
            </div>

            {connectingStep > 0 ? (
              <div className="py-10 text-center space-y-4">
                <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-[#122B52]/20 border-t-[#122B52] animate-spin" />
                  <Wifi className="w-8 h-8 text-[#122B52]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1a1a1a]">
                    {connectingStep === 1 && (activeTab === 'returning' ? 'Authenticating Returning Member...' : 'Verifying First Citizen Credentials...')}
                    {connectingStep === 2 && 'Assigning High-Speed Wi-Fi IP Address...'}
                    {connectingStep === 3 && (activeTab === 'returning' ? 'Session Resumed! Loading Companion...' : 'Connection Established! Unlocking Voucher...')}
                  </h3>
                  <p className="text-xs text-[#777063] mt-1">
                    Welcome to Shoppers Stop • {fullName || 'Valued Guest'}
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Recognized Returning Member Box */}
                {activeTab === 'returning' && recognizedMember && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-900 font-semibold animate-fade-in">
                    <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <div>Welcome back, <strong>{recognizedMember.name}</strong>!</div>
                      <div className="text-[11px] font-normal text-emerald-700">First Citizen {recognizedMember.loyaltyTier || 'Member'} Recognized. Verify OTP to resume session.</div>
                    </div>
                  </div>
                )}

                {/* POPUP / ALERT: EXISTING USER DETECTED ON NEW USER TAB */}
                {activeTab === 'new' && existingUserFound && (
                  <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl space-y-2 text-xs text-amber-900 font-medium animate-fade-in shadow-xs">
                    <div className="flex items-center gap-2 font-bold text-amber-950">
                      <AlertCircle className="w-4.5 h-4.5 text-amber-600 shrink-0" />
                      <span>Mobile Number Already Registered!</span>
                    </div>
                    <p className="text-[11px] text-amber-800 leading-snug">
                      This mobile number is already registered under First Citizen registry. New account creation is disabled for existing members.
                    </p>
                    <button
                      type="button"
                      onClick={() => switchToReturningTab(existingUserFound)}
                      className="w-full py-2.5 px-3 bg-[#122B52] hover:bg-[#0B2038] text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <span>SWITCH TO RETURNING MEMBER LOGIN →</span>
                    </button>
                  </div>
                )}

                {/* TAB 1: NEW USERS FULL NAME INPUT */}
                {activeTab === 'new' && (
                  <div>
                    <label className="block text-xs font-bold text-[#3a352c] uppercase tracking-wider mb-1">
                      FULL NAME <span className="text-[#122B52]">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#888172]">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter your full name"
                        className="w-full pl-9 pr-3 py-2.5 bg-[#fcfaf7] border border-[#d6cca8] rounded-xl text-sm font-medium text-[#1a1a1a] focus:outline-none focus:border-[#122B52] focus:ring-1 focus:ring-[#122B52]"
                      />
                    </div>
                    {errors.fullName && <p className="text-[11px] text-[#122B52] mt-1 font-semibold">{errors.fullName}</p>}
                  </div>
                )}

                {/* SHARED MOBILE NUMBER INPUT */}
                <div>
                  <label className="block text-xs font-bold text-[#3a352c] uppercase tracking-wider mb-1">
                    MOBILE NUMBER <span className="text-[#122B52]">*</span>
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#888172]">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => {
                          if (activeTab === 'returning') {
                            handleReturningPhoneChange(e.target.value);
                          } else {
                            handleNewPhoneChange(e.target.value);
                          }
                        }}
                        placeholder="10-Digit Mobile No."
                        maxLength={10}
                        className={`w-full pl-9 pr-3 py-2.5 bg-[#fcfaf7] border rounded-xl text-sm font-medium text-[#1a1a1a] focus:outline-none ${
                          errors.phone || existingUserFound ? 'border-[#122B52] bg-rose-50/30' : 'border-[#d6cca8] focus:border-[#122B52]'
                        }`}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={otpVerified || (otpSent && timer > 0) || (activeTab === 'new' && !!existingUserFound)}
                      className={`px-3 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-colors shrink-0 ${
                        activeTab === 'new' && existingUserFound
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : otpVerified
                          ? 'bg-emerald-100 text-emerald-800 cursor-default'
                          : otpSent && timer > 0
                          ? 'bg-[#122B52]/60 text-white'
                          : 'bg-[#122B52] hover:bg-[#0B2038] text-white cursor-pointer'
                      }`}
                    >
                      {otpVerified ? '✓ Verified' : otpSent && timer > 0 ? `Resend (${timer}s)` : 'Send OTP'}
                    </button>
                  </div>
                  {errors.phone && !existingUserFound && (
                    <div className="flex items-start gap-1.5 text-[11px] text-[#122B52] mt-1.5 font-semibold bg-rose-50 p-2 rounded-lg border border-rose-200">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>{errors.phone}</span>
                    </div>
                  )}
                </div>

                {/* OTP INPUT */}
                {otpSent && !otpVerified && (
                  <div className="bg-[#faf8f3] p-3 rounded-xl border border-[#e8e2d5] space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-[#1a1a1a]">Enter 4-Digit SMS OTP</span>
                      <span className="text-[#122B52] font-bold font-mono">Demo OTP: 1234</span>
                    </div>
                    <input
                      type="text"
                      value={otpCode}
                      onChange={(e) => handleVerifyOtp(e.target.value)}
                      placeholder="1 2 3 4"
                      maxLength={4}
                      className="w-full tracking-[0.5em] text-center font-mono font-bold text-lg py-2 bg-white border border-[#c5beaf] rounded-lg text-[#1a1a1a] focus:outline-none focus:border-[#122B52]"
                    />
                    {errors.otp && <p className="text-[11px] text-[#122B52] font-semibold">{errors.otp}</p>}
                  </div>
                )}

                {otpVerified && (
                  <div className="flex items-center gap-2 p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Mobile number verified via SMS OTP!</span>
                  </div>
                )}

                {/* TAB 1: NEW USERS EMAIL INPUT */}
                {activeTab === 'new' && (
                  <div>
                    <label className="block text-xs font-bold text-[#3a352c] uppercase tracking-wider mb-1">
                      EMAIL ADDRESS <span className="text-gray-400 font-normal">(OPTIONAL)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#888172]">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your.email@domain.com"
                        className="w-full pl-9 pr-3 py-2.5 bg-[#fcfaf7] border border-[#d6cca8] rounded-xl text-sm font-medium text-[#1a1a1a] focus:outline-none focus:border-[#122B52] focus:ring-1 focus:ring-[#122B52]"
                      />
                    </div>
                  </div>
                )}

                {/* TERMS & CONSENT */}
                <div className="space-y-2 pt-2">
                  {activeTab === 'new' && (
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={consentOffers}
                        onChange={(e) => setConsentOffers(e.target.checked)}
                        className="mt-0.5 rounded border-[#c5beaf] text-[#122B52] focus:ring-[#122B52]"
                      />
                      <span className="text-xs text-[#555045] leading-snug">
                        I want to receive exclusive offers, fashion updates & VIP privileges from Shoppers Stop.
                      </span>
                    </label>
                  )}

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-0.5 rounded border-[#c5beaf] text-[#122B52] focus:ring-[#122B52]"
                    />
                    <span className="text-xs text-[#555045] leading-snug">
                      I accept the <a href="#terms" className="text-[#122B52] font-bold underline">Wi-Fi Terms of Use</a> and acknowledge the Privacy Policy.
                    </span>
                  </label>
                  {errors.terms && <p className="text-[11px] text-[#122B52] font-semibold">{errors.terms}</p>}
                </div>

                {/* DYNAMIC ACTION BUTTON */}
                <button
                  type="submit"
                  disabled={activeTab === 'new' && !!existingUserFound}
                  className={`w-full py-3.5 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors shadow-md flex items-center justify-center gap-2 ${
                    activeTab === 'new' && !!existingUserFound
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-[#122B52] hover:bg-[#0B2038] cursor-pointer'
                  }`}
                >
                  <Wifi className="w-4 h-4" />
                  <span>{activeTab === 'returning' ? 'RESUME WI-FI SESSION →' : 'CONNECT TO WI-FI →'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
