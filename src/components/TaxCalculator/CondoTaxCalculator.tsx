"use client";
import React, { useState, useEffect } from "react";
import {
  TaxValues,
  CustomFees,
  PaymentShares,
  TaxResults,
  DetailedPeriod,
} from "@/app/api/types";
import { calculateTaxResults } from "@/app/utils/taxCalculator";
import {
  calculateDetailedHoldingPeriod,
  calculateHoldingPeriod,
  formatDetailedPeriod,
} from "@/app/utils/dateUtils";
import InputForm from "./InputForm";
import CustomFeesInput from "./CustomFeesInput";
import PaymentSharesSelector from "./PaymentSharesSelector";
import TaxResultsDisplay from "./TaxResultsDisplay";

const CondoTaxCalculator: React.FC = () => {
  const [values, setValues] = useState<TaxValues>({
    salePrice: "",
    assessedPrice: "",
    purchaseDate: "",
    saleDate: "",
    isRegistered: false,
    isRegisteredOverOneYear: false,
    loanAmount: "",
  });

  const [holdingPeriod, setHoldingPeriod] = useState<number | null>(null);
  const [registrationPeriod, setRegistrationPeriod] = useState<number | null>(
    null
  );
  const [results, setResults] = useState<TaxResults | null>(null);

  const [useCustomFees, setUseCustomFees] = useState(false);
  const [customFees, setCustomFees] = useState<CustomFees>({
    transferFee: "",
    mortgageFee: "",
  });

  const [paymentShares, setPaymentShares] = useState<PaymentShares>({
    transferFee: "50-50",
    specificBusinessTax: "50-50",
    stampDuty: "50-50",
    withholdingTax: "50-50",
    mortgageFee: "50-50",
  });

  const [detailedPeriod, setDetailedPeriod] = useState<DetailedPeriod>({
    years: 0,
    months: 0,
    days: 0,
  });
  const [formattedPeriod, setFormattedPeriod] = useState<string>("");

  const updatePaymentShare = (key: string, value: string) => {
    setPaymentShares((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  useEffect(() => {
    if (values.purchaseDate && values.saleDate) {
      setHoldingPeriod(
        calculateHoldingPeriod(values.purchaseDate, values.saleDate)
      );

      const detailed = calculateDetailedHoldingPeriod(
        values.purchaseDate,
        values.saleDate
      );
      setDetailedPeriod(detailed);
      setFormattedPeriod(formatDetailedPeriod(detailed));
    }
  }, [values.purchaseDate, values.saleDate]);

  const calculate = () => {
    if (holdingPeriod === null || isNaN(holdingPeriod)) {
      alert("เกิดข้อผิดพลาดในการคำนวณระยะเวลาถือครอง");
      return;
    }

    if (!values.salePrice || !values.assessedPrice || !values.loanAmount) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    const salePrice = parseFloat(values.salePrice);
    const assessedPrice = parseFloat(values.assessedPrice);
    const loanAmount = parseFloat(values.loanAmount);

    const transferFeeRate = useCustomFees
      ? parseFloat(customFees.transferFee) / 100 || 0
      : 0.02;

    const mortgageFeeRate = useCustomFees
      ? parseFloat(customFees.mortgageFee) / 100 || 0
      : 0.01;

    const calculatedResults = calculateTaxResults(
      salePrice,
      assessedPrice,
      loanAmount,
      holdingPeriod,
      values.isRegistered,
      values.isRegisteredOverOneYear,
      registrationPeriod,
      transferFeeRate,
      mortgageFeeRate
    );

    setResults(calculatedResults);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="font-prompt text-2xl font-bold mb-4">
        โปรแกรมคำนวณค่าโอนคอนโดมือสอง ภาษีธุรกิจเฉพาะ ค่าจดจำนอง
        และค่าธรรมเนียมอื่นๆ ที่จะต้องชำระ ณ สำนักงานที่ดิน
      </h1>

      <div className="mb-4">
        <InputForm values={values} setValues={setValues} />
      </div>

      <div className="mb-4">
        <CustomFeesInput
          useCustomFees={useCustomFees}
          setUseCustomFees={setUseCustomFees}
          customFees={customFees}
          setCustomFees={setCustomFees}
        />
      </div>

      <div className="mb-4">
        <PaymentSharesSelector
          paymentShares={paymentShares}
          updatePaymentShare={updatePaymentShare}
        />
      </div>

      <div className="mb-4">
        <button
          onClick={calculate}
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition-colors"
        >
          คำนวณค่าธรรมเนียมและภาษี
        </button>
      </div>

      {results && (
        <TaxResultsDisplay
          results={results}
          paymentShares={paymentShares}
          detailedPeriod={detailedPeriod}
        />
      )}
    </div>
  );
};

export default CondoTaxCalculator;
