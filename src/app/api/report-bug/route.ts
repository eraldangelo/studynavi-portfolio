import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    {
      error: 'This endpoint is disabled. Report submission is now handled by the client Firebase SDK.',
    },
    { status: 410 }
  );
}
