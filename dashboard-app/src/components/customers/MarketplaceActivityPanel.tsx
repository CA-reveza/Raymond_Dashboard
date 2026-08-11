import React, { useEffect, useState } from 'react';
import { Film, UtensilsCrossed, ShoppingBag, Loader2, AlertCircle } from 'lucide-react';
import { apiUrl } from '../../config/api';

interface ActivitySource {
  key: string;
  label: string;
  rows: Record<string, any>[];
  error: string | null;
}

interface MarketplaceActivityResponse {
  success: boolean;
  marketplace_ready: boolean;
  email: string;
  activity: ActivitySource[];
}

const ICONS: Record<string, React.ReactNode> = {
  movie_bookings: <Film className="w-3.5 h-3.5" />,
  restaurant_reservations: <UtensilsCrossed className="w-3.5 h-3.5" />,
  retail_orders: <ShoppingBag className="w-3.5 h-3.5" />,
};

// Renders a row's fields generically (label: value pairs) since we don't
// assume exact column names from the Marketplace schema.
function ActivityRow({ row }: { row: Record<string, any> }) {
  const entries = Object.entries(row).filter(([k]) => k !== 'email');
  return (
    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px] grid grid-cols-2 gap-x-3 gap-y-1">
      {entries.map(([k, v]) => (
        <div key={k} className="flex justify-between gap-2 truncate">
          <span className="text-slate-400 truncate">{k}</span>
          <span className="text-slate-800 font-medium truncate">
            {typeof v === 'object' && v !== null ? JSON.stringify(v) : String(v ?? '—')}
          </span>
        </div>
      ))}
    </div>
  );
}

export const MarketplaceActivityPanel: React.FC<{ email: string }> = ({ email }) => {
  const [data, setData] = useState<MarketplaceActivityResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!email) return;
    setLoading(true);
    fetch(apiUrl(`/api/marketplace/${encodeURIComponent(email)}`))
      .then((res) => res.json())
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [email]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-400 p-4">
        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading Marketplace activity…
      </div>
    );
  }

  if (!data || !data.success) {
    return (
      <div className="flex items-center gap-2 text-xs text-amber-600 p-3 bg-amber-50 rounded-lg border border-amber-200">
        <AlertCircle className="w-3.5 h-3.5" /> Couldn't load Marketplace activity.
      </div>
    );
  }

  if (!data.marketplace_ready) {
    return (
      <div className="flex items-center gap-2 text-xs text-amber-600 p-3 bg-amber-50 rounded-lg border border-amber-200">
        <AlertCircle className="w-3.5 h-3.5" />
        Marketplace connection isn't configured yet (MARKETPLACE_SUPABASE_URL / KEY missing on the server).
      </div>
    );
  }

  const totalRows = data.activity.reduce((sum, s) => sum + s.rows.length, 0);

  return (
    <div className="space-y-3">
      {totalRows === 0 && !data.activity.some((s) => s.error) && (
        <div className="text-xs text-slate-400 p-3 bg-slate-50 rounded-lg border border-slate-200">
          No Marketplace bookings, reservations, or orders found for this email yet.
        </div>
      )}

      {data.activity.map((source) => (
        <div key={source.key}>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 uppercase mb-1.5">
            {ICONS[source.key]}
            {source.label}
            {source.rows.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-[#122B52] text-white rounded-full text-[10px] normal-case font-semibold">
                {source.rows.length}
              </span>
            )}
          </div>

          {source.error && (
            <div className="text-[11px] text-amber-600 p-2 bg-amber-50 rounded-lg border border-amber-200 mb-2">
              Couldn't read this table ({source.error}). Table/column names may need adjusting in
              server/src/routes/marketplace.js.
            </div>
          )}

          {source.rows.length > 0 && (
            <div className="space-y-1.5">
              {source.rows.map((row, i) => (
                <ActivityRow key={row.id || i} row={row} />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
