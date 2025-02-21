import { PaymentShare, TaxResults } from '../api/types';

export const calculateTax = (propertyValue: number, holdingYears: number): number => {
  const holdingTaxRates: { [key: number]: number } = {
    1: 0.08,
    2: 0.16,
    3: 0.23,
    4: 0.29,
    5: 0.35,
    6: 0.4,
    7: 0.45,
    8: 0.5,
  };

  const applicableRate =
    holdingYears >= 8 ? 0.5 : holdingTaxRates[holdingYears] || 0;
  const taxableIncome = propertyValue * applicableRate;
  const annualIncome = taxableIncome / holdingYears;

  const taxBrackets = [
    { limit: 300000, rate: 0.05 },
    { limit: 500000, rate: 0.1 },
    { limit: 750000, rate: 0.15 },
    { limit: 1000000, rate: 0.2 },
    { limit: 2000000, rate: 0.25 },
    { limit: 5000000, rate: 0.3 },
    { limit: Infinity, rate: 0.35 },
  ];

  let remainingIncome = annualIncome;
  let totalTaxPerYear = 0;
  let previousLimit = 0;

  for (const bracket of taxBrackets) {
    if (remainingIncome > 0) {
      const taxableAmount = Math.min(
        remainingIncome,
        bracket.limit - previousLimit
      );
      totalTaxPerYear += taxableAmount * bracket.rate;
      remainingIncome -= taxableAmount;
      previousLimit = bracket.limit;
    } else {
      break;
    }
  }

  return totalTaxPerYear * holdingYears;
};

export const calculateShare = (amount: number, share: string): PaymentShare => {
  if (share === "buyer") return { buyer: amount, seller: 0 };
  if (share === "seller") return { buyer: 0, seller: amount };
  return { buyer: amount / 2, seller: amount / 2 };
};

export const calculateTaxResults = (
  salePrice: number,
  assessedPrice: number,
  loanAmount: number,
  holdingPeriod: number,
  isRegistered: boolean,
  isRegisteredOverOneYear: boolean,
  registrationPeriod: number | null,
  transferFeeRate: number,
  mortgageFeeRate: number
): TaxResults => {
  const baseForSpecificTax = Math.max(salePrice, assessedPrice);
  const transferFee = assessedPrice * transferFeeRate;
  const mortgageFee = loanAmount * mortgageFeeRate;

  let specificBusinessTax = 0;
  const isExemptFromBusinessTax =
    holdingPeriod > 5 ||
    (isRegistered && isRegisteredOverOneYear);

  if (!isExemptFromBusinessTax) {
    specificBusinessTax = baseForSpecificTax * 0.033;
  }

  let stampDuty = specificBusinessTax === 0 ? salePrice * 0.005 : 0;
  const totalIncomeTax = calculateTax(assessedPrice, holdingPeriod);

  const totalFees =
    transferFee +
    specificBusinessTax +
    stampDuty +
    totalIncomeTax +
    mortgageFee;

  return {
    transferFee,
    specificBusinessTax,
    stampDuty,
    totalIncomeTax,
    withholdingTax: totalIncomeTax,
    mortgageFee,
    total: totalFees,
    isExemptFromBusinessTax,
    holdingPeriod,
    registrationPeriod,
  };
};