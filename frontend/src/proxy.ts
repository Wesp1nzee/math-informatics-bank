import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function firstForwardedIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

function clean(value: string): string {
  return value.replace(/[\r\n]+/g, " ").slice(0, 300);
}

export function proxy(request: NextRequest) {
  const path = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  const userAgent = clean(request.headers.get("user-agent") ?? "-");

  console.log(
    `[next] ${new Date().toISOString()} ${clean(firstForwardedIp(request))} ` +
      `${request.method} ${clean(path)} ua="${userAgent}"`,
  );

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|_next/webpack-hmr|favicon.ico|icon.png|apple-icon.png|og/).*)",
  ],
};
