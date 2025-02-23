import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';

const RESOURCE_ID = 'b115b105-58c6-4c3d-8ca8-687f7501e296';
const API_URL = 'https://catalog.treasury.go.th/tl/api/3/action/datastore_search';

// Fetch data with timeout (5s)
async function fetchFilteredRecords(search: string, offset: number, limit: number) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout

    const url = `${API_URL}?resource_id=${RESOURCE_ID}&q=${encodeURIComponent(search)}&limit=${limit}&offset=${offset}`;
    const response = await fetch(url, { signal: controller.signal });

    clearTimeout(timeout); // Clear timeout if fetch is successful

    if (!response.ok) {
      throw new Error(`Failed to fetch data at offset ${offset}`);
    }

    const data = await response.json();
    return {
      records: data.result?.records || [],
      total: data.result?.total ?? 0, // Ensure total is a valid number
    };
  } catch (error) {
    console.error('Error fetching filtered data:', error);
    return { records: [], total: 0 };
  }
}

// Use Edge Function for better performance
export const config = {
  runtime: 'edge',
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const offset = (page - 1) * limit;

    const { records, total } = await fetchFilteredRecords(search, offset, limit);

    // Use Streaming Response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        try {
          // Open JSON
          controller.enqueue(encoder.encode(`{"success": true, "result": { "total": ${total}, "records": [`));

          records.forEach((record: any, index: number) => {
            const chunk = JSON.stringify(record);
            controller.enqueue(encoder.encode(index > 0 ? `,${chunk}` : chunk));
          });

          // Close JSON
          controller.enqueue(encoder.encode(`]}}`));
        } catch (error) {
          console.error('Error in streaming response:', error);
          controller.enqueue(encoder.encode(`]}}`)); // Close JSON on error
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in API handler:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch data' }, { status: 500 });
  }
}
