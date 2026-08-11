import React from 'react';
import { HelpCircle, MessageSquare, Plus, BookOpen, ExternalLink } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { StatusBadge } from '../common/Badge';
import { INITIAL_TICKETS } from '../../data/mockData';

export const HelpTab: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Store Ops Help Desk & Knowledge Base
          </h2>
          <p className="text-xs text-slate-500">
            Submit IT support tickets for POS hardware, GST tax rules, or loyalty APIs
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => alert('Raise Support Ticket Form Opened')}
        >
          Raise IT Support Ticket
        </Button>
      </div>

      {/* Tickets List */}
      <Card className="p-0! overflow-hidden">
        <div className="p-4 border-b border-slate-100 font-bold text-sm text-slate-900 flex items-center justify-between">
          <span>Active Operations Support Tickets</span>
          <span className="text-xs text-slate-400 font-normal">SLA Response: &lt; 30 Mins</span>
        </div>
        <div className="divide-y divide-slate-100">
          {INITIAL_TICKETS.map((t) => (
            <div key={t.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-slate-900">{t.id}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      t.priority === 'High'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {t.priority} Priority
                  </span>
                </div>
                <div className="font-bold text-sm text-slate-900 mt-1">{t.subject}</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Category: {t.category} • Assigned to: {t.assignedTo} • {t.createdAt}
                </div>
              </div>
              <StatusBadge status={t.status} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
