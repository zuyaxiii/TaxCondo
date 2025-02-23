import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';

const RESOURCE_ID = 'b115b105-58c6-4c3d-8ca8-687f7501e296';
const API_URL = 'https://catalog.treasury.go.th/tl/api/3/action/datastore_search';

// Function to fetch filtered records from API directly
async function fetchFilteredRecords(search: string, offset: number, limit: number) {
  try {
    const url = `${API_URL}?resource_id=${RESOURCE_ID}&q=${encodeURIComponent(search)}&limit=${limit}&offset=${offset}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch data at offset ${offset}`);
    }

    const data = await response.json();
    return {
      records: data.result.records || [],
      total: data.result.total || 0
    };
  } catch (error) {
    console.error('Error fetching filtered data:', error);
    return { records: [], total: 0 };
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = (page - 1) * limit;

    // Fetch only relevant data instead of all records
    const { records, total } = await fetchFilteredRecords(search, offset, limit);

    return NextResponse.json({
      success: true,
      result: {
        records,
        total,
      }
    });

  } catch (error) {
    console.error('Error details:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}
