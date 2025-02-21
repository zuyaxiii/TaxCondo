import React from "react";
import { PaymentShares } from "@/app/api/types";

interface PaymentSharesSelectorProps {
  paymentShares: PaymentShares;
  updatePaymentShare: (key: string, value: string) => void;
}

const PaymentSharesSelector: React.FC<PaymentSharesSelectorProps> = ({
  paymentShares,
  updatePaymentShare,
}) => {
  const feeTypes = [
    { key: "transferFee", label: "ค่าธรรมเนียมโอน" },
    { key: "specificBusinessTax", label: "ภาษีธุรกิจเฉพาะ" },
    { key: "stampDuty", label: "อากรแสตมป์" },
    { key: "withholdingTax", label: "ภาษีหัก ณ ที่จ่าย" },
    { key: "mortgageFee", label: "ค่าจดจำนอง" },
  ];

  return (
    <div className="flex justify-center items-center">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-6 space-y-6 ">
        <div className="mb-6 p-4 border rounded-lg">
          <h3 className="text-lg font-medium mb-3">สัดส่วนการจ่าย</h3>
          <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {feeTypes.map((feeType) => (
              <div key={feeType.key} className="flex flex-col">
                <legend className="text-sm font-medium mb-2">
                  {feeType.label}
                </legend>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <input
                      id={`${feeType.key}-50-50`}
                      type="radio"
                      name={feeType.key}
                      value="50-50"
                      checked={
                        paymentShares[feeType.key as keyof PaymentShares] ===
                        "50-50"
                      }
                      onChange={() => updatePaymentShare(feeType.key, "50-50")}
                      className="w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300"
                    />
                    <label
                      htmlFor={`${feeType.key}-50-50`}
                      className="ml-2 text-sm"
                    >
                      50-50
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id={`${feeType.key}-buyer`}
                      type="radio"
                      name={feeType.key}
                      value="buyer"
                      checked={
                        paymentShares[feeType.key as keyof PaymentShares] ===
                        "buyer"
                      }
                      onChange={() => updatePaymentShare(feeType.key, "buyer")}
                      className="w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300"
                    />
                    <label
                      htmlFor={`${feeType.key}-buyer`}
                      className="ml-2 text-sm"
                    >
                      ผู้ซื้อจ่าย
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id={`${feeType.key}-seller`}
                      type="radio"
                      name={feeType.key}
                      value="seller"
                      checked={
                        paymentShares[feeType.key as keyof PaymentShares] ===
                        "seller"
                      }
                      onChange={() => updatePaymentShare(feeType.key, "seller")}
                      className="w-4 h-4 border-gray-300 focus:ring-2 focus:ring-blue-300"
                    />
                    <label
                      htmlFor={`${feeType.key}-seller`}
                      className="ml-2 text-sm"
                    >
                      ผู้ขายจ่าย
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </fieldset>
        </div>
      </div>
    </div>
  );
};

export default PaymentSharesSelector;
