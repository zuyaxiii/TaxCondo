import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const RESOURCE_ID = 'b115b105-58c6-4c3d-8ca8-687f7501e296';
const API_URL = 'https://catalog.treasury.go.th/tl/api/3/action/datastore_search';
const MAX_DISPLAY_LIMIT = 1000;
const FETCH_TIMEOUT = 9000;
const DEFAULT_LIMIT = 20;

async function fetchWithTimeout(url: string, timeout: number) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    return await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0',
        'Origin': 'https://tax-condo.vercel.app',
        'Referer': 'https://tax-condo.vercel.app/treasury'
      },
      cache: 'no-store',
      mode: 'cors',
      credentials: 'omit'
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function fetchFilteredRecords(search: string, offset: number, limit: number) {
  try {
    const fetchLimit = Math.min(limit, MAX_DISPLAY_LIMIT);
    const searchTerm = search.trim();
    const url = new URL(API_URL);
    url.searchParams.append('resource_id', RESOURCE_ID);
    if (searchTerm) {
      url.searchParams.append('q', searchTerm);
    }
    url.searchParams.append('limit', fetchLimit.toString());
    url.searchParams.append('offset', offset.toString());

    console.log('🌍 Fetching from:', url.toString());

    const response = await fetchWithTimeout(url.toString(), FETCH_TIMEOUT);

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
    console.error('❌ Error fetching filtered data:', error);
    throw error;
  }
}

export const config = {
  runtime: 'nodejs',
};

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || DEFAULT_LIMIT.toString(), 10), DEFAULT_LIMIT);
    const offset = Math.min((page - 1) * limit, MAX_DISPLAY_LIMIT);

    console.log('🔍 Request URL:', request.url);
    console.log('📌 Search:', search);
    console.log('📌 Page:', page);
    console.log('📌 Limit:', limit);
    console.log('📌 Offset:', offset);

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
        'Cache-Control': 's-maxage=600, stale-while-revalidate',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });

  } catch (error) {
    console.error('❌ Error in API handler:', error);
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
