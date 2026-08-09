export type ScreenStep = 'login' | 'scratch' | 'discovery';

export interface CustomerInfo {
  fullName: string;
  phone: string;
  email: string;
  consentOffers: boolean;
  termsAccepted: boolean;
  connectedAt?: string;
  sessionVoucherCode: string;
  sessionVoucherDiscount?: string;
  sessionVoucherDesc?: string;
  sessionVoucherMinOrder?: string;
}

export interface Brand {
  id: string;
  name: string;
  category: string;
  level: string;
  section: string;
  description: string;
  featured?: boolean;
  popularItems?: string[];
}

export interface StoreCategory {
  id: string;
  name: string;
  level: string;
  subtitle: string;
  subcategories: string[];
  aisle: string;
  imageUrl: string;
}

export interface NewArrivalCollection {
  id: string;
  title: string;
  subtitle: string;
  category: 'WOMEN' | 'MEN' | 'BEAUTY' | 'ACCESSORIES';
  badge: string;
  imageUrl: string;
  description: string;
  highlights: string[];
  storeLocation: string;
}

export interface TrendingEdit {
  id: string;
  title: string;
  tag: string;
  imageUrl: string;
  location: string;
  description: string;
}

export interface InStoreEvent {
  id: string;
  title: string;
  location: string;
  time: string;
  badge: string;
  description: string;
}
