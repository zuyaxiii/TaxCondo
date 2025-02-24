import React, { useState } from "react";
import { TaxValues } from "@/app/api/types";
import { validateDates } from "@/app/utils/dateUtils";
import { formatNumberWithCommas, unformatNumber } from "@/app/utils/format";
import Link from "next/link";

interface InputFormProps {
  values: TaxValues;
  setValues: React.Dispatch<React.SetStateAction<TaxValues>>;
}

const InputForm: React.FC<InputFormProps> = ({ values, setValues }) => {
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setValues((prev) => ({ ...prev, [name]: checked }));
      return;
    }

    if (
      name === "salePrice" ||
      name === "assessedPrice" ||
      name === "loanAmount"
    ) {
      const input = e.target as HTMLInputElement;
      const cursorPos = input.selectionStart || 0;

      const sanitizedValue = value.replace(/[^\d.]/g, "");

      const decimalCount = (sanitizedValue.match(/\./g) || []).length;
      if (decimalCount > 1) return;

      const numericValue = unformatNumber(sanitizedValue);
      if (numericValue !== "" && isNaN(Number(numericValue))) return;

      const formattedValue = formatNumberWithCommas(numericValue);

      const commasBeforeCursor = (
        value.substring(0, cursorPos).match(/,/g) || []
      ).length;
      const cleanCursorPos = cursorPos - commasBeforeCursor;

      setValues((prev) => ({ ...prev, [name]: numericValue }));
      input.value = formattedValue;

      setTimeout(() => {
        const formattedSubstr = formattedValue.substring(0, cleanCursorPos);
        const newCommasBeforeCursor = (formattedSubstr.match(/,/g) || [])
          .length;
        let newCursorPos = cleanCursorPos + newCommasBeforeCursor;

        const dotIndex = value.indexOf(".");
        if (dotIndex !== -1 && cursorPos > dotIndex) {
          const newDotIndex = formattedValue.indexOf(".");
          const offsetInDecimal = cursorPos - dotIndex - 1;
          newCursorPos = newDotIndex + 1 + offsetInDecimal;
        }

        input.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    } else {
      setValues((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    if (
      name === "salePrice" ||
      name === "assessedPrice" ||
      name === "loanAmount"
    ) {
      const numericValue = unformatNumber(value);
      const formattedValue = formatNumberWithCommas(numericValue);
      setValues((prev) => ({
        ...prev,
        [name]: numericValue,
      }));
      e.target.value = formattedValue;
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    if (validateDates(name, value, values.purchaseDate, values.saleDate)) {
      setValues({ ...values, [name]: value });
    }
  };

  const isFieldInvalid = (fieldName: string): boolean => {
    if (!touched[fieldName]) return false;

    if (fieldName === "salePrice" || fieldName === "assessedPrice") {
      return !values[fieldName] || Number(values[fieldName]) <= 0;
    }

    if (fieldName === "loanAmount") {
      return values[fieldName] === undefined || values[fieldName] === null;
    }

    if (fieldName === "purchaseDate" || fieldName === "saleDate") {
      return !values[fieldName];
    }

    return false;
  };

  const getInputClassName = (fieldName: string): string => {
    return `w-full p-2 border rounded ${
      isFieldInvalid(fieldName)
        ? "border-red-500 focus:ring-red-500 focus:border-red-500"
        : "focus:ring-blue-500 focus:border-blue-500"
    }`;
  };

  return (
    <div className="flex justify-center items-center">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-6 space-y-6 ">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
            <h2 className="font-prompt font-bold text-xl mb-4">
              ข้อมูลอสังหาริมทรัพย์
            </h2>
            <button
              type="button"
              className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 sm:mb-0"
            >
              <Link href="/treasury">ตรวจสอบราคาประเมิน</Link>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="salePrice" className="block mb-1">
                ราคาซื้อขายที่ตกลง (บาท)
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                inputMode="decimal"
                id="salePrice"
                name="salePrice"
                value={formatNumberWithCommas(values.salePrice)}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getInputClassName("salePrice")}
                placeholder="0.00"
                required
              />
              {isFieldInvalid("salePrice") && (
                <p className="text-red-500 text-sm mt-1">
                  กรุณากรอกราคาซื้อขาย
                </p>
              )}
            </div>

            <div>
              <label htmlFor="assessedPrice" className="block mb-1">
                ราคาประเมินของกรมธนารักษ์ (บาท)
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                inputMode="decimal"
                id="assessedPrice"
                name="assessedPrice"
                value={formatNumberWithCommas(values.assessedPrice)}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getInputClassName("assessedPrice")}
                placeholder="0"
                required
              />
              {isFieldInvalid("assessedPrice") && (
                <p className="text-red-500 text-sm mt-1">
                  กรุณากรอกราคาประเมิน
                </p>
              )}
            </div>

            <div>
              <label htmlFor="purchaseDate" className="block mb-1">
                วันที่ผู้ขายเริ่มถือครองคอนโด
                <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="purchaseDate"
                name="purchaseDate"
                value={values.purchaseDate}
                onChange={handleDateChange}
                onBlur={handleBlur}
                className={getInputClassName("purchaseDate")}
                required
              />
              {isFieldInvalid("purchaseDate") && (
                <p className="text-red-500 text-sm mt-1">
                  กรุณาเลือกวันที่เริ่มถือครอง
                </p>
              )}
            </div>

            <div>
              <label htmlFor="saleDate" className="block mb-1">
                วันที่จะโอนกรรมสิทธิ์
                <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="saleDate"
                name="saleDate"
                value={values.saleDate}
                onChange={handleDateChange}
                onBlur={handleBlur}
                className={getInputClassName("saleDate")}
                required
              />
              {isFieldInvalid("saleDate") && (
                <p className="text-red-500 text-sm mt-1">
                  กรุณาเลือกวันที่โอนกรรมสิทธิ์
                </p>
              )}
            </div>

            <div>
              <label htmlFor="loanAmount" className="block mb-1">
                ยอดเงินกู้ที่ธนาคารอนุมัติ (บาท)
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                inputMode="decimal"
                id="loanAmount"
                name="loanAmount"
                value={formatNumberWithCommas(values.loanAmount)}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getInputClassName("loanAmount")}
                placeholder="ถ้าซื้อสดให้ใส่ 0 (เฉพาะตัวเลข)"
                required
              />
              {isFieldInvalid("loanAmount") && (
                <p className="text-red-500 text-sm mt-1">
                  กรุณากรอกยอดเงินกู้ (หากไม่มีให้ใส่ 0)
                </p>
              )}
            </div>

            <div className="flex flex-col justify-end">
              <label className="inline-flex items-center cursor-pointer mb-2">
                <input
                  type="checkbox"
                  id="isRegistered"
                  name="isRegistered"
                  checked={values.isRegistered}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer dark:bg-gray-700 peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                <span className="ms-3 text-sm font-medium text-black">
                  ผู้ขายมีชื่ออยู่ในทะเบียนบ้านของทรัพย์
                </span>
              </label>

              {values.isRegistered && (
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id="isRegisteredOverOneYear"
                    name="isRegisteredOverOneYear"
                    checked={values.isRegisteredOverOneYear}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer dark:bg-gray-700 peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  <span className="ms-3 text-sm font-medium text-black">
                    มีชื่อในทะเบียนบ้านเกิน 1 ปี
                  </span>
                </label>
              )}
            </div>

            <div className="col-span-1 md:col-span-2">
              <div className="bg-yellow-300 text-black px-3 py-1 rounded-t-lg w-fit font-semibold">
                หมายเหตุ
              </div>
              <div className="border border-gray-300 bg-gray-100 p-3 rounded-b-lg">
                <p>
                  การคำนวณปีให้นับแบบวันชนวัน เช่น ผู้ขายมีชื่อบนโฉนด 1 มิ.ย.
                  2561 (2018) ต้องโอนหลังจาก 1 มิ.ย. 2562 (2019) ถึงจะนับเป็น 1
                  ปี คือ ต้องโอนตั้งแต่วันที่ 2 มิ.ย. 2562 (2019) เป็นต้นไป
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InputForm;
