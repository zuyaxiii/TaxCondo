import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';

const RESOURCE_ID = 'b115b105-58c6-4c3d-8ca8-687f7501e296';
const API_URL = 'https://catalog.treasury.go.th/tl/api/3/action/datastore_search';
const MAX_DISPLAY_LIMIT = 1000; // จำกัดการแสดงผลสูงสุด 1000 รายการ

async function fetchFilteredRecords(search: string, offset: number, limit: number) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // ตั้งเวลา timeout เป็น 30 วินาที

    // จำกัดการดึงข้อมูลต่อครั้งไม่เกิน 1000 รายการ
    const fetchLimit = Math.min(limit, MAX_DISPLAY_LIMIT);
    
    // เพิ่มพารามิเตอร์ในการค้นหาชื่อคอนโด
    const url = `${API_URL}?resource_id=${RESOURCE_ID}&q=${encodeURIComponent(search)}&limit=${fetchLimit}&offset=${offset}`;
    const response = await fetch(url, { signal: controller.signal });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Failed to fetch data at offset ${offset}`);
    }

    const data = await response.json();
    
    // กรองข้อมูลตามชื่อคอนโด
    const filteredRecords = data.result?.records?.filter((record: any) => {
      // ถ้ามีการค้นหา ให้กรองเฉพาะคอนโดที่มีชื่อตรงกับคำค้นหา
      if (search) {
        const condoName = record.CONDO_NAME || ''; // ปรับตามชื่อฟิลด์จริงในข้อมูล
        return condoName.toLowerCase().includes(search.toLowerCase());
      }
      return true; // ถ้าไม่มีการค้นหา แสดงทั้งหมด
    }) || [];

    return {
      records: filteredRecords,
      total: data.result?.total ?? 0,
      displayTotal: Math.min(data.result?.total ?? 0, MAX_DISPLAY_LIMIT)
    };
  } catch (error) {
    console.error('Error fetching filtered data:', error);
    return { records: [], total: 0, displayTotal: 0 };
  }
}

export const config = {
  runtime: 'edge',
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || ''; // คำค้นหาชื่อคอนโด
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    
    // คำนวณ offset โดยตรวจสอบไม่ให้เกิน MAX_DISPLAY_LIMIT
    const offset = Math.min((page - 1) * limit, MAX_DISPLAY_LIMIT);

    const { records, total, displayTotal } = await fetchFilteredRecords(search, offset, limit);

    // ใช้ Streaming Response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        try {
          controller.enqueue(encoder.encode(`{
            "success": true,
            "result": {
              "total": ${total},
              "displayTotal": ${displayTotal},
              "hasSearch": ${Boolean(search)},
              "searchTerm": "${search}",
              "records": [`));

          records.forEach((record: any, index: number) => {
            const chunk = JSON.stringify(record);
            controller.enqueue(encoder.encode(index > 0 ? `,${chunk}` : chunk));
          });

          controller.enqueue(encoder.encode(`]}}`));
        } catch (error) {
          console.error('Error in streaming response:', error);
          controller.enqueue(encoder.encode(`]}}`));
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in API handler:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}
