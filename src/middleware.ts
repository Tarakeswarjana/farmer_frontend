import { NextResponse, type NextRequest } from "next/server";
import { ROUTE_GUARDS, dashboardPath } from "@/lib/auth/roles";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const guard = ROUTE_GUARDS.find((item) => pathname === item.prefix || pathname.startsWith(`${item.prefix}/`));
  if (!guard) return NextResponse.next();

  const authed = request.cookies.get("vm_auth")?.value === "1";
  const role = decodeURIComponent(request.cookies.get("vm_role")?.value ?? "");
  if (!authed || !role) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  if (!guard.roles.includes(role as (typeof guard.roles)[number])) {
    const url = request.nextUrl.clone();
    url.pathname = dashboardPath(role);
    url.search = "";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/farmer/:path*", "/buyer/:path*", "/fpo/:path*", "/transporter/:path*", "/market/:path*", "/admin/:path*", "/messages/:path*", "/notifications/:path*", "/profile/:path*"],
};
