import React, { useState } from 'react';
import { Settings, Save, ShieldCheck, Building, Bell, CreditCard } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';

export const SettingsTab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'tax' | 'roles'>('general');
  const [gstin, setGstin] = useState('27AAACS1001A1Z8');
  const [storeName, setStoreName] = useState('Raymonds Malad West Flagship');

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Store Configuration & POS Settings
        </h2>
        <p className="text-xs text-slate-500">
          Manage terminal GST compliance, roles & authorization credentials
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('general')}
          className={`pb-3 border-b-2 transition-all cursor-pointer ${
            activeTab === 'general'
              ? 'border-[#122B52] text-[#122B52] font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          General Store Info
        </button>
        <button
          onClick={() => setActiveTab('tax')}
          className={`pb-3 border-b-2 transition-all cursor-pointer ${
            activeTab === 'tax'
              ? 'border-[#122B52] text-[#122B52] font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          GSTIN & Tax Slabs
        </button>
        <button
          onClick={() => setActiveTab('roles')}
          className={`pb-3 border-b-2 transition-all cursor-pointer ${
            activeTab === 'roles'
              ? 'border-[#122B52] text-[#122B52] font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Roles & Permissions
        </button>
      </div>

      {activeTab === 'general' && (
        <Card className="max-w-2xl space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Store Branch Title</label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full bg-white p-2.5 rounded-xl border border-slate-300 font-semibold text-slate-900 outline-none"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Branch Code / Store ID</label>
            <input
              type="text"
              disabled
              value="STORE-MUM-MLD-001"
              className="w-full bg-slate-100 p-2.5 rounded-xl border border-slate-200 font-mono text-slate-500"
            />
          </div>
          <Button
            variant="primary"
            size="sm"
            icon={<Save className="w-3.5 h-3.5" />}
            onClick={() => alert('General Store Settings Saved')}
          >
            Save Configuration
          </Button>
        </Card>
      )}

      {activeTab === 'tax' && (
        <Card className="max-w-2xl space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Corporate GSTIN Number</label>
            <input
              type="text"
              value={gstin}
              onChange={(e) => setGstin(e.target.value)}
              className="w-full font-mono uppercase font-bold bg-white p-2.5 rounded-xl border border-slate-300 text-slate-900 outline-none"
            />
          </div>
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs">
            ✓ GSTIN Verified with Government e-Invoicing Portal
          </div>
        </Card>
      )}

      {activeTab === 'roles' && (
        <Card className="max-w-2xl text-xs space-y-3">
          <div className="font-bold text-sm text-slate-900">User Access Control List</div>
          <div className="divide-y divide-slate-100">
            <div className="py-2 flex justify-between items-center">
              <div>
                <strong className="text-slate-900">Rajesh Verma</strong> (Senior Director)
              </div>
              <span className="bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                Super Admin
              </span>
            </div>
            <div className="py-2 flex justify-between items-center">
              <div>
                <strong className="text-slate-900">Priya Sharma</strong> (Store Manager - Malad)
              </div>
              <span className="bg-slate-200 text-slate-800 text-[10px] px-2 py-0.5 rounded-full font-semibold">
                Store Manager
              </span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
