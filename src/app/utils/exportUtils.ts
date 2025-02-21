import html2canvas from 'html2canvas';
import { ExportOptions } from '../api/types';

/**
 * ฟังก์ชันสำหรับ export element เป็นไฟล์ JPG
 * @param elementId - ID ของ element ที่ต้องการ export
 * @param options - ตัวเลือกเพิ่มเติมสำหรับการ export
 */
export const exportElementAsJpg = async (
  elementId: string, 
  options: ExportOptions = {}
): Promise<void> => {
  const {
    scale = 2,
    quality = 0.9,
    backgroundColor = '#ffffff',
    filename = `export-${new Date().toISOString().split('T')[0]}`,
    includeHeader = false,
    addWatermark = false,
    watermarkText = 'สำเนาเอกสาร'
  } = options;

  try {
    // หา element ที่ต้องการ export
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID "${elementId}" not found`);
    }

    // เตรียม element สำหรับ export (เพิ่ม header หรือ watermark ถ้าต้องการ)
    const exportElement = prepareElementForExport(element, {
      includeHeader,
      addWatermark,
      watermarkText
    });

    // สร้าง canvas จาก element
    const canvas = await html2canvas(exportElement, {
      scale,
      useCORS: true,
      logging: false,
      backgroundColor,
      allowTaint: true
    });

    // ลบ element ชั่วคราวถ้าสร้างใหม่
    if (exportElement !== element) {
      document.body.removeChild(exportElement);
    }

    // แปลง canvas เป็น data URL แบบ JPEG
    const dataUrl = canvas.toDataURL('image/jpeg', quality);

    // สร้าง link element สำหรับดาวน์โหลด
    downloadImage(dataUrl, `${filename}.jpg`);

    return Promise.resolve();
  } catch (error) {
    console.error('Error exporting element as JPG:', error);
    return Promise.reject(error);
  }
};

/**
 * ฟังก์ชันสำหรับเตรียม element ก่อน export
 * @private
 */
const prepareElementForExport = (
  originalElement: HTMLElement, 
  options: Pick<ExportOptions, 'includeHeader' | 'addWatermark' | 'watermarkText'>
): HTMLElement => {
  const { includeHeader, addWatermark, watermarkText } = options;
  
  // สร้าง element ใหม่สำหรับ export เสมอเพื่อหลีกเลี่ยงปัญหากับ hidden elements
  const exportWrapper = document.createElement('div');
  exportWrapper.id = 'temp-export-wrapper';
  exportWrapper.style.position = 'fixed';
  exportWrapper.style.left = '-9999px';
  exportWrapper.style.top = '-9999px';
  exportWrapper.style.background = '#ffffff';
  exportWrapper.style.padding = '20px';
  exportWrapper.style.width = `${originalElement.offsetWidth || 800}px`; // กำหนดความกว้างเริ่มต้นถ้า element เดิมไม่มีความกว้าง
  
  // คัดลอกเนื้อหาจาก element เดิม และทำให้แสดงผล
  const contentClone = originalElement.cloneNode(true) as HTMLElement;
  
  // ทำให้ element แสดงผล (ลบ class hidden)
  contentClone.classList.remove('hidden');
  contentClone.style.display = 'block';
  contentClone.style.visibility = 'visible';
  
  // รับรองว่า children ทั้งหมดแสดงผล
  const allHiddenElements = contentClone.querySelectorAll('.hidden');
  allHiddenElements.forEach(el => {
    (el as HTMLElement).classList.remove('hidden');
    (el as HTMLElement).style.display = 'block';
    (el as HTMLElement).style.visibility = 'visible';
  });
  
  // เพิ่มส่วนหัว (ถ้าต้องการ)
  if (includeHeader) {
    const header = document.createElement('div');
    header.style.marginBottom = '20px';
    header.style.borderBottom = '1px solid #eaeaea';
    header.style.paddingBottom = '10px';
    header.innerHTML = `
      <h2 style="color: #333; margin: 0; font-size: 18px;">ข้อมูลอสังหาริมทรัพย์</h2>
      <p style="color: #666; margin: 5px 0 0;">วันที่: ${new Date().toLocaleDateString('th-TH')}</p>
    `;
    exportWrapper.appendChild(header);
  }
  
  // เพิ่มเนื้อหา
  exportWrapper.appendChild(contentClone);
  
  // เพิ่มลายน้ำ (ถ้าต้องการ)
  if (addWatermark) {
    const watermark = document.createElement('div');
    watermark.style.position = 'absolute';
    watermark.style.top = '0';
    watermark.style.left = '0';
    watermark.style.width = '100%';
    watermark.style.height = '100%';
    watermark.style.display = 'flex';
    watermark.style.alignItems = 'center';
    watermark.style.justifyContent = 'center';
    watermark.style.pointerEvents = 'none';
    watermark.style.zIndex = '1000';
    watermark.innerHTML = `
      <div style="transform: rotate(-45deg); font-size: 48px; opacity: 0.1; color: #000;">${watermarkText}</div>
    `;
    exportWrapper.appendChild(watermark);
  }
  
  // เพิ่ม element ลงใน DOM
  document.body.appendChild(exportWrapper);
  
  return exportWrapper;
};

/**
 * ฟังก์ชันสำหรับดาวน์โหลดรูปภาพ
 * @private
 */
const downloadImage = (dataUrl: string, filename: string): void => {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    document.body.removeChild(link);
    window.URL.revokeObjectURL(dataUrl);
  }, 100);
};

/**
 * ฟังก์ชันสำหรับ export element เป็นไฟล์ PDF (ต้องติดตั้ง jspdf และ jspdf-autotable ก่อน)
 * หมายเหตุ: คุณต้องติดตั้ง npm install jspdf jspdf-autotable
 */
export const exportElementAsPdf = async (
  elementId: string,
  options: ExportOptions = {}
): Promise<void> => {
  try {
    // โหลด jsPDF แบบ dynamic import เพื่อประหยัดขนาดไฟล์หากไม่ได้ใช้
    const jsPDFModule = await import('jspdf');
    const jsPDF = jsPDFModule.default;
    
    const filename = options.filename || `export-${new Date().toISOString().split('T')[0]}`;
    const element = document.getElementById(elementId);
    
    if (!element) {
      throw new Error(`Element with ID "${elementId}" not found`);
    }
    
    // เตรียม element สำหรับ export โดยใช้ฟังก์ชันเดียวกับ JPG
    const exportElement = prepareElementForExport(element, {
      includeHeader: options.includeHeader,
      addWatermark: options.addWatermark,
      watermarkText: options.watermarkText
    });
    
    // สร้าง PDF ขนาด A4
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // ใช้ html2canvas เพื่อแปลง element เป็นรูปภาพก่อน
    const canvas = await html2canvas(exportElement, {
      scale: options.scale || 2,
      useCORS: true,
      logging: false,
      backgroundColor: options.backgroundColor || '#ffffff'
    });
    
    // ลบ element ชั่วคราวหลังจากใช้งานเสร็จ
    if (exportElement !== element) {
      document.body.removeChild(exportElement);
    }
    
    // คำนวณอัตราส่วนเพื่อให้พอดีกับหน้า A4
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // แปลง canvas เป็น data URL
    const imgData = canvas.toDataURL('image/jpeg', options.quality || 0.95);
    
    // เพิ่มรูปลงใน PDF
    pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
    
    // บันทึกไฟล์ PDF
    pdf.save(`${filename}.pdf`);
    
    return Promise.resolve();
  } catch (error) {
    console.error('Error exporting element as PDF:', error);
    
    if (error instanceof Error && error.message.includes('jspdf')) {
      console.warn('Please install jspdf first: npm install jspdf jspdf-autotable');
    }
    
    return Promise.reject(error);
  }
};