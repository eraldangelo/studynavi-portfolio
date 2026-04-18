import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    {
      error: 'This endpoint is disabled. Recent reports are now loaded via the client Firebase SDK.',
    },
    { status: 410 }
  );
}
