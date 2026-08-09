/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TabType, Order, OrderStatus, Customer, InventoryItem, Coupon, ReturnRecord, CouponRedemption } from './types';
import { apiUrl } from './config/api';
import {
  INITIAL_ORDERS,
  INITIAL_CUSTOMERS,
  INITIAL_INVENTORY,
  INITIAL_COUPONS,
  INITIAL_RETURNS,
  STORE_LOCATIONS,
} from './data/mockData';
import { Sidebar } from './components/layout/Sidebar';
import { Header, AppNotification } from './components/layout/Header';
import { NewCustomerToastContainer, CustomerToast } from './components/common/NewCustomerToast';
import { playNewCustomerChime } from './utils/notificationSound';
import { OverviewTab } from './components/dashboard/OverviewTab';
import { OrdersTab } from './components/orders/OrdersTab';
import { CustomersTab } from './components/customers/CustomersTab';
import { InventoryTab } from './components/inventory/InventoryTab';
import { ReturnProductTab } from './components/returns/ReturnProductTab';
import { CouponsTab } from './components/coupons/CouponsTab';
import { CustomerFeedbackTab } from './components/feedback/CustomerFeedbackTab';
import { AnalyticsTab } from './components/analytics/AnalyticsTab';
import { ReportsTab } from './components/reports/ReportsTab';
import { HelpTab } from './components/help/HelpTab';
import { SettingsTab } from './components/settings/SettingsTab';
import { CommandPalette } from './components/modals/CommandPalette';
import { DownloadReportModal } from './components/modals/DownloadReportModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [selectedStore, setSelectedStore] = useState<string>(STORE_LOCATIONS[1]);
  const [dateRange, setDateRange] = useState<string>('Today (Jul 27, 2026)');

  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);

  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'seed-1',
      title: 'Low Stock Alert',
      desc: 'Rolex Submariner Date Watch down to 1 unit in Malad vault.',
      time: '5 mins ago',
      unread: true,
    },
    {
      id: 'seed-2',
      title: 'Low Stock Alert',
      desc: 'Prada Monolith Leather Boots down to 2 units in stock.',
      time: '12 mins ago',
      unread: true,
    },
    {
      id: 'seed-3',
      title: 'High-Value Order Received',
      desc: 'Order #SS-ORD-98421 placed for ₹1,85,000 by Black Member.',
      time: '35 mins ago',
      unread: true,
    },
    {
      id: 'seed-4',
      title: 'Out of Stock Warning',
      desc: 'Louis Vuitton Neverfull MM Damier Tote is currently Out of Stock.',
      time: '1 hour ago',
      unread: false,
    },
    {
      id: 'seed-5',
      title: 'Monthly Tax Audit Ready',
      desc: 'GST Sales summary report for July 2026 is ready for download.',
      time: '2 hours ago',
      unread: false,
    },
  ]);
  const [customerToasts, setCustomerToasts] = useState<CustomerToast[]>([]);
  const knownCustomerIdsRef = React.useRef<Set<string> | null>(null);

  const dismissToast = (id: string) => {
    setCustomerToasts((prev) => prev.filter((t) => t.id !== id));
  };
  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };
  const markOneNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));
  };

  
  // Safe Live API Sync Hook
  // Safe Live API Sync Hook
  useEffect(() => {
    let isMounted = true;
    const fetchLiveData = async () => {
      try {
        const res = await fetch(apiUrl("/api/customers"));
        if (res.ok) {
          const data = await res.json();
          if (data && data.success && Array.isArray(data.customers) && isMounted) {
            const apiCusts: Customer[] = data.customers.map((c: any) => {
              const rawSpend = c.totalSpent ?? c.total_spend ?? c.lifetimeSpend;
              const rawPoints = c.loyaltyPoints ?? c.points;
              const checkedInAt = c.last_visit || c.created_at || new Date().toISOString();
              return {
                id: c.id || c.user_id || c.customer_id || `FC-${Math.floor(Math.random() * 90000)}`,
                name: c.name || c.username || "First Citizen Member",
                email: c.email || "",
                phone: c.phone || c.phone_number || "",
                loyaltyTier: (c.loyaltyTier || c.vip_tier || "Black First Citizen") as LoyaltyTier,
                loyaltyPoints: typeof rawPoints === 'number' ? rawPoints : Number(rawPoints || 1250),
                totalSpent: typeof rawSpend === 'number' ? rawSpend : Number(rawSpend || 125000),
                totalOrders: Number(c.totalOrders || c.ordersCount || 10),
                lastPurchaseDate: "2026-08-02",
                preferredCategory: c.preferredCategory || "Luxury Watches & Accessories",
                joinedDate: "2026-01-15",
                avatar: c.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
                storeLocation: c.storeLocation || "Mumbai - Malad West Flagship",
                checkedInAt,
              };
            });

            // Detect genuinely new arrivals (skip the very first fetch — that's
            // just populating the dashboard, not "new" check-ins) and surface
            // a popup + notification-bell entry for each one.
            const currentIds = new Set(apiCusts.map((c) => c.id));
            const isFirstFetch = knownCustomerIdsRef.current === null;
            if (!isFirstFetch) {
              const newlyArrived = apiCusts.filter((c) => !knownCustomerIdsRef.current!.has(c.id));
              if (newlyArrived.length) {
                setCustomerToasts((prev) => [
                  ...newlyArrived.map((c) => ({ id: c.id, name: c.name, storeLocation: c.storeLocation })),
                  ...prev,
                ]);
                playNewCustomerChime();
              }
            }
            knownCustomerIdsRef.current = currentIds;

            setCustomers(prev => {
              if (!Array.isArray(prev)) return prev;
              const merged = [...prev];
              apiCusts.forEach(ac => {
                if (!ac) return;
                const existingIdx = merged.findIndex(m => 
                  (m.email && ac.email && m.email.trim() !== "" && m.email.toLowerCase() === ac.email.toLowerCase()) ||
                  (m.phone && ac.phone && m.phone.trim() !== "" && m.phone === ac.phone) ||
                  (m.name && ac.name && m.name.trim().toLowerCase() === ac.name.trim().toLowerCase())
                );
                if (existingIdx !== -1) {
                  merged[existingIdx] = { ...merged[existingIdx], ...ac };
                } else {
                  merged.unshift(ac);
                }
              });
              // Newest check-in always shows as customer #1, regardless of
              // where the merge logic above placed it.
              merged.sort((a, b) => {
                const at = a.checkedInAt ? new Date(a.checkedInAt).getTime() : 0;
                const bt = b.checkedInAt ? new Date(b.checkedInAt).getTime() : 0;
                return bt - at;
              });
              return merged;
            });
          }
        }
      } catch (e) {}

      try {
        const resR = await fetch(apiUrl("/api/redemptions"));
        if (resR.ok) {
          const dataR = await resR.json();
          if (dataR && dataR.success && Array.isArray(dataR.redemptions) && isMounted) {
            const redemptionsList: any[] = dataR.redemptions;
            setCoupons(prevCoupons => {
              if (!Array.isArray(prevCoupons)) return prevCoupons;
              return prevCoupons.map(cpn => {
                if (!cpn || !cpn.code) return cpn;
                const cleanCpnCode = cpn.code.replace(/\s+/g, '').toUpperCase();
                const matched = redemptionsList.filter(r => {
                  if (!r || !r.couponCode) return false;
                  return r.couponCode.replace(/\s+/g, '').toUpperCase() === cleanCpnCode;
                });
                if (matched.length > 0) {
                  const formattedReds: CouponRedemption[] = matched.map(r => ({
                    id: r.id || `RED-${Math.floor(Math.random() * 90000)}`,
                    couponId: cpn.id,
                    couponCode: cpn.code,
                    customerName: r.customerName || r.name || "Wi-Fi Shopper",
                    customerEmail: r.customerEmail || r.email || "",
                    customerPhone: r.customerPhone || r.phone || "",
                    loyaltyTier: r.loyaltyTier || "Black First Citizen",
                    orderId: r.orderId || `SS-ORD-${Math.floor(90000 + Math.random() * 9999)}`,
                    orderTotal: Number(r.orderTotal || cpn.minOrderValue + 500),
                    discountSaved: Number(r.discountSaved || cpn.discountValue),
                    redeemedAt: r.redeemedAt || "Today",
                    storeLocation: r.storeLocation || "Mumbai - Malad West Flagship"
                  }));

                  const existingReds = cpn.redemptions || [];
                  const mergedReds = [
                    ...formattedReds.filter(fr => !existingReds.some(er => 
                      (er.id && fr.id && er.id === fr.id) ||
                      (er.orderId && fr.orderId && er.orderId === fr.orderId) ||
                      (er.customerName && fr.customerName && er.customerName.trim().toLowerCase() === fr.customerName.trim().toLowerCase())
                    )),
                    ...existingReds
                  ];
                  return {
                    ...cpn,
                    usageCount: Math.max(cpn.usageCount, mergedReds.length),
                    redemptions: mergedReds
                  };
                }
                return cpn;
              });
            });
          }
        }
      } catch (e) {}

      try {
        const resC = await fetch(apiUrl("/api/coupons"));
        if (resC.ok) {
          const dataC = await resC.json();
          if (dataC && dataC.success && Array.isArray(dataC.coupons) && isMounted) {
            const serverCoupons = dataC.coupons;
            setCoupons(prevCoupons => {
              if (!Array.isArray(prevCoupons)) return prevCoupons;
              const merged = [...prevCoupons];
              serverCoupons.forEach((sc: any) => {
                if (!sc || !sc.code) return;
                const cleanCode = sc.code.toString().replace(/\s+/g, '').toUpperCase();
                const idx = merged.findIndex(pc => pc && pc.code && pc.code.toString().replace(/\s+/g, '').toUpperCase() === cleanCode);
                // Merge server redemptions with any already in local state (dedup by id / orderId / customerName)
                const serverReds: CouponRedemption[] = (sc.redemptions || []).map((r: any) => ({
                  id: r.id || `RED-${Math.floor(Math.random() * 90000)}`,
                  couponId: sc.id || '',
                  couponCode: sc.code.toUpperCase(),
                  customerName: r.customerName || 'Wi-Fi Shopper',
                  customerEmail: r.customerEmail || '',
                  customerPhone: r.customerPhone || '',
                  loyaltyTier: r.loyaltyTier || 'Gold',
                  orderId: r.orderId || `SS-ORD-${Math.floor(90000 + Math.random() * 9999)}`,
                  orderTotal: Number(r.orderTotal || 0),
                  discountSaved: Number(r.discountSaved || 0),
                  redeemedAt: r.redeemedAt || 'Today',
                  storeLocation: r.storeLocation || 'Mumbai - Malad West Flagship'
                }));
                const existingReds = idx !== -1 ? (merged[idx].redemptions || []) : [];
                const mergedReds = [
                  ...serverReds.filter(sr => !existingReds.some(er =>
                    (er.id && sr.id && er.id === sr.id) ||
                    (er.orderId && sr.orderId && er.orderId === sr.orderId) ||
                    (er.customerName && sr.customerName && er.customerName.trim().toLowerCase() === sr.customerName.trim().toLowerCase())
                  )),
                  ...existingReds
                ];
                const formatted = {
                  id: sc.id || `CPN-${Date.now()}`,
                  code: sc.code.toUpperCase(),
                  description: sc.description || 'Promotional Offer',
                  discountType: sc.discountType || 'Percentage',
                  discountValue: Number(sc.discountValue) || 10,
                  minOrderValue: Number(sc.minOrderValue) || 1999,
                  usageCount: Math.max(sc.usageCount || 0, idx !== -1 ? merged[idx].usageCount : 0, mergedReds.length),
                  maxUsage: sc.maxUsage || 1000,
                  status: sc.status || 'Active',
                  startDate: sc.startDate || '2026-07-01',
                  endDate: sc.endDate || '2026-12-31',
                  applicableCategory: sc.applicableCategory || 'Site-wide',
                  redemptions: mergedReds
                };
                if (idx !== -1) {
                  merged[idx] = { ...merged[idx], ...formatted, redemptions: mergedReds };
                } else {
                  merged.push(formatted);
                }
              });
              return merged;
            });
          }
        }
      } catch (e) {}
    };

    fetchLiveData();
    const interval = setInterval(fetchLiveData, 10000);

    // Browsers throttle/pause setInterval in background tabs, so a check-in
    // that happens while the dashboard tab isn't focused can sit undetected
    // for a while. Force an immediate catch-up fetch the moment the tab
    // becomes visible again — this is likely why the popup felt inconsistent.
    const handleVisibility = () => {
      if (document.visibilityState === "visible") fetchLiveData();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      isMounted = false;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [returns, setReturns] = useState<ReturnRecord[]>(INITIAL_RETURNS);

  

  // Modals state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<InventoryItem | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  const getStoreMetrics = (store: string) => {
    switch (store) {
      case 'Mumbai - Malad West Flagship':
        return { sales: 1428900, orders: 3840, returns: 240, custCount: 14 };
      case 'Bengaluru - MG Road Metro':
        return { sales: 1145600, orders: 3120, returns: 195, custCount: 11 };
      case 'Delhi - Select CITYWALK Saket':
        return { sales: 1289200, orders: 3450, returns: 210, custCount: 12 };
      case 'Kolkata - South City Mall':
        return { sales: 568400, orders: 1480, returns: 110, custCount: 8 };
      case 'Hyderabad - Inorbit Mall Hitec City':
        return { sales: 460350, orders: 1210, returns: 111, custCount: 6 };
      case 'Online Store (eCom Direct)':
        return { sales: 892100, orders: 2420, returns: 145, custCount: 9 };
      default:
        // 'All Stores (Nationwide)'
        return { sales: 4892450, orders: 13100, returns: 866, custCount: customers.length };
    }
  };

  const storeBase = getStoreMetrics(selectedStore);
  const approvedReturnsRefunds = returns
    .filter((r) => r.status === 'Approved')
    .reduce((sum, r) => sum + r.refundAmount, 0);

  const totalSales = Math.max(0, storeBase.sales - approvedReturnsRefunds);
  const totalOrders = storeBase.orders;
  const totalProducts = inventory.reduce((sum, item) => sum + item.stock, 0);
  const totalCustomers = storeBase.custCount;
  const approvedReturnsCount = returns.filter((r) => r.status === 'Approved').length;
  const totalReturns = storeBase.returns + approvedReturnsCount;

  const dashboardMetrics = {
    totalSales,
    totalOrders,
    totalProducts,
    totalCustomers,
    totalReturns,
  };

  const handleViewOrderDetails = (order: Order) => {
    setActiveTab('orders');
    setSelectedOrder(order);
    setIsOrderModalOpen(true);
  };

  const handleSelectCustomerFromSearch = (customer: Customer) => {
    setActiveTab('customers');
    setSelectedCustomer(customer);
  };

  const handleSelectInventoryFromSearch = (item: InventoryItem) => {
    setActiveTab('inventory');
    setSelectedInventoryItem(item);
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const handleUpdateStock = (itemId: string, newStock: number) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          let status: 'In Stock' | 'Low Stock' | 'Out of Stock' = 'In Stock';
          if (newStock === 0) status = 'Out of Stock';
          else if (newStock <= item.minThreshold) status = 'Low Stock';
          return { ...item, stock: newStock, status };
        }
        return item;
      })
    );
  };

  const handleCreateCoupon = (newCoupon: Coupon) => {
    setCoupons((prev) => [newCoupon, ...prev]);
  };

  const handleEnrollCustomer = (newCustomer: Customer) => {
    setCustomers((prev) => [newCustomer, ...prev]);
  };

  const handleProcessReturn = (newReturnData: Omit<ReturnRecord, 'id'>) => {
    const newRecord: ReturnRecord = {
      ...newReturnData,
      id: `RET-2026-${String(returns.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
    };

    setReturns((prev) => [newRecord, ...prev]);

    if (newReturnData.status === 'Approved' && newReturnData.restockInventory) {
      setInventory((prev) =>
        prev.map((item) => {
          const nameMatch = item.name.toLowerCase() === newReturnData.productName.toLowerCase();
          const skuMatch = newReturnData.sku && item.sku.toLowerCase() === newReturnData.sku.toLowerCase();

          if (nameMatch || skuMatch) {
            const updatedStock = item.stock + newReturnData.quantity;
            let status: 'In Stock' | 'Low Stock' | 'Out of Stock' = 'In Stock';
            if (updatedStock === 0) status = 'Out of Stock';
            else if (updatedStock <= item.minThreshold) status = 'Low Stock';
            return { ...item, stock: updatedStock, status };
          }
          return item;
        })
      );
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Executive Retail Dashboard';
      case 'orders':
        return 'Omnichannel Orders';
      case 'customers':
        return 'First Citizen CRM';
      case 'inventory':
        return 'Inventory Telemetry';
      case 'return_product':
        return 'Return Product Module';
      case 'coupons':
        return 'Promotions & Coupons';
      case 'analytics':
        return 'Analytics & Intelligence';
      case 'reports':
        return 'Financial Reports';
      case 'help':
        return 'Store Ops Help Desk';
      case 'settings':
        return 'Store Settings';
      default:
        return 'Dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-gray-900 font-sans selection:bg-[#2D74B2]/20 selection:text-[#2D74B2]">
      <NewCustomerToastContainer toasts={customerToasts} onDismiss={dismissToast} />
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedStore={selectedStore}
        setSelectedStore={setSelectedStore}
        isOpenMobile={isOpenMobile}
        setIsOpenMobile={setIsOpenMobile}
      />

      <div className="lg:pl-64 flex flex-col min-h-screen transition-all duration-300">
        <Header
          title={getPageTitle()}
          onOpenMobileSidebar={() => setIsOpenMobile(true)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
          dateRange={dateRange}
          setDateRange={setDateRange}
          notifications={notifications}
          onMarkAllRead={markAllNotificationsRead}
          onMarkOneRead={markOneNotificationRead}
        />

        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          {(() => {
            const filteredOrders = selectedStore === 'All Stores (Nationwide)'
              ? orders
              : orders.filter((o) => o.storeLocation === selectedStore || (selectedStore.includes('Mumbai') && (o.customerName === 'Ananya Deshmukh' || o.customerName === 'ricky' || o.customerName === 'JAGAN' || o.customerName === 'Mahima')));

            const filteredCustomers = selectedStore === 'All Stores (Nationwide)'
              ? customers
              : customers.filter((c) => (c as any).storeLocation === selectedStore || (! (c as any).storeLocation && selectedStore.includes('Mumbai')));

            return (
              <>
                {activeTab === 'dashboard' && (
                  <OverviewTab
                    orders={filteredOrders}
                    onNavigateTab={setActiveTab}
                    onViewOrderDetails={handleViewOrderDetails}
                    selectedStore={selectedStore}
                    metrics={dashboardMetrics}
                  />
                )}

                {activeTab === 'orders' && (
                  <OrdersTab
                    orders={filteredOrders}
                    onViewOrderDetails={handleViewOrderDetails}
                    onUpdateOrderStatus={handleUpdateOrderStatus}
                    selectedOrderFromSearch={selectedOrder}
                  />
                )}

                {activeTab === 'customers' && (
                  <CustomersTab
                    customers={filteredCustomers}
                    onEnrollCustomer={handleEnrollCustomer}
                    selectedCustomerFromSearch={selectedCustomer}
                  />
                )}

                {activeTab === 'inventory' && (
                  <InventoryTab
                    inventory={inventory}
                    onUpdateStock={handleUpdateStock}
                    selectedItemFromSearch={selectedInventoryItem}
                    selectedStore={selectedStore}
                  />
                )}
              </>
            );
          })()}

          {activeTab === 'return_product' && (
            <ReturnProductTab
              returns={returns}
              orders={orders}
              inventory={inventory}
              onProcessReturn={handleProcessReturn}
            />
          )}

          {activeTab === 'coupons' && (
            <CouponsTab coupons={coupons} onCreateCoupon={handleCreateCoupon} />
          )}

          {activeTab === 'feedback' && <CustomerFeedbackTab />}

          {activeTab === 'analytics' && <AnalyticsTab />}

          {activeTab === 'reports' && <ReportsTab />}

          {activeTab === 'help' && <HelpTab />}

          {activeTab === 'settings' && (
            <SettingsTab
              selectedStore={selectedStore}
              setSelectedStore={setSelectedStore}
            />
          )}
        </main>
      </div>

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        orders={orders}
        customers={customers}
        inventory={inventory}
        onSelectTab={setActiveTab}
        onSelectOrder={handleViewOrderDetails}
        onSelectCustomer={handleSelectCustomerFromSearch}
        onSelectInventory={handleSelectInventoryFromSearch}
      />

      <DownloadReportModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
      />
    </div>
  );
}
