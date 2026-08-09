import React from 'react';
import { OrderStatus, LoyaltyTier } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'brand';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full transition-colors';
  
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs tracking-wide',
  };

  const variantStyles = {
    default: 'bg-slate-100 text-slate-700 border border-slate-200/60',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200/60',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200/60',
    info: 'bg-sky-50 text-sky-700 border border-sky-200/60',
    neutral: 'bg-slate-50 text-slate-600 border border-slate-200/50',
    brand: 'bg-[#122B52]/10 text-[#122B52] border border-[#122B52]/20 font-semibold',
  };

  return (
    <span className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: OrderStatus | string }> = ({ status }) => {
  switch (status) {
    case 'Delivered':
    case 'In Stock':
    case 'Active':
    case 'Resolved':
      return <Badge variant="success">Delivered</Badge>;
    case 'In Transit':
    case 'Processing':
    case 'In Progress':
      return <Badge variant="info">{status}</Badge>;
    case 'Low Stock':
    case 'Scheduled':
    case 'Open':
      return <Badge variant="warning">{status}</Badge>;
    case 'Returned':
    case 'Out of Stock':
    case 'Cancelled':
    case 'Expired':
      return <Badge variant="danger">{status}</Badge>;
    default:
      return <Badge variant="default">{status}</Badge>;
  }
};

export const LoyaltyBadge: React.FC<{ tier: LoyaltyTier }> = ({ tier }) => {
  const tierStyles = {
    Black: 'bg-slate-900 text-amber-400 border border-amber-500/30 font-bold',
    Platinum: 'bg-slate-800 text-slate-100 border border-slate-600 font-semibold',
    Golden: 'bg-amber-100 text-amber-800 border border-amber-300 font-semibold',
    Silver: 'bg-slate-100 text-slate-700 border border-slate-300 font-medium',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${tierStyles[tier]}`}>
      ★ {tier} First Citizen
    </span>
  );
};
