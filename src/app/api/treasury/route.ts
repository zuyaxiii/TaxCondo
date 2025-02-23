// app/api/treasury/route.ts
import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';

const RESOURCE_ID = 'b115b105-58c6-4c3d-8ca8-687f7501e296';
const API_URL = 'https://catalog.treasury.go.th/tl/api/3/action/datastore_search';

// Function to fetch all records with pagination
async function fetchAllRecords() {
  let allRecords: any[] = [];
  let offset = 0;
  const limit = 1000; // Fetch 1000 records at a time
  let hasMore = true;

  while (hasMore) {
    try {
      const response = await fetch(
        `${API_URL}?resource_id=${RESOURCE_ID}&limit=${limit}&offset=${offset}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch data at offset ${offset}`);
      }

      const data = await response.json();
      const records = data.result.records;
      
      if (records.length === 0) {
        hasMore = false;
      } else {
        allRecords = [...allRecords, ...records];
        offset += limit;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      hasMore = false;
    }
  }

  return allRecords;
}

// Cache for storing fetched records
let cachedRecords: any[] | null = null;
let lastFetchTime: number | null = null;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

export async function GET(request: NextRequest) {
  try {
    // Check if we need to refresh the cache
    const currentTime = Date.now();
    if (!cachedRecords || !lastFetchTime || currentTime - lastFetchTime > CACHE_DURATION) {
      cachedRecords = await fetchAllRecords();
      lastFetchTime = currentTime;
    }

    // Get search parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');

    // Filter records based on search term
    let filteredRecords = cachedRecords;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredRecords = cachedRecords.filter(record => 
        record.CONDO_NAME && 
        record.CONDO_NAME.toLowerCase().includes(searchLower)
      );
    }

    // Calculate pagination
    const start = (page - 1) * limit;
    const paginatedRecords = filteredRecords.slice(start, start + limit);

    return NextResponse.json({
      success: true,
      result: {
        records: paginatedRecords,
        total: filteredRecords.length,
        totalRecords: cachedRecords.length
      }
    });

  } catch (error) {
    console.error('Error details:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch data', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}