import Link from "next/link"
import { LayoutDashboard, Users, Settings, LogOut } from "lucide-react"

export default function SuperAdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col">
                <div className="p-6 border-b border-slate-800">
                    <h1 className="text-xl font-bold">SuperAdmin</h1>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <Link href="/superadmin" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition">
                        <LayoutDashboard size={20} />
                        <span>Tableau de Bord</span>
                    </Link>
                    <Link href="/superadmin/users" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition">
                        <Users size={20} />
                        <span>Utilisateurs</span>
                    </Link>
                    <Link href="/superadmin/settings" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition">
                        <Settings size={20} />
                        <span>Paramètres</span>
                    </Link>
                </nav>
                <div className="p-4 border-t border-slate-800">
                    <Link href="/api/auth/signout" className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-slate-800 rounded-lg transition">
                        <LogOut size={20} />
                        <span>Déconnexion</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                {children}
            </main>
        </div>
    )
}
