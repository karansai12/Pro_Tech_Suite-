import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;
const PUBLIC_API = ["/api/login", "/api/signup", "/api/logout"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    PUBLIC_API.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`),
    )
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value;

  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Not Authorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login-page", request.url));
  }

  try {
    jwt.verify(token, JWT_SECRET);
    return NextResponse.next();
  } catch {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login-page", request.url));
  }
}

export const config = {
  matcher: [
    "/api/:path*",
    "/employee-page/:path*",
    "/project-page/:path*",
    "/projectTable-page/:path*",
    "/task-page/:path*",
    "/taskTable-page/:path*",
  ],
};
