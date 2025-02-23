import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';

const RESOURCE_ID = 'b115b105-58c6-4c3d-8ca8-687f7501e296';
const API_URL = 'https://catalog.treasury.go.th/tl/api/3/action/datastore_search';
const MAX_DISPLAY_LIMIT = 1000;
const FETCH_TIMEOUT = 9000; // ลดเวลา timeout ให้น้อยกว่า Vercel (10 วินาที)

async function fetchFilteredRecords(search: string, offset: number, limit: number) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
      throw new Error('Request timeout');
    }, FETCH_TIMEOUT);

    const fetchLimit = Math.min(limit, MAX_DISPLAY_LIMIT);
    
    const url = `${API_URL}?resource_id=${RESOURCE_ID}&q=${encodeURIComponent(search)}&limit=${fetchLimit}&offset=${offset}`;
    
    let retries = 3;
    let response;
    
    while (retries > 0) {
      try {
        response = await fetch(url, { 
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'Accept-Encoding': 'gzip, deflate'
          }
        });
    
        if (response.ok) break;
        
        retries--;
        if (retries === 0) {
          throw new Error(`Failed after 3 retries`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000)); 
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        throw error;
      }
    }   

    clearTimeout(timeout);

    if (!response?.ok) {
      throw new Error(`Failed to fetch data at offset ${offset}`);
    }

    const data = await response.json();
    
    const filteredRecords = data.result?.records?.filter((record: any) => {
      if (search) {
        const condoName = record.project_name || '';
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
    throw error; // ส่ง error ไปจัดการที่ handler หลัก
  }
}

export const config = {
  runtime: 'edge',
  regions: ['sin1'], // เลือก region ที่ใกล้ประเทศไทย
  maxDuration: 10 // กำหนด timeout เป็น 10 วินาที
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    const offset = Math.min((page - 1) * limit, MAX_DISPLAY_LIMIT);

    const { records, total, displayTotal } = await fetchFilteredRecords(search, offset, limit);

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
          const errorMessage = error instanceof Error ? error.message : 'Unknown streaming error';
          controller.enqueue(encoder.encode(`],
            "error": "${errorMessage}"
          }}`));
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0'
      }
    });
  } catch (error) {
    console.error('Error in API handler:', error);

    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch data',
        timestamp: new Date().toISOString()
      }, 
      { 
        status: error instanceof Error && error.name === 'AbortError' ? 504 : 500,
        headers: {
          'Cache-Control': 'no-store, max-age=0'
        }
      }
    );
  }
}
