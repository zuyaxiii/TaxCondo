import { NextResponse } from 'next/server';

const RESOURCE_ID = 'b115b105-58c6-4c3d-8ca8-687f7501e296';
const LIMIT = 9999; 
const MAX_RECORDS = 122000; 
const API_URL = `https://catalog.treasury.go.th/tl/api/3/action/datastore_search`;

async function fetchRecords(offset: number, limit: number) {
  const response = await fetch(`${API_URL}?limit=${limit}&offset=${offset}&resource_id=${RESOURCE_ID}`);
  if (!response.ok) throw new Error(`Failed to fetch at offset ${offset}`);
  
  const data = await response.json();
  return data.result.records;
}

async function fetchAllRecords() {
  const totalBatches = Math.ceil(MAX_RECORDS / LIMIT);
  const offsets = Array.from({ length: totalBatches }, (_, i) => i * LIMIT);
  const batchLimit = 5;
  const allRecords: any[] = [];

  for (let i = 0; i < offsets.length; i += batchLimit) {
    const currentBatch = offsets.slice(i, i + batchLimit);
    const fetchPromises = currentBatch.map(offset => fetchRecords(offset, LIMIT));
    
    const results = await Promise.allSettled(fetchPromises);

    results.forEach(result => {
      if (result.status === 'fulfilled') {
        allRecords.push(...result.value);
      } else {
        console.error('Error fetching data:', result.reason);
      }
    });
  }

  return allRecords;
}

export async function GET() {
  try {
    console.log(`Fetching records...`);
    const allRecords = await fetchAllRecords();

    return NextResponse.json({
      success: true,
      result: {
        records: allRecords,
        total: allRecords.length
      }
    });
  } catch (error) {
    console.error('Error details:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
