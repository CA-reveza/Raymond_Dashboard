import React, { useState } from 'react';
import { Download, FileSpreadsheet, Check } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { downloadReportFile } from '../../utils/exportAndPrint';

interface DownloadReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStore: string;
}

export const DownloadReportModal: React.FC<DownloadReportModalProps> = ({
  isOpen,
  onClose,
  selectedStore,
}) => {
  const [reportType, setReportType] = useState('GST Sales Audit Summary');
  const [format, setFormat] = useState<'PDF' | 'XLSX' | 'CSV'>('PDF');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      downloadReportFile(reportType, format, selectedStore);
      onClose();
    }, 600);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Export Retail Operations Report"
      subtitle={`Generating compiled ledger for ${selectedStore}`}
      maxWidth="md"
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Download className="w-3.5 h-3.5" />}
            disabled={isExporting}
            onClick={handleExport}
          >
            {isExporting ? 'Compiling File...' : `Download ${format}`}
          </Button>
        </div>
      }
    >
      <div className="space-y-4 text-xs">
        <div>
          <label className="block font-bold text-slate-700 mb-1">Select Report Type</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full bg-white p-2.5 rounded-xl border border-slate-300 font-semibold text-slate-900 outline-none focus:border-[#2D74B2] focus:ring-1 focus:ring-[#2D74B2]"
          >
            <option value="Customer Details, Loyalty Cohorts & VIP Demographics">
              Customer Details & VIP Demographics
            </option>
            <option value="Coupon & Promotional Voucher Conversion Performance">
              Coupon Analytics & Voucher Performance
            </option>
            <option value="Customer Product Reviews & CSAT Sentiment Analysis">
              Customer Reviews & Store Ratings Report
            </option>
            <option value="Returns & Refund Audit with Damage SKU Breakdown">
              Returns & Refund Audit Report
            </option>
            <option value="GST Sales Audit Summary">GST Sales Audit Summary (18% Slab)</option>
            <option value="Store Inventory Valuation Ledger">Store Inventory Valuation Ledger</option>
            <option value="First Citizen Points Liability Audit">
              First Citizen Points Liability Audit
            </option>
            <option value="Omnichannel Sales Conversion Telemetry">
              Omnichannel Sales Conversion Telemetry
            </option>
          </select>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">File Format</label>
          <div className="grid grid-cols-3 gap-2">
            {(['PDF', 'XLSX', 'CSV'] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => setFormat(fmt)}
                className={`py-2 px-3 rounded-xl font-bold border transition-all cursor-pointer ${
                  format === fmt
                    ? 'bg-[#122B52] text-white border-[#122B52]'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 font-medium">
          Note: This export contains sanitized transaction records for {selectedStore} for the current month.
        </div>
      </div>
    </Modal>
  );
};
