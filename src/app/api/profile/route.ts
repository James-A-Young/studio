
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectToDatabase } from "@/db/mongo";
import { UserModel } from "@/db/user.model";


export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectToDatabase();
  const user = await UserModel.findOne({ email: session.user.email });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  return NextResponse.json({
    displayName: user.displayName || "",
    placeOfBirth: user.placeOfBirth || "",
    dateOfBirth: user.dateOfBirth || null,
    address: user.address || { address: "", postcode: "", city: "", country: "" },
    facNumber: user.facNumber || "",
    facExpiry: user.facExpiry || null,
    sgcNumber: user.sgcNumber || "",
    sgcExpiry: user.sgcExpiry || null,
    email: user.email,
    updatedAt: user.updatedAt,
    onSystem: user.onSystem,
    location: user.location || null
  });
}


export async function PUT(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { displayName, placeOfBirth, dateOfBirth, address, facNumber, facExpiry, sgcNumber, sgcExpiry } = await req.json();
  await connectToDatabase();
  const user = await UserModel.findOneAndUpdate(
    { email: session.user.email },
    { displayName, placeOfBirth, dateOfBirth, address, facNumber, facExpiry, sgcNumber, sgcExpiry, updatedAt: new Date() },
    { new: true }
  );
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  return NextResponse.json({
    displayName: user.displayName || "",
    placeOfBirth: user.placeOfBirth || "",
    dateOfBirth: user.dateOfBirth || null,
    address: user.address || { address: "", postcode: "", city: "", country: "" },
    facNumber: user.facNumber || "",
    facExpiry: user.facExpiry || null,
    sgcNumber: user.sgcNumber || "",
    sgcExpiry: user.sgcExpiry || null,
    email: user.email,
    updatedAt: user.updatedAt,
    onSystem: user.onSystem,
    location: user.location || null
  });
}
