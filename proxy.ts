import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["en", "id"];

/**
 * Locale lives in a cookie, not the URL. Legacy `/<lang>/...` links are
 * rewritten so they keep working while the address bar shows the clean path.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const match = pathname.match(/^\/(en|id)(\/.*)?$/);

  if (!match) return;

  const locale = match[1];
  const rest = match[2] ?? "/";

  const url = request.nextUrl.clone();
  url.pathname = rest;

  const response = NextResponse.redirect(url);
  response.cookies.set("nutaraline.locale", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  return response;
}

export const config = {
  matcher: ["/en/:path*", "/id/:path*"],
};

export { locales };
