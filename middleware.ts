import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token
        const path = req.nextUrl.pathname

        // Protection Superadmin
        if (path.startsWith("/superadmin")) {
            if (token?.role !== "SUPERADMIN") {
                return NextResponse.redirect(new URL("/login", req.url))
            }
        }

        // Protection Admin (Directeur)
        if (path.startsWith("/admin")) {
            if (token?.role !== "DIRECTEUR") {
                return NextResponse.redirect(new URL("/login", req.url))
            }
        }

        // Protection App (Vendeur/Magasinier)
        if (path.startsWith("/app")) {
            if (!["DIRECTEUR", "GERANT", "VENDEUR", "MAGASINIER"].includes(token?.role as string)) {
                return NextResponse.redirect(new URL("/login", req.url))
            }
            // Verifier TenantId
            if (!token?.tenantId) {
                return NextResponse.redirect(new URL("/login?error=NoTenant", req.url))
            }
        }
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
)

export const config = {
    matcher: ["/superadmin/:path*", "/admin/:path*", "/app/:path*"],
}
