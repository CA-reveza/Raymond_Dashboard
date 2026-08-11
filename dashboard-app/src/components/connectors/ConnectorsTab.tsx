import React, { useEffect, useState } from 'react';
import { ShoppingBag, RefreshCw, Zap, AlertCircle } from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { apiUrl } from '../../config/api';

interface MarketplaceActivitySource {
  key: string;
  label: string;
  rows: any[];
  error: string | null;
}

const statusVariant = (status: string): 'success' | 'warning' | 'danger' | 'neutral' => {
  const s = (status || '').toLowerCase();
  if (s === 'confirmed') return 'success';
  if (s === 'pending') return 'warning';
  if (s === 'cancelled' || s === 'failed') return 'danger';
  return 'neutral';
};

const fmtMoney = (n: any) => (typeof n === 'number' ? `₹${n.toLocaleString('en-IN')}` : '-');
const fmtDate = (d: any) => (d ? new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '-');

const SectionHeader: React.FC<{ icon: React.ReactNode; title: string; count: number; tint: string }> = ({
  icon,
  title,
  count,
  tint,
}) => (
  <div className="flex items-center gap-3 mb-4">
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${tint}`}>{icon}</div>
    <div>
      <h3 className="font-bold text-gray-900 dark:text-slate-100 text-sm">{title}</h3>
      <p className="text-xs text-gray-500 dark:text-slate-400">{count} recent {count === 1 ? 'record' : 'records'} via Marketplace Connector</p>
    </div>
  </div>
);

const EmptyState: React.FC<{ error: string | null }> = ({ error }) => (
  <div className="text-center py-8 text-sm text-gray-400">
    {error ? (
      <span className="inline-flex items-center gap-1.5 text-amber-600">
        <AlertCircle className="w-4 h-4" /> {error}
      </span>
    ) : (
      <span className="dark:text-slate-500">No activity yet.</span>
    )}
  </div>
);

const RetailOrdersTable: React.FC<{ source: MarketplaceActivitySource }> = ({ source }) => (
  <Card>
    <SectionHeader icon={<ShoppingBag className="w-4 h-4" />} title="Retail Orders" count={source.rows.length} tint="bg-sky-50 text-sky-600" />
    {!source.rows.length ? (
      <EmptyState error={source.error} />
    ) : (
      <div className="overflow-x-auto -mx-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-gray-400 dark:text-slate-500 border-b border-gray-100 dark:border-slate-700">
              <th className="px-6 py-2 font-semibold">Customer</th>
              <th className="px-6 py-2 font-semibold">Store</th>
              <th className="px-6 py-2 font-semibold">Items</th>
              <th className="px-6 py-2 font-semibold">Amount</th>
              <th className="px-6 py-2 font-semibold">Status</th>
              <th className="px-6 py-2 font-semibold">Placed</th>
            </tr>
          </thead>
          <tbody>
            {source.rows.map((r) => (
              <tr key={r.id} className="border-b border-gray-50 dark:border-slate-800 last:border-0 hover:bg-gray-50/60 dark:hover:bg-slate-800/60">
                <td className="px-6 py-3">
                  <div className="font-semibold text-gray-900 dark:text-slate-100">{r.customer_name}</div>
                  <div className="text-xs text-gray-400 dark:text-slate-500">{r.customer_email}</div>
                </td>
                <td className="px-6 py-3 text-gray-700 dark:text-slate-300">{r.store}</td>
                <td className="px-6 py-3 text-gray-500 dark:text-slate-400 text-xs max-w-[220px] truncate">{r.items}</td>
                <td className="px-6 py-3 font-semibold text-gray-900 dark:text-slate-100">{fmtMoney(r.amount)}</td>
                <td className="px-6 py-3"><Badge variant={statusVariant(r.status)} size="sm">{r.status}</Badge></td>
                <td className="px-6 py-3 text-gray-400 dark:text-slate-500 text-xs">{fmtDate(r.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </Card>
);

export const ConnectorsTab: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(true);
  const [activity, setActivity] = useState<MarketplaceActivitySource[]>([]);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/marketplace/activity/all'));
      const data = await res.json();
      if (data?.success) {
        setActivity(data.activity || []);
        setReady(Boolean(data.marketplace_ready));
        setLastRefreshed(new Date());
      }
    } catch (e) {
      // Network hiccup — leave prior data on screen, user can hit Refresh.
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  const retailSource = activity.find((a) => a.key === 'retail_orders') || { key: '', label: '', rows: [], error: null };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-violet-500" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">Connectors</h2>
          </div>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Retail orders pulled from the Axionik Marketplace connector, across all customers.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastRefreshed && (
            <span className="text-xs text-gray-400 dark:text-slate-500">Updated {lastRefreshed.toLocaleTimeString('en-IN')}</span>
          )}
          <button
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {!ready && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 text-amber-700 text-sm px-4 py-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          Marketplace connector isn't configured on the server yet — set MARKETPLACE_SUPABASE_URL and
          MARKETPLACE_SUPABASE_KEY on Render to see live data here.
        </div>
      )}

      <RetailOrdersTable source={retailSource} />
    </div>
  );
};
