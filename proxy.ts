import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Home route for an account, decided by its type. Keep in sync with the
// server-side guards in app/creator/page.tsx and app/customer/page.tsx.
function homeForType(type: unknown): string {
  return type === "Creator" ? "/creator" : "/customer";
}

export default withAuth(
  function proxy(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const path = req.nextUrl.pathname;
    const isAuthPage = path.startsWith("/auth");

    // Authenticated users shouldn't sit on the sign-in page — send them to the
    // dashboard that matches their actual account type (server-side, no flash).
    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL(homeForType(token?.type), req.url));
      }
      return null;
    }

    // Unauthenticated users hitting a protected route go to sign-in.
    if (!isAuth) {
      let from = path;
      if (req.nextUrl.search) {
        from += req.nextUrl.search;
      }
      return NextResponse.redirect(
        new URL(`/auth/signin?from=${encodeURIComponent(from)}`, req.url)
      );
    }

    // Enforce account-type routing at the edge so a Creator can never land on
    // the Customer dashboard (or vice-versa) — this prevents the wrong-dashboard
    // flicker entirely. We compare against the *opposite* type so an undefined
    // type never triggers a redirect loop.
    if (path.startsWith("/creator") && token?.type === "Customer") {
      return NextResponse.redirect(new URL("/customer", req.url));
    }
    if (path.startsWith("/customer") && token?.type === "Creator") {
      return NextResponse.redirect(new URL("/creator", req.url));
    }

    return null;
  },
  {
    callbacks: {
      // Authorization is handled inside the proxy function above.
      authorized: () => true,
    },
  }
);

// Routes this proxy (middleware) runs on.
export const config = {
  matcher: [
    "/creator",
    "/creator/:path*",
    "/customer",
    "/customer/:path*",
    "/dashboard/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/auth/:path*",
  ],
};
