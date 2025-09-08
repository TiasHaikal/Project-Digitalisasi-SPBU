// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  // Kalau route sudah diproteksi tapi token kosong → lempar ke forbidden
  if (!token) {
    const forbiddenUrl = new URL("/forbidden", req.url);
    return NextResponse.redirect(forbiddenUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*", // semua route admin
    "/supervisor/:path*", // semua route supervisor
    "/operator/:path*", // semua route operator
    "/ob/:path*", // semua route ob
    "/satpam/:path*", // semua route satpam
  ],
};
