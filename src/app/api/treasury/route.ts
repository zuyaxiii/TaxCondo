import { NextResponse } from 'next/server';

const RESOURCE_ID = 'b115b105-58c6-4c3d-8ca8-687f7501e296';
const LIMIT = 5000;
const MAX_RECORDS = 122000; 
const API_URL = `https://catalog.treasury.go.th/tl/api/3/action/datastore_search`;

async function fetchRecords(offset: number, limit: number) {
  const response = await fetch(`${API_URL}?limit=${limit}&offset=${offset}&resource_id=${RESOURCE_ID}`);
  if (!response.ok) throw new Error(`Failed to fetch at offset ${offset}`);

  const data = await response.json();
  return data.result.records;
}

export async function GET() {
  try {
    const totalBatches = Math.ceil(MAX_RECORDS / LIMIT);
    const offsets = Array.from({ length: totalBatches }, (_, i) => i * LIMIT);

    console.log(`Fetching records in ${totalBatches} batches...`);

    const dataBatches = await Promise.all(offsets.map(offset => fetchRecords(offset, LIMIT)));

    const allRecords = dataBatches.flat(); 

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
