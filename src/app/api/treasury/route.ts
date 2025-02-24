import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';

const RESOURCE_ID = 'b115b105-58c6-4c3d-8ca8-687f7501e296';
const API_URL = 'https://catalog.treasury.go.th/tl/api/3/action/datastore_search';
const MAX_DISPLAY_LIMIT = 1000;

async function fetchFilteredRecords(search: string, offset: number, limit: number) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);

    const fetchLimit = Math.min(limit, MAX_DISPLAY_LIMIT);
    
    // ปรับ URL และ encoding
    const searchTerm = search.trim();
    const url = new URL(API_URL);
    url.searchParams.append('resource_id', RESOURCE_ID);
    if (searchTerm) {
      url.searchParams.append('q', searchTerm);
    }
    url.searchParams.append('limit', fetchLimit.toString());
    url.searchParams.append('offset', offset.toString());

    const response = await fetch(url.toString(), { 
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip',
        'User-Agent': 'Mozilla/5.0',
        'Origin': 'https://tax-condo.vercel.app',
        'Referer': 'https://tax-condo.vercel.app/treasury' 
      },
      cache: 'no-store',
      mode: 'cors',
      credentials: 'omit'
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error('API returned unsuccessful response');
    }

    const records = data.result?.records || [];
    const total = records.length;

    return {
      records,
      total,
      displayTotal: Math.min(total, MAX_DISPLAY_LIMIT)
    };
  } catch (error) {
    console.error('Error fetching filtered data:', error);
    throw error; // ส่งต่อ error ไปให้ handler จัดการ
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
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET'
      }
    });

  } catch (error) {
    console.error('Error in API handler:', error);
    // ส่ง error message ที่ละเอียดขึ้น
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch data',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, {
      status: 500
    });
  }
}