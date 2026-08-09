import React, { useState } from 'react';
import { CustomerInfo, ScreenStep } from './types';
import { GuestAccessForm } from './components/GuestAccessForm';
import { ScratchCard } from './components/ScratchCard';
import { InStoreDiscovery } from './components/InStoreDiscovery';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenStep>('login');
  const [customer, setCustomer] = useState<CustomerInfo>({
    fullName: '',
    phone: '',
    email: '',
    consentOffers: true,
    termsAccepted: true,
    connectedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    sessionVoucherCode: 'FESTIVE20',
    sessionVoucherDiscount: '20% OFF',
    sessionVoucherDesc: 'Flat 20% off on all Ethnic & Designer Collections',
    sessionVoucherMinOrder: '₹4,999'
  });

  const broadcastTelemetry = (type: string, payload: any) => {
    const eventData = { type, payload, timestamp: Date.now() };
    try {
      localStorage.setItem('ss_wifi_telemetry_event', JSON.stringify(eventData));
    } catch (e) {}
    try {
      const channel = new BroadcastChannel('ss_wifi_channel');
      channel.postMessage(eventData);
    } catch (e) {}
  };

  // 1. New Guest Success -> advances to Scratch Card
  const handleGuestLoginSuccess = (customerData: CustomerInfo) => {
    try {
      sessionStorage.removeItem('ss_portal_reviewed');
      sessionStorage.removeItem('ss_portal_pulse_checked');
    } catch (e) {}

    setCustomer(customerData);
    setCurrentScreen('scratch');

    broadcastTelemetry('NEW_CUSTOMER_LOGIN', {
      fullName: customerData.fullName,
      phone: customerData.phone,
      email: customerData.email,
      sessionVoucherCode: customerData.sessionVoucherCode,
      connectedAt: customerData.connectedAt || new Date().toLocaleTimeString(),
      storeLocation: 'Mumbai Flagship (Malad)'
    });
  };

  // 2. Returning Member Success -> advances DIRECTLY to In-Store Companion (No re-scratching!)
  const handleReturningUserLoginSuccess = (customerData: CustomerInfo) => {
    try {
      sessionStorage.removeItem('ss_portal_reviewed');
      sessionStorage.removeItem('ss_portal_pulse_checked');
    } catch (e) {}

    setCustomer(customerData);
    setCurrentScreen('discovery');

    broadcastTelemetry('RETURNING_CUSTOMER_LOGIN', {
      fullName: customerData.fullName,
      phone: customerData.phone,
      email: customerData.email,
      sessionVoucherCode: customerData.sessionVoucherCode,
      connectedAt: customerData.connectedAt || new Date().toLocaleTimeString(),
      storeLocation: 'Mumbai Flagship (Malad)'
    });
  };

  const handleExploreNewArrivals = () => {
    setCurrentScreen('discovery');

    broadcastTelemetry('VOUCHER_REDEMPTION', {
      code: customer.sessionVoucherCode,
      discount: customer.sessionVoucherDiscount || '20% OFF',
      customerName: customer.fullName
    });
  };

  const handleLogout = () => {
    try {
      sessionStorage.removeItem('ss_portal_reviewed');
      sessionStorage.removeItem('ss_portal_pulse_checked');
    } catch (e) {}
    setCurrentScreen('login');
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#1a1a1a] flex flex-col font-sans">
      <div className="w-full min-h-screen flex-1 flex flex-col">
        {currentScreen === 'login' && (
          <GuestAccessForm
            onSuccessNewUser={handleGuestLoginSuccess}
            onSuccessReturningUser={handleReturningUserLoginSuccess}
          />
        )}

        {currentScreen === 'scratch' && (
          <div className="relative min-h-screen">
            <GuestAccessForm
              onSuccessNewUser={() => {}}
              onSuccessReturningUser={() => {}}
            />
            <ScratchCard
              customer={customer}
              onExplore={handleExploreNewArrivals}
              onUpdateCustomerVoucher={(updated) => setCustomer(updated)}
            />
          </div>
        )}

        {currentScreen === 'discovery' && (
          <InStoreDiscovery
            customer={customer}
            onViewVoucher={() => setCurrentScreen('scratch')}
            onLogout={handleLogout}
          />
        )}
      </div>
    </div>
  );
}
