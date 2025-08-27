import { NextRequest, NextResponse } from 'next/server';
import { ClubRepository } from '@/db/club.repository';
import { getServerSession } from "next-auth";
// GET /api/clubs/foruser
export async function GET(req: NextRequest)
{
  const session = await getServerSession();
  if (!session) {
    // return 401
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const repo = new ClubRepository();
  const club = await repo.GetClubsForUser(session.user?.id || '');
  
  if (!club) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  }
  return NextResponse.json(club);
}