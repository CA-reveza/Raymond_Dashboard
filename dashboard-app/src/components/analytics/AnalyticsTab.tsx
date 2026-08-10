import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import { Card } from '../common/Card';
import { REGIONAL_PERFORMANCE_DATA, DAILY_REVENUE_CHART_DATA } from '../../data/mockData';

export const AnalyticsTab: React.FC = () => {
  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const channelData = [
    { channel: 'In-Store POS Terminals', sales: 28450000, share: '58%' },
    { channel: 'Mobile App Direct', sales: 12100000, share: '25%' },
    { channel: 'MyRaymond.com Web', sales: 8372000, share: '17%' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Executive Retail Analytics & Intelligence
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Geographic sales density, omnichannel conversions, and customer footfall telemetry
        </p>
      </div>

      {/* Regional Performance Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Regional Retail Store Sales Revenue
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Comparing flagship metro hubs across India (July 2026)
            </p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={REGIONAL_PERFORMANCE_DATA}
                margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="region"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#64748B', fontSize: 12 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#64748B', fontSize: 11 }}
                  tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '12px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                  }}
                  formatter={(value: any) => [formatINR(Number(value)), 'Revenue']}
                />
                <Bar
                  dataKey="sales"
                  name="Total Sales"
                  fill="#122B52"
                  radius={[8, 8, 0, 0]}
                  barSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Omnichannel Channel Mix */}
        <Card>
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Channel Contribution
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Split by shopping touchpoint</p>
          </div>

          <div className="space-y-4">
            {channelData.map((ch) => (
              <div
                key={ch.channel}
                className="p-3.5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl space-y-2"
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-900 dark:text-slate-100">{ch.channel}</span>
                  <span className="font-extrabold text-[#122B52]">{ch.share}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-[#122B52] h-2 rounded-full"
                    style={{ width: ch.share }}
                  />
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 text-right font-mono">
                  {formatINR(ch.sales)}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Footfall Trend Line Chart */}
      <Card>
        <div className="mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Daily Store Footfall vs Sales Conversion Ratio
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Physical footfall sensors correlated with completed POS receipts
          </p>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={DAILY_REVENUE_CHART_DATA} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderRadius: '12px',
                  color: '#fff',
                  border: 'none',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line
                type="monotone"
                dataKey="footfall"
                name="Store Visitors (Footfall)"
                stroke="#2563EB"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};
