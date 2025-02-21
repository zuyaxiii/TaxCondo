import React from "react";
import { CustomFees } from "@/app/api/types";

interface CustomFeesInputProps {
  useCustomFees: boolean;
  setUseCustomFees: React.Dispatch<React.SetStateAction<boolean>>;
  customFees: CustomFees;
  setCustomFees: React.Dispatch<React.SetStateAction<CustomFees>>;
}

const CustomFeesInput: React.FC<CustomFeesInputProps> = ({
  useCustomFees,
  setUseCustomFees,
  customFees,
  setCustomFees,
}) => {
  const handleCustomFeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomFees((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="flex justify-center items-center">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-6 space-y-6 ">
        <div className="mb-4 p-4 border rounded-lg">
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="useCustomFees"
              checked={useCustomFees}
              onChange={(e) => setUseCustomFees(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="useCustomFees" className="text-lg font-medium">
              ค่าธรรมเนียมการโอนตามนโยบายรัฐบาล (ถ้าไม่มีไม่ต้องกดเลือก)
            </label>
          </div>

          {useCustomFees && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="transferFee" className="block mb-1">
                  ค่าธรรมเนียมโอน (%)
                </label>
                <input
                  type="number"
                  id="transferFee"
                  name="transferFee"
                  value={customFees.transferFee}
                  onChange={handleCustomFeeChange}
                  placeholder="2.0"
                  className="w-full p-2 border rounded"
                  step="0.01"
                  min="0"
                />
              </div>
              <div>
                <label htmlFor="mortgageFee" className="block mb-1">
                  ค่าจดจำนอง (%)
                </label>
                <input
                  type="number"
                  id="mortgageFee"
                  name="mortgageFee"
                  value={customFees.mortgageFee}
                  onChange={handleCustomFeeChange}
                  placeholder="1.0"
                  className="w-full p-2 border rounded"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomFeesInput;
