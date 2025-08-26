import { NextRequest, NextResponse } from 'next/server';
import { ClubRepository } from '@/db/club.repository';

// GET /api/clubs/[name]
export async function GET(
  req: NextRequest,
  { params }: { params: { name: string } }
) {
  const name = decodeURIComponent(params.name);
  if (!name) {
    return NextResponse.json({ error: 'Missing club name' }, { status: 400 });
  }
  const repo = new ClubRepository();
  try {
    const club = await repo.getClubByName(name);
    if (!club) {
      return NextResponse.json({ error: 'Club not found' }, { status: 404 });
    }
    return NextResponse.json(club);
  } catch (err) {
    return NextResponse.json({ error: 'Server error', details: (err as Error).message }, { status: 500 });
  }
}
