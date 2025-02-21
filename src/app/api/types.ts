export interface TaxValues {
  salePrice: string;
  assessedPrice: string;
  purchaseDate: string;
  saleDate: string;
  isRegistered: boolean;
  isRegisteredOverOneYear: boolean;
  loanAmount: string;
}

export interface CustomFees {
  transferFee: string;
  mortgageFee: string;
}

export interface PaymentShares {
  transferFee: string;
  specificBusinessTax: string;
  stampDuty: string;
  withholdingTax: string;
  mortgageFee: string;
}

export interface TaxResults {
  transferFee: number;
  specificBusinessTax: number;
  stampDuty: number;
  totalIncomeTax: number;
  withholdingTax: number;
  mortgageFee: number;
  total: number;
  isExemptFromBusinessTax: boolean;
  holdingPeriod: number;
  registrationPeriod: number | null;
}

export interface DetailedPeriod {
  years: number;
  months: number;
  days: number;
}

export interface PaymentShare {
  buyer: number;
  seller: number;
}

export interface ExportOptions {
  includeHeader?: boolean;
  addWatermark?: boolean;
  scale?: number;
  paperSize?: 'a4' | 'letter' | 'custom';
  quality?: number;
  backgroundColor?: string;
  filename?: string;

  watermarkText?: string;
}