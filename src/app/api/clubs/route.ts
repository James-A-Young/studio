import { NextRequest, NextResponse } from 'next/server';
import { ClubRepository } from '@/db/club.repository';

// GET /api/clubs?name=&discipline=&postcode=&distance=
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get('name') || '';
  const discipline = searchParams.get('discipline') || '';
  const postcode = searchParams.get('postcode') || '';
  const distance = searchParams.get('distance') || '';

  let userLocation: { lat: number; lng: number } | undefined = undefined;
  let distanceNum: number | undefined = undefined;

  // If postcode and distance provided, geocode postcode
  if (postcode && distance) {
    try {
      // Use postcodes.io for UK postcode geocoding
      const resp = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`);
      if (resp.ok) {
        const data = await resp.json();
        if (data && data.result) {
          userLocation = { lat: data.result.latitude, lng: data.result.longitude };
          distanceNum = parseFloat(distance);
        }
      }
    } catch (e) {
      // ignore geocode failure, fallback to text search
    }
  }

  const repo = new ClubRepository();
  const clubs = await repo.getFilteredClubs({
    name: name.trim() || undefined,
    discipline: discipline.replace("*","").trim() || undefined,
    postcode: postcode.trim() || undefined,
    distance: distanceNum,
    userLocation,
  });

  return NextResponse.json(clubs);
}
