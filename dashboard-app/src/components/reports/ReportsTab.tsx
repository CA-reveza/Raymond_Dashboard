import React, { useState } from 'react';
import {
  FileText,
  Download,
  Clock,
  CheckCircle2,
  Search,
  Filter,
  Users,
  Tag,
  Star,
  FileSpreadsheet,
  Eye,
  BarChart3,
  Sparkles,
  RotateCcw,
  Check,
} from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { INITIAL_REPORTS } from '../../data/mockData';
import { ReportItem } from '../../types';
import { Modal } from '../common/Modal';
import { downloadReportFile } from '../../utils/exportAndPrint';

export const ReportsTab: React.FC = () => {
  const [reports] = useState<ReportItem[]>(INITIAL_REPORTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFormat, setSelectedFormat] = useState<string>('All');
  const [previewReport, setPreviewReport] = useState<ReportItem | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const categories = [
    'All',
    'Customer Details',
    'Coupon Analytics',
    'Customer Reviews',
    'Tax GST',
    'Sales',
    'Inventory',
    'Returns Audit',
  ];

  const filteredReports = reports.filter((rep) => {
    const matchesCategory =
      selectedCategory === 'All' || rep.category === selectedCategory;
    const matchesFormat =
      selectedFormat === 'All' || rep.fileFormat === selectedFormat;
    const matchesSearch =
      rep.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rep.description && rep.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesFormat && matchesSearch;
  });

  const handleDownload = (rep: ReportItem) => {
    setDownloadingId(rep.id);
    setTimeout(() => {
      setDownloadingId(null);
      downloadReportFile(rep.title, rep.fileFormat, 'Raymonds Nationwide');
    }, 400);
  };

  const getCategoryIcon = (category: ReportItem['category']) => {
    switch (category) {
      case 'Customer Details':
        return <Users className="w-5 h-5 text-blue-600" />;
      case 'Coupon Analytics':
        return <Tag className="w-5 h-5 text-emerald-600" />;
      case 'Customer Reviews':
        return <Star className="w-5 h-5 text-amber-500" />;
      case 'Returns Audit':
        return <RotateCcw className="w-5 h-5 text-pink-600" />;
      case 'Tax GST':
        return <FileSpreadsheet className="w-5 h-5 text-indigo-600" />;
      default:
        return <FileText className="w-5 h-5 text-[#2D74B2]" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & Quick Stats */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-[18px] p-5 text-white shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#2D74B2] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Enterprise Hub
            </span>
            <span className="text-xs text-gray-400 font-mono">Real-time Telemetry Exports</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Reports & Operational Intelligence Center
          </h2>
          <p className="text-xs text-gray-300 mt-1 max-w-2xl">
            Access certified GST compliance ledgers, customer profiles & VIP cohort rosters, coupon performance analytics, and verified product review audits.
          </p>
        </div>

        {/* 3 Quick Summary Indicators */}
        <div className="grid grid-cols-3 gap-3 border-t lg:border-t-0 lg:border-l border-gray-700/60 pt-4 lg:pt-0 lg:pl-6">
          <div className="text-center">
            <div className="text-lg font-bold text-white font-mono">{reports.length}</div>
            <div className="text-[10px] text-gray-400 uppercase font-medium">Available Reports</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-emerald-400 font-mono">100%</div>
            <div className="text-[10px] text-gray-400 uppercase font-medium">Audit Certified</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-amber-400 font-mono">Auto</div>
            <div className="text-[10px] text-gray-400 uppercase font-medium">Sync Schedule</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
            {categories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    active
                      ? 'bg-[#2D74B2] text-white shadow-2xs'
                      : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200/80 hover:text-gray-900'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Search & Format Filter */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex-1 md:w-64">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search reports by keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#2D74B2] focus:ring-1 focus:ring-[#2D74B2]"
              />
            </div>

            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700 py-1.5 px-2.5 rounded-lg focus:outline-none cursor-pointer"
            >
              <option value="All">All Formats</option>
              <option value="PDF">PDF</option>
              <option value="XLSX">XLSX</option>
              <option value="CSV">CSV</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredReports.map((rep) => (
          <Card key={rep.id} className="flex flex-col justify-between hover:shadow-md transition-all">
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="p-2.5 bg-gray-100 rounded-xl shrink-0">
                  {getCategoryIcon(rep.category)}
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-rose-50 text-[#2D74B2] text-[10px] font-bold px-2 py-0.5 rounded-md">
                    {rep.category}
                  </span>
                  <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-md font-mono">
                    {rep.fileFormat} • {rep.fileSize}
                  </span>
                </div>
              </div>

              <h3 className="font-bold text-sm text-gray-900 leading-snug">{rep.title}</h3>
              {rep.description && (
                <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{rep.description}</p>
              )}

              <div className="mt-3 flex items-center justify-between text-[11px] text-gray-400 font-mono">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-gray-400" /> {rep.generatedDate}
                </span>
                {rep.recordCount && (
                  <span className="font-semibold text-gray-600">
                    {rep.recordCount.toLocaleString()} Records
                  </span>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs mt-4">
              <button
                onClick={() => setPreviewReport(rep)}
                className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-blue-600" />
                <span>Preview Data</span>
              </button>

              <Button
                variant="primary"
                size="sm"
                icon={<Download className="w-3.5 h-3.5" />}
                disabled={downloadingId === rep.id}
                onClick={() => handleDownload(rep)}
              >
                {downloadingId === rep.id ? 'Preparing...' : `Download ${rep.fileFormat}`}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 p-8">
          <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-gray-700">No matching reports found</p>
          <p className="text-xs text-gray-400 mt-1">Try adjusting your category filter or search query</p>
        </div>
      )}

      {/* Report Data Preview Modal */}
      {previewReport && (
        <Modal
          isOpen={!!previewReport}
          onClose={() => setPreviewReport(null)}
          title={`Report Data Summary: ${previewReport.category}`}
          subtitle={previewReport.title}
          maxWidth="lg"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-gray-400 font-mono">
                {previewReport.fileFormat} • {previewReport.fileSize} • {previewReport.recordCount?.toLocaleString()} items
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setPreviewReport(null)}>
                  Close
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Download className="w-3.5 h-3.5" />}
                  onClick={() => {
                    handleDownload(previewReport);
                    setPreviewReport(null);
                  }}
                >
                  Download {previewReport.fileFormat}
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-800">{previewReport.title}</p>
                <p className="text-gray-500 text-[11px] mt-0.5">{previewReport.description}</p>
              </div>
              <span className="bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-lg shrink-0">
                Audit Verified
              </span>
            </div>

            {/* Content Preview based on category */}
            {previewReport.category === 'Customer Details' && (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-2.5 bg-blue-50/60 rounded-xl border border-blue-100">
                    <div className="text-[10px] text-blue-700 font-bold">Total Customer Profiles</div>
                    <div className="text-lg font-bold text-blue-900 mt-0.5">8,100</div>
                  </div>
                  <div className="p-2.5 bg-purple-50/60 rounded-xl border border-purple-100">
                    <div className="text-[10px] text-purple-700 font-bold">First Citizen Members</div>
                    <div className="text-lg font-bold text-purple-900 mt-0.5">5,540 (68.4%)</div>
                  </div>
                  <div className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100">
                    <div className="text-[10px] text-emerald-700 font-bold">Average Customer LTV</div>
                    <div className="text-lg font-bold text-emerald-900 mt-0.5">₹34,800</div>
                  </div>
                </div>

                <div className="font-bold text-gray-800 pt-2">Sample Member Roster Preview</div>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="p-2">Name</th>
                        <th className="p-2">Email</th>
                        <th className="p-2">Tier</th>
                        <th className="p-2">Total Spent</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700">
                      <tr>
                        <td className="p-2 font-bold">Ananya Deshmukh</td>
                        <td className="p-2 font-mono text-[11px]">ananya.d@gmail.com</td>
                        <td className="p-2 text-rose-600 font-bold">Black</td>
                        <td className="p-2 font-bold">₹2,84,900</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-bold">Kavita Reddy</td>
                        <td className="p-2 font-mono text-[11px]">kavita.reddy@gmail.com</td>
                        <td className="p-2 text-rose-600 font-bold">Black</td>
                        <td className="p-2 font-bold">₹3,92,000</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-bold">Vikramaditya Roy</td>
                        <td className="p-2 font-mono text-[11px]">v.roy@consultant.com</td>
                        <td className="p-2 text-indigo-600 font-bold">Platinum</td>
                        <td className="p-2 font-bold">₹1,42,500</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {previewReport.category === 'Coupon Analytics' && (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100">
                    <div className="text-[10px] text-emerald-700 font-bold">Total Redemptions</div>
                    <div className="text-lg font-bold text-emerald-900 mt-0.5">1,450</div>
                  </div>
                  <div className="p-2.5 bg-amber-50/60 rounded-xl border border-amber-100">
                    <div className="text-[10px] text-amber-700 font-bold">Discount Spend Given</div>
                    <div className="text-lg font-bold text-amber-900 mt-0.5">₹14,50,000</div>
                  </div>
                  <div className="p-2.5 bg-indigo-50/60 rounded-xl border border-indigo-100">
                    <div className="text-[10px] text-indigo-700 font-bold">Attributed Revenue</div>
                    <div className="text-lg font-bold text-indigo-900 mt-0.5">₹98,20,000</div>
                  </div>
                </div>

                <div className="font-bold text-gray-800 pt-2">Active Voucher Performance List</div>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="p-2">Code</th>
                        <th className="p-2">Category</th>
                        <th className="p-2">Usage</th>
                        <th className="p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700">
                      <tr>
                        <td className="p-2 font-mono font-bold text-rose-600">FIRSTCITIZEN20</td>
                        <td className="p-2">All Products</td>
                        <td className="p-2 font-bold">540 / 1000</td>
                        <td className="p-2 text-emerald-600 font-bold">Active</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-mono font-bold text-rose-600">LUXURYWATCH15</td>
                        <td className="p-2">Luxury Watches</td>
                        <td className="p-2 font-bold">320 / 500</td>
                        <td className="p-2 text-emerald-600 font-bold">Active</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-mono font-bold text-rose-600">BEAUTYBUY2</td>
                        <td className="p-2">Beauty & Perfumes</td>
                        <td className="p-2 font-bold">890 / 2500</td>
                        <td className="p-2 text-emerald-600 font-bold">Active</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {previewReport.category === 'Customer Reviews' && (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-2.5 bg-amber-50/60 rounded-xl border border-amber-100">
                    <div className="text-[10px] text-amber-700 font-bold">Average Store Rating</div>
                    <div className="text-lg font-bold text-amber-900 mt-0.5 flex items-center gap-1">
                      4.8 / 5.0 <Star className="w-4 h-4 fill-amber-400 text-amber-400 inline" />
                    </div>
                  </div>
                  <div className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100">
                    <div className="text-[10px] text-emerald-700 font-bold">Positive Sentiment</div>
                    <div className="text-lg font-bold text-emerald-900 mt-0.5">92.4%</div>
                  </div>
                  <div className="p-2.5 bg-blue-50/60 rounded-xl border border-blue-100">
                    <div className="text-[10px] text-blue-700 font-bold">Verified Buyer Reviews</div>
                    <div className="text-lg font-bold text-blue-900 mt-0.5">2,310</div>
                  </div>
                </div>

                <div className="font-bold text-gray-800 pt-2">Recent Customer Review Audits</div>
                <div className="space-y-2">
                  <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900">Estée Lauder Night Repair</span>
                      <span className="text-amber-500 font-bold flex items-center gap-0.5">
                        5.0 ★
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-600 mt-1">
                      "Authentic product delivered within 2 hours in Malad flagship pickup. Loved the packaging!"
                    </p>
                  </div>
                  <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900">Tommy Hilfiger Navy Blazer</span>
                      <span className="text-amber-500 font-bold flex items-center gap-0.5">
                        4.5 ★
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-600 mt-1">
                      "Great fitting and premium fabric texture. Fitting session at store counter was quick."
                    </p>
                  </div>
                </div>
              </div>
            )}

            {previewReport.category !== 'Customer Details' &&
              previewReport.category !== 'Coupon Analytics' &&
              previewReport.category !== 'Customer Reviews' && (
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-center">
                  <BarChart3 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="font-bold text-gray-700">Full Certified Audit Ledger Ready</p>
                  <p className="text-gray-500 text-[11px] mt-1">
                    Download the complete {previewReport.fileFormat} file to inspect all {previewReport.recordCount?.toLocaleString()} itemized entries.
                  </p>
                </div>
              )}
          </div>
        </Modal>
      )}
    </div>
  );
};

