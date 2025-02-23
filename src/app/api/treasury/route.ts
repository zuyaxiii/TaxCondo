import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';

const RESOURCE_ID = 'b115b105-58c6-4c3d-8ca8-687f7501e296';
const DEFAULT_PAGE_SIZE = 20;
const API_URL = 'https://catalog.treasury.go.th/tl/api/3/action/datastore_search';

interface SearchParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

async function fetchPagedRecords({ page = 1, pageSize = DEFAULT_PAGE_SIZE, search = '' }: SearchParams) {
  const offset = (page - 1) * pageSize;
  
  // Build query parameters
  const params = new URLSearchParams({
    resource_id: RESOURCE_ID,
    limit: pageSize.toString(),
    offset: offset.toString(),
  });

  // Add search parameter if provided
  if (search) {
    params.append('q', search);
  }

  const response = await fetch(`${API_URL}?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.statusText}`);
  }

  const data = await response.json();
  
  return {
    records: data.result.records,
    total: data.result.total,
    currentPage: page,
    pageSize: pageSize,
    totalPages: Math.ceil(data.result.total / pageSize)
  };
}

export async function GET(request: NextRequest) {
  try {
    // Get search parameters from URL
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || String(DEFAULT_PAGE_SIZE));
    const search = searchParams.get('search') || '';

    const result = await fetchPagedRecords({ page, pageSize, search });

    return NextResponse.json({
      success: true,
      result
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