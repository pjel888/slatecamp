import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);
  
  // If the response is a redirect, don't modify it
  if (response.status >= 300 && response.status < 400) return response;

  // Add path header for layouts after updateSession has propagated any
  // refreshed Supabase cookies onto the request seen by Server Components.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', request.nextUrl.pathname);

  const finalResponse = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Copy cookies from updateSession response
  response.cookies.getAll().forEach(cookie => {
    finalResponse.cookies.set(cookie.name, cookie.value, cookie);
  });

  return finalResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
