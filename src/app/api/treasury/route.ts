import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';

const RESOURCE_ID = 'b115b105-58c6-4c3d-8ca8-687f7501e296';
const API_URL = 'https://catalog.treasury.go.th/api/3/action/datastore_search';
const MAX_DISPLAY_LIMIT = 1000;
const FETCH_TIMEOUT = 8000;

async function fetchFilteredRecords(search: string, offset: number, limit: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const fetchLimit = Math.min(limit, MAX_DISPLAY_LIMIT);
    const url = `${API_URL}?resource_id=${RESOURCE_ID}&q=${encodeURIComponent(search)}&limit=${fetchLimit}&offset=${offset}`;
    
    console.log('Fetching from URL:', url);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; NextJS/API)',
      },
      next: { revalidate: 0 }
    });

    clearTimeout(timeout); // ต้องเรียก clearTimeout() หลัง fetch สำเร็จ

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    console.log('Data received:', {
      totalRecords: data.result?.records?.length,
      hasResult: !!data.result,
      total: data.result?.total
    });

    const filteredRecords = data.result?.records?.filter((record: any) => {
      return search ? (record.project_name || '').toLowerCase().includes(search.toLowerCase()) : true;
    }) || [];

    return {
      records: filteredRecords,
      total: data.result?.total ?? 0,
      displayTotal: Math.min(data.result?.total ?? 0, MAX_DISPLAY_LIMIT)
    };
  } catch (error) {
    clearTimeout(timeout); // ต้องเรียก clearTimeout() ก่อนโยน error ออกไป
    console.error('Error in fetchFilteredRecords:', error instanceof Error ? error.message : 'Unknown error');
    throw error instanceof Error ? error : new Error('Unknown fetch error');
  }
}

export const config = {
  runtime: 'edge',
  regions: ['sin1'],
};

export async function GET(request: NextRequest) {
  try {
    console.log('Incoming request:', {
      url: request.url,
      headers: Object.fromEntries(request.headers.entries())
    });

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const offset = (page - 1) * limit; // แก้ไข offset calculation

    const { records, total, displayTotal } = await fetchFilteredRecords(search, offset, limit);

    return NextResponse.json({
      success: true,
      result: {
        total,
        displayTotal,
        hasSearch: Boolean(search),
        searchTerm: search,
        records
      }
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'no-store, max-age=0',
      }
    });

  } catch (error) {
    console.error('Error in GET handler:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      name: error instanceof Error ? error.name : 'UnknownError'
    });

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch data',
      errorDetails: {
        type: error instanceof Error ? error.name : 'UnknownError',
        timestamp: new Date().toISOString()
      }
    }, {
      status: error instanceof Error && error.name === 'AbortError' ? 504 : 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Cache-Control': 'no-store, max-age=0'
      }
    });
  }
}

// ✅ แก้ไข OPTIONS handler ให้ใช้ status 204 ตามมาตรฐาน CORS
export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}
