import React from "react";
import { TaxResults, PaymentShares, DetailedPeriod } from "@/app/api/types";
import { calculateShare } from "@/app/utils/taxCalculator";
import {
  exportElementAsJpg,
  exportElementAsPdf,
} from "@/app/utils/exportUtils";
import Image from "next/image";
import YoknewLogo from "@/app/Yoknew_logo.png";

interface TaxResultsDisplayProps {
  results: TaxResults | null;
  paymentShares: PaymentShares;
  detailedPeriod?: DetailedPeriod;
}

const TaxResultsDisplay: React.FC<TaxResultsDisplayProps> = ({
  results,
  paymentShares,
  detailedPeriod,
}) => {
  if (!results) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleExportAsJpg = (party: "all" | "buyer" | "seller") => {
    exportElementAsJpg(`property-form-${party}`, {
      filename: `property-data-${party}-${
        new Date().toISOString().split("T")[0]
      }`,
      includeHeader: true,
      scale: 2,
    });
  };

  const handleExportAsPdf = (party: "all" | "buyer" | "seller") => {
    exportElementAsPdf(`property-form-${party}`, {
      filename: `property-data-${party}-${
        new Date().toISOString().split("T")[0]
      }`,
      includeHeader: true,
    });
  };

  const transferFeeShares = calculateShare(
    results.transferFee,
    paymentShares.transferFee
  );
  const specificTaxShares = calculateShare(
    results.specificBusinessTax,
    paymentShares.specificBusinessTax
  );
  const stampDutyShares = calculateShare(
    results.stampDuty,
    paymentShares.stampDuty
  );
  const withholdingTaxShares = calculateShare(
    results.withholdingTax,
    paymentShares.withholdingTax
  );
  const mortgageFeeShares = calculateShare(
    results.mortgageFee,
    paymentShares.mortgageFee
  );

  const buyerTotal =
    transferFeeShares.buyer +
    specificTaxShares.buyer +
    stampDutyShares.buyer +
    withholdingTaxShares.buyer +
    mortgageFeeShares.buyer;

  const sellerTotal =
    transferFeeShares.seller +
    specificTaxShares.seller +
    stampDutyShares.seller +
    withholdingTaxShares.seller +
    mortgageFeeShares.seller;

  return (
    <>
      <div className="mt-8 p-6 border rounded-lg bg-gray-50">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">ผลการคำนวณ</h2>
            <Image src={YoknewLogo} alt="ผลการคำนวณ" width={100} height={100} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-lg">
                <span className="font-medium">ระยะเวลาถือครอง:</span>{" "}
                {results.holdingPeriod} ปี
              </p>
              {detailedPeriod && (
                <p className="text-gray-700">
                  ช่วงเวลา: {detailedPeriod.years} ปี {detailedPeriod.months}{" "}
                  เดือน {detailedPeriod.days} วัน
                </p>
              )}
              {results.isExemptFromBusinessTax && (
                <p className="text-green-600 font-medium">
                  ✅ ได้รับยกเว้นค่าภาษีธุรกิจเฉพาะ
                </p>
              )}
            </div>

            <div className="flex items-center text-yellow-600 bg-yellow-100 p-2 rounded-lg">
              <span className="mr-2 text-2xl">⚠️</span>
              <p className="text-sm">
                การคำนวณดังกล่าวเป็นเพียงการคำนวณเบื้องต้นเท่านั้น
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 text-left">รายการ</th>
                <th className="p-2 text-right">จำนวนเงิน</th>
                <th className="p-2 text-right">ผู้ซื้อจ่าย</th>
                <th className="p-2 text-right">ผู้ขายจ่าย</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  label: "ค่าธรรมเนียมการทำนิติกรรม (ค่าโอน)",
                  value: results.transferFee,
                  buyer: transferFeeShares.buyer,
                  seller: transferFeeShares.seller,
                },
                {
                  label: "ค่าภาษีธุรกิจเฉพาะ",
                  value: results.specificBusinessTax,
                  buyer: specificTaxShares.buyer,
                  seller: specificTaxShares.seller,
                },
                {
                  label: "ค่าอากรแสตมป์",
                  value: results.stampDuty,
                  buyer: stampDutyShares.buyer,
                  seller: stampDutyShares.seller,
                },
                {
                  label: "ภาษีเงินได้บุคคลธรรมดาของผู้ขาย (หัก ณ ที่จ่าย)",
                  value: results.withholdingTax,
                  buyer: withholdingTaxShares.buyer,
                  seller: withholdingTaxShares.seller,
                },
                {
                  label: "ค่าจดจำนอง (กรณีจำนองกับสถาบันการเงิน)",
                  value: results.mortgageFee,
                  buyer: mortgageFeeShares.buyer,
                  seller: mortgageFeeShares.seller,
                },
              ].map((item, index) => (
                <tr key={index}>
                  <td className="p-2 border-b">{item.label}</td>
                  <td className="p-2 border-b text-right">
                    {formatCurrency(item.value)}
                  </td>
                  <td className="p-2 border-b text-right">
                    {formatCurrency(item.buyer)}
                  </td>
                  <td className="p-2 border-b text-right">
                    {formatCurrency(item.seller)}
                  </td>
                </tr>
              ))}
              <tr className="font-bold bg-gray-100">
                <td className="p-2">รวมค่าใช้จ่ายทั้งหมด</td>
                <td className="p-2 text-right">
                  {formatCurrency(results.total)}
                </td>
                <td className="p-2 text-right">{formatCurrency(buyerTotal)}</td>
                <td className="p-2 text-right">
                  {formatCurrency(sellerTotal)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex flex-col justify-end mt-4">
          <div className="bg-yellow-300 text-black px-3 py-1 rounded-t-lg w-fit font-semibold">
            หมายเหตุ: วิธีการคำนวณ
          </div>
          <div className="border border-gray-300 bg-gray-100 p-4 rounded-b-lg col-span-2 text-sm">
            <p>
              1. ค่าธรรมเนียมการทำนิติกรรม (ค่าโอน) = 2%
              จากราคาประเมินที่กำหนดโดยกรมที่ดิน
            </p>
            <p>
              2. ค่าภาษีธุรกิจเฉพาะ (ยกเว้นเมื่อถือครองเกิน 5 ปี
              หรือมีชื่อในทะเบียนบ้านมากกว่า 1 ปี) = 3.3%
              ของราคาซื้อขายที่ไม่น้อยกว่าราคาประเมิน
            </p>
            <p>
              3. ค่าอากรแสตมป์ (ชำระระหว่างอากรแสตมป์หรือภาษีธุรกิจเฉพาะ) =
              0.50% ตามราคาซื้อขายที่ไม่น้อยกว่าราคาประเมิน
            </p>
            <p>
              4. ค่าภาษีเงินได้บุคคลธรรมดา (หัก ณ ที่จ่าย) =
              ปฏิบัติตามหลักเกณฑ์ของกรมสรรพากร
            </p>
            <p>
              5. ค่าจดจำนอง (ในกรณีจำนองกับสถาบันการเงิน) = 1% ของมูลค่าที่จำนอง
              (จำนวนเงินกู้ทั้งหมด)
            </p>
            <p>
              6. จำนวนปีที่ถือครอง (ภาษีธุรกิจเฉพาะ/อากรแสตมป์) =
              คำนวณปีแบบวันชนวัน เช่น ผู้ขายมีชื่อบนโฉนดตั้งแต่ 1 มิ.ย. 2561
              (2018) ต้องทำการโอนหลังจากวันที่ 1 มิ.ย. 2562 (2019)
              ซึ่งจะถือว่าเป็น 1 ปี คือ ต้องโอนตั้งแต่วันที่ 2 มิ.ย. 2562 (2019)
              เป็นต้นไป
            </p>
            <br />
            <p className="text-red-600 font-semibold">
              ค่าใช้จ่ายที่คำนวณในเว็บไซต์นี้อาจแตกต่างจากจำนวนเงินที่ท่านต้องชำระในวันโอน
              กรุณาปรึกษากับสำนักงานที่ดินในเขตพื้นที่ที่เกี่ยวข้องกับอสังหาริมทรัพย์ของผู้ขายอีกครั้ง
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
          <div className="flex-1">
            <h3 className="font-semibold mb-2">ส่งออกข้อมูลทั้งหมด</h3>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => handleExportAsJpg("all")}
                className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
              >
                Export JPG
              </button>
              <button
                type="button"
                onClick={() => handleExportAsPdf("all")}
                className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
              >
                Export PDF
              </button>
            </div>
          </div>

          <div className="flex-1">
            <h3 className="font-semibold mb-2">ส่งออกข้อมูลผู้ซื้อ</h3>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => handleExportAsJpg("buyer")}
                className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
              >
                Export JPG
              </button>
              <button
                type="button"
                onClick={() => handleExportAsPdf("buyer")}
                className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
              >
                Export PDF
              </button>
            </div>
          </div>

          <div className="flex-1">
            <h3 className="font-semibold mb-2">ส่งออกข้อมูลผู้ขาย</h3>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => handleExportAsJpg("seller")}
                className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
              >
                Export JPG
              </button>
              <button
                type="button"
                onClick={() => handleExportAsPdf("seller")}
                className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
              >
                Export PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      <div id="property-form-buyer" className="hidden">
        <div className="mt-8 p-6 border rounded-lg bg-gray-50">
          <div className="mb-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">ผลการคำนวณสำหรับผู้ซื้อ</h2>
              <div
                style={{
                  width: "100px",
                  height: "70px",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <Image
                  src={YoknewLogo}
                  alt="ผลการคำนวณ"
                  layout="fill"
                  objectFit="contain"
                />
              </div>
            </div>

            <div className="mb-4 flex justify-between items-center">
              <p className="text-left">
                ระยะเวลาถือครอง: {results.holdingPeriod} ปี
                {detailedPeriod && (
                  <span>
                    {" "}
                    ช่วงเวลา: {detailedPeriod.years} ปี {detailedPeriod.months}{" "}
                    เดือน {detailedPeriod.days} วัน
                  </span>
                )}
              </p>
              <div className="flex items-center text-yellow-600">
                <span className="mr-1">⚠️</span>
                <p>การคำนวณดังกล่าวเป็นเพียงการคำนวณเบื้องต้นเท่านั้น</p>
              </div>
            </div>
          </div>
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 text-left">รายการ</th>
              <th className="p-2 text-right">ผู้ซื้อจ่าย</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2 border-b">
                ค่าธรรมเนียมการทำนิติกรรม (ค่าโอน)
              </td>
              <td className="p-2 border-b text-right">
                {formatCurrency(transferFeeShares.buyer)}
              </td>
            </tr>
            <tr>
              <td className="p-2 border-b">ค่าภาษีธุรกิจเฉพาะ</td>
              <td className="p-2 border-b text-right">
                {formatCurrency(specificTaxShares.buyer)}
              </td>
            </tr>
            <tr>
              <td className="p-2 border-b">ค่าอากรแสตมป์</td>
              <td className="p-2 border-b text-right">
                {formatCurrency(stampDutyShares.buyer)}
              </td>
            </tr>
            <tr>
              <td className="p-2 border-b">
                ภาษีเงินได้บุคคลธรรมดาของผู้ขาย (หัก ณ ที่จ่าย)
              </td>
              <td className="p-2 border-b text-right">
                {formatCurrency(withholdingTaxShares.buyer)}
              </td>
            </tr>
            <tr>
              <td className="p-2 border-b">
                ค่าจดจำนอง (กรณีจำนองกับสถาบันการเงิน)
              </td>
              <td className="p-2 border-b text-right">
                {formatCurrency(mortgageFeeShares.buyer)}
              </td>
            </tr>
            <tr className="font-bold bg-gray-100">
              <td className="p-2">รวมค่าใช้จ่ายทั้งหมด</td>
              <td className="p-2 text-right">{formatCurrency(buyerTotal)}</td>
            </tr>
          </tbody>
        </table>
        <div className="flex flex-col justify-end">
          <div className="bg-yellow-300 text-black px-3 py-1 rounded-t-lg w-fit font-semibold">
            หมายเหตุ: วิธีการคำนวณ
          </div>

          <div className="border border-gray-300 bg-gray-100 p-4 rounded-b-lg col-span-2 text-sm">
            <p>
              1. ค่าธรรมเนียมการทำนิติกรรม (ค่าโอน) = 2%
              จากราคาประเมินที่กำหนดโดยกรมที่ดิน
            </p>
            <p>
              2. ค่าภาษีธุรกิจเฉพาะ (ยกเว้นเมื่อถือครองเกิน 5 ปี
              หรือมีชื่อในทะเบียนบ้านมากกว่า 1 ปี) = 3.3%
              ของราคาซื้อขายที่ไม่น้อยกว่าราคาประเมิน
            </p>
            <p>
              3. ค่าอากรแสตมป์ (ชำระระหว่างอากรแสตมป์หรือภาษีธุรกิจเฉพาะ) =
              0.50% ตามราคาซื้อขายที่ไม่น้อยกว่าราคาประเมิน
            </p>
            <p>
              4. ค่าภาษีเงินได้บุคคลธรรมดา (หัก ณ ที่จ่าย) =
              ปฏิบัติตามหลักเกณฑ์ของกรมสรรพากร
            </p>
            <p>
              5. ค่าจดจำนอง (ในกรณีจำนองกับสถาบันการเงิน) = 1% ของมูลค่าที่จำนอง
              (จำนวนเงินกู้ทั้งหมด)
            </p>
            <p>
              6. จำนวนปีที่ถือครอง (ภาษีธุรกิจเฉพาะ/อากรแสตมป์) =
              คำนวณปีแบบวันชนวัน เช่น ผู้ขายมีชื่อบนโฉนดตั้งแต่ 1 มิ.ย. 2561
              (2018) ต้องทำการโอนหลังจากวันที่ 1 มิ.ย. 2562 (2019)
              ซึ่งจะถือว่าเป็น 1 ปี คือ ต้องโอนตั้งแต่วันที่ 2 มิ.ย. 2562 (2019)
              เป็นต้นไป
            </p>
            <br />
            <p className="text-red-600 font-semibold">
              ค่าใช้จ่ายที่คำนวณในเว็บไซต์นี้อาจแตกต่างจากจำนวนเงินที่ท่านต้องชำระในวันโอน
              กรุณาปรึกษากับสำนักงานที่ดินในเขตพื้นที่ที่เกี่ยวข้องกับอสังหาริมทรัพย์ของผู้ขายอีกครั้ง
            </p>
          </div>
        </div>
      </div>

      <div id="property-form-seller" className="hidden">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">ผลการคำนวณสำหรับผู้ขาย</h2>
          <div
            style={{
              width: "100px",
              height: "70px",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <Image
              src={YoknewLogo}
              alt="ผลการคำนวณ"
              layout="fill"
              objectFit="contain"
            />
          </div>
        </div>

        <div className="mb-4 flex justify-between items-center">
          <p className="text-left">
            ระยะเวลาถือครอง: {results.holdingPeriod} ปี
          </p>
          <div className="flex items-center text-yellow-600">
            <span className="mr-1">⚠️</span>
            <p>การคำนวณดังกล่าวเป็นเพียงการคำนวณเบื้องต้นเท่านั้น</p>
          </div>
          {results.isExemptFromBusinessTax && (
            <p className="text-green-600">ได้รับยกเว้นค่าภาษีธุรกิจเฉพาะ</p>
          )}
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 text-left">รายการ</th>
              <th className="p-2 text-right">ผู้ขายจ่าย</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2 border-b">
                ค่าธรรมเนียมการทำนิติกรรม (ค่าโอน)
              </td>
              <td className="p-2 border-b text-right">
                {formatCurrency(transferFeeShares.seller)}
              </td>
            </tr>
            <tr>
              <td className="p-2 border-b">ค่าภาษีธุรกิจเฉพาะ</td>
              <td className="p-2 border-b text-right">
                {formatCurrency(specificTaxShares.seller)}
              </td>
            </tr>
            <tr>
              <td className="p-2 border-b">ค่าอากรแสตมป์</td>
              <td className="p-2 border-b text-right">
                {formatCurrency(stampDutyShares.seller)}
              </td>
            </tr>
            <tr>
              <td className="p-2 border-b">
                ภาษีเงินได้บุคคลธรรมดาของผู้ขาย (หัก ณ ที่จ่าย)
              </td>
              <td className="p-2 border-b text-right">
                {formatCurrency(withholdingTaxShares.seller)}
              </td>
            </tr>
            <tr>
              <td className="p-2 border-b">
                ค่าจดจำนอง (กรณีจำนองกับสถาบันการเงิน)
              </td>
              <td className="p-2 border-b text-right">
                {formatCurrency(mortgageFeeShares.seller)}
              </td>
            </tr>
            <tr className="font-bold bg-gray-100">
              <td className="p-2">รวมค่าใช้จ่ายทั้งหมด</td>
              <td className="p-2 text-right">{formatCurrency(sellerTotal)}</td>
            </tr>
          </tbody>
        </table>
        <div className="flex flex-col justify-end">
          <div className="bg-yellow-300 text-black px-3 py-1 rounded-t-lg w-fit font-semibold">
            หมายเหตุ: วิธีการคำนวณ
          </div>

          <div className="border border-gray-300 bg-gray-100 p-4 rounded-b-lg col-span-2 text-sm">
            <p>
              1. ค่าธรรมเนียมการทำนิติกรรม (ค่าโอน) = 2%
              จากราคาประเมินที่กำหนดโดยกรมที่ดิน
            </p>
            <p>
              2. ค่าภาษีธุรกิจเฉพาะ (ยกเว้นเมื่อถือครองเกิน 5 ปี
              หรือมีชื่อในทะเบียนบ้านมากกว่า 1 ปี) = 3.3%
              ของราคาซื้อขายที่ไม่น้อยกว่าราคาประเมิน
            </p>
            <p>
              3. ค่าอากรแสตมป์ (ชำระระหว่างอากรแสตมป์หรือภาษีธุรกิจเฉพาะ) =
              0.50% ตามราคาซื้อขายที่ไม่น้อยกว่าราคาประเมิน
            </p>
            <p>
              4. ค่าภาษีเงินได้บุคคลธรรมดา (หัก ณ ที่จ่าย) =
              ปฏิบัติตามหลักเกณฑ์ของกรมสรรพากร
            </p>
            <p>
              5. ค่าจดจำนอง (ในกรณีจำนองกับสถาบันการเงิน) = 1% ของมูลค่าที่จำนอง
              (จำนวนเงินกู้ทั้งหมด)
            </p>
            <p>
              6. จำนวนปีที่ถือครอง (ภาษีธุรกิจเฉพาะ/อากรแสตมป์) =
              คำนวณปีแบบวันชนวัน เช่น ผู้ขายมีชื่อบนโฉนดตั้งแต่ 1 มิ.ย. 2561
              (2018) ต้องทำการโอนหลังจากวันที่ 1 มิ.ย. 2562 (2019)
              ซึ่งจะถือว่าเป็น 1 ปี คือ ต้องโอนตั้งแต่วันที่ 2 มิ.ย. 2562 (2019)
              เป็นต้นไป
            </p>
            <br />
            <p className="text-red-600 font-semibold">
              ค่าใช้จ่ายที่คำนวณในเว็บไซต์นี้อาจแตกต่างจากจำนวนเงินที่ท่านต้องชำระในวันโอน
              กรุณาปรึกษากับสำนักงานที่ดินในเขตพื้นที่ที่เกี่ยวข้องกับอสังหาริมทรัพย์ของผู้ขายอีกครั้ง
            </p>
          </div>
        </div>
      </div>

      <div id="property-form-all" className="hidden">
      <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">ผลการคำนวณสำหรับทั้งหมด</h2>
          <div
            style={{
              width: "100px",
              height: "70px",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <Image
              src={YoknewLogo}
              alt="ผลการคำนวณ"
              layout="fill"
              objectFit="contain"
            />
          </div>
        </div>

        <div className="mb-4 flex justify-between items-center">
          <p className="text-left">
            ระยะเวลาถือครอง: {results.holdingPeriod} ปี
            {detailedPeriod && (
              <span>
                {" "}
                ช่วงเวลา: {detailedPeriod.years} ปี {detailedPeriod.months}{" "}
                เดือน {detailedPeriod.days} วัน
              </span>
            )}
          </p>
          <div className="flex items-center text-yellow-600">
            <span className="mr-1">⚠️</span>
            <p>การคำนวณดังกล่าวเป็นเพียงการคำนวณเบื้องต้นเท่านั้น</p>
          </div>
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 text-left">รายการ</th>
              <th className="p-2 text-right">ผู้ซื้อจ่าย</th>
              <th className="p-2 text-right">ผู้ซื้อขาย</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2 border-b">
                ค่าธรรมเนียมการทำนิติกรรม (ค่าโอน)
              </td>
              <td className="p-2 border-b text-right">
                {formatCurrency(transferFeeShares.buyer)}
              </td>
              <td className="p-2 border-b text-right">
                {formatCurrency(transferFeeShares.seller)}
              </td>
            </tr>
            <tr>
              <td className="p-2 border-b">ค่าภาษีธุรกิจเฉพาะ</td>
              <td className="p-2 border-b text-right">
                {formatCurrency(specificTaxShares.buyer)}
              </td>
              <td className="p-2 border-b text-right">
                {formatCurrency(specificTaxShares.seller)}
              </td>
            </tr>
            <tr>
              <td className="p-2 border-b">ค่าอากรแสตมป์</td>
              <td className="p-2 border-b text-right">
                {formatCurrency(stampDutyShares.buyer)}
              </td>
              <td className="p-2 border-b text-right">
                {formatCurrency(stampDutyShares.seller)}
              </td>
            </tr>
            <tr>
              <td className="p-2 border-b">
                ภาษีเงินได้บุคคลธรรมดาของผู้ขาย (หัก ณ ที่จ่าย)
              </td>
              <td className="p-2 border-b text-right">
                {formatCurrency(withholdingTaxShares.buyer)}
              </td>
              <td className="p-2 border-b text-right">
                {formatCurrency(withholdingTaxShares.seller)}
              </td>
            </tr>
            <tr>
              <td className="p-2 border-b">
                ค่าจดจำนอง (กรณีจำนองกับสถาบันการเงิน)
              </td>
              <td className="p-2 border-b text-right">
                {formatCurrency(mortgageFeeShares.buyer)}
              </td>
              <td className="p-2 border-b text-right">
                {formatCurrency(mortgageFeeShares.seller)}
              </td>
            </tr>
            <tr className="font-bold bg-gray-100">
              <td className="p-2">รวมค่าใช้จ่ายทั้งหมด</td>
              <td className="p-2 text-right">{formatCurrency(buyerTotal)}</td>
              <td className="p-2 text-right">{formatCurrency(sellerTotal)}</td>
            </tr>
          </tbody>
        </table>
        <div className="flex flex-col justify-end">
          <div className="bg-yellow-300 text-black px-3 py-1 rounded-t-lg w-fit font-semibold">
            หมายเหตุ: วิธีการคำนวณ
          </div>

          <div className="border border-gray-300 bg-gray-100 p-4 rounded-b-lg col-span-2 text-sm">
            <p>
              1. ค่าธรรมเนียมการทำนิติกรรม (ค่าโอน) = 2%
              จากราคาประเมินที่กำหนดโดยกรมที่ดิน
            </p>
            <p>
              2. ค่าภาษีธุรกิจเฉพาะ (ยกเว้นเมื่อถือครองเกิน 5 ปี
              หรือมีชื่อในทะเบียนบ้านมากกว่า 1 ปี) = 3.3%
              ของราคาซื้อขายที่ไม่น้อยกว่าราคาประเมิน
            </p>
            <p>
              3. ค่าอากรแสตมป์ (ชำระระหว่างอากรแสตมป์หรือภาษีธุรกิจเฉพาะ) =
              0.50% ตามราคาซื้อขายที่ไม่น้อยกว่าราคาประเมิน
            </p>
            <p>
              4. ค่าภาษีเงินได้บุคคลธรรมดา (หัก ณ ที่จ่าย) =
              ปฏิบัติตามหลักเกณฑ์ของกรมสรรพากร
            </p>
            <p>
              5. ค่าจดจำนอง (ในกรณีจำนองกับสถาบันการเงิน) = 1% ของมูลค่าที่จำนอง
              (จำนวนเงินกู้ทั้งหมด)
            </p>
            <p>
              6. จำนวนปีที่ถือครอง (ภาษีธุรกิจเฉพาะ/อากรแสตมป์) =
              คำนวณปีแบบวันชนวัน เช่น ผู้ขายมีชื่อบนโฉนดตั้งแต่ 1 มิ.ย. 2561
              (2018) ต้องทำการโอนหลังจากวันที่ 1 มิ.ย. 2562 (2019)
              ซึ่งจะถือว่าเป็น 1 ปี คือ ต้องโอนตั้งแต่วันที่ 2 มิ.ย. 2562 (2019)
              เป็นต้นไป
            </p>
            <br />
            <p className="text-red-600 font-semibold">
              ค่าใช้จ่ายที่คำนวณในเว็บไซต์นี้อาจแตกต่างจากจำนวนเงินที่ท่านต้องชำระในวันโอน
              กรุณาปรึกษากับสำนักงานที่ดินในเขตพื้นที่ที่เกี่ยวข้องกับอสังหาริมทรัพย์ของผู้ขายอีกครั้ง
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default TaxResultsDisplay;
