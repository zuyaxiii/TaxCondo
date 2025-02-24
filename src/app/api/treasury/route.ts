import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';

const RESOURCE_ID = 'b115b105-58c6-4c3d-8ca8-687f7501e296';
const API_URL = 'https://catalog.treasury.go.th/tl/api/3/action/datastore_search';
const MAX_DISPLAY_LIMIT = 1000;

interface Record {
  CONDO_NAME: string;
  [key: string]: any;
}

async function fetchFilteredRecords(search: string, offset: number, limit: number) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);

    const fetchLimit = Math.min(limit, MAX_DISPLAY_LIMIT);
    
    // แยกการค้นหาเป็น 2 กรณี
    let url: string;
    if (search.trim()) {
      // กรณีมีการค้นหา
      url = `${API_URL}?resource_id=${RESOURCE_ID}&q=${encodeURIComponent(search.trim())}&limit=${fetchLimit}&offset=${offset}`;
    } else {
      // กรณีไม่มีการค้นหา
      url = `${API_URL}?resource_id=${RESOURCE_ID}&limit=${fetchLimit}&offset=${offset}`;
    }
    
    const response = await fetch(url, { 
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip',
      },
      // เปลี่ยนเป็น force-cache สำหรับการดึงข้อมูลทั้งหมด
      cache: search.trim() ? 'no-store' : 'force-cache'
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Failed to fetch data at offset ${offset}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error('API returned unsuccessful response');
    }

    let records = data.result?.records || [];

    // ทำการค้นหาเพิ่มเติมที่ client side ถ้าจำเป็น
    if (search.trim()) {
      records = records.filter((record: Record) => {
        const condoName = (record.CONDO_NAME || '').toLowerCase();
        return condoName.includes(search.trim().toLowerCase());
      });
    }

    return {
      records,
      total: search.trim() ? records.length : (data.result?.total ?? 0),
      displayTotal: Math.min(search.trim() ? records.length : (data.result?.total ?? 0), MAX_DISPLAY_LIMIT)
    };
  } catch (error) {
    console.error('Error fetching filtered data:', error);
    return { records: [], total: 0, displayTotal: 0 };
  }
}

export const config = {
  runtime: 'edge',
  regions: ['sin1'],
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 50);
    
    const offset = Math.min((page - 1) * limit, MAX_DISPLAY_LIMIT);

    const { records, total, displayTotal } = await fetchFilteredRecords(search, offset, limit);

    // ปรับการ stream ให้เร็วขึ้น
    return NextResponse.json({
      success: true,
      result: {
        total,
        displayTotal,
        hasSearch: Boolean(search.trim()),
        searchTerm: search,
        currentPage: page,
        limit,
        offset,
        records
      }
    }, {
      headers: {
        'Cache-Control': search.trim() ? 'no-cache' : 's-maxage=60, stale-while-revalidate=300'
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