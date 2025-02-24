import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';

const RESOURCE_ID = 'b115b105-58c6-4c3d-8ca8-687f7501e296';
const API_URL = 'https://catalog.treasury.go.th/tl/api/3/action/datastore_search';
const MAX_DISPLAY_LIMIT = 1000;

async function fetchFilteredRecords(search: string, offset: number, limit: number) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000); // ลดลงเหลือ 9 วินาทีเพื่อให้ทันก่อน Vercel timeout

    const fetchLimit = Math.min(limit, MAX_DISPLAY_LIMIT);
    
    const url = `${API_URL}?resource_id=${RESOURCE_ID}&q=${encodeURIComponent(search)}&limit=${fetchLimit}&offset=${offset}`;
    
    // เพิ่ม headers และ cache options
    const response = await fetch(url, { 
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip',
      },
      cache: 'no-store'
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Failed to fetch data at offset ${offset}`);
    }

    const data = await response.json();
    
    const filteredRecords = data.result?.records?.filter((record: any) => {
      if (search) {
        const condoName = record.CONDO_NAME || '';
        return condoName.toLowerCase().includes(search.toLowerCase());
      }
      return true;
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
  regions: ['sin1'], // เพิ่ม region ใกล้ประเทศไทย
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    // ลดขนาด limit ลงเพื่อให้ทำงานได้เร็วขึ้น
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 50);
    
    const offset = Math.min((page - 1) * limit, MAX_DISPLAY_LIMIT);

    const { records, total, displayTotal } = await fetchFilteredRecords(search, offset, limit);

    // ปรับการใช้ Streaming Response ให้เร็วขึ้น
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const header = `{"success":true,"result":{"total":${total},"displayTotal":${displayTotal},"hasSearch":${Boolean(search)},"searchTerm":"${search}","records":[`;
        controller.enqueue(encoder.encode(header));

        // ส่งข้อมูลเป็น chunk เล็กๆ
        for (let i = 0; i < records.length; i++) {
          const chunk = JSON.stringify(records[i]);
          controller.enqueue(encoder.encode(i > 0 ? `,${chunk}` : chunk));
          
          // เพิ่ม delay เล็กน้อยทุกๆ 10 records เพื่อไม่ให้ใช้ resources มากเกินไป
          if (i > 0 && i % 10 === 0) {
            await new Promise(resolve => setTimeout(resolve, 10));
          }
        }

        controller.enqueue(encoder.encode(`]}}`));
        controller.close();
      }
    });

    // เพิ่ม headers ที่จำเป็น
    return new Response(stream, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });

  } catch (error) {
    console.error('Error in API handler:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}