import Link from "next/link"
import { LayoutDashboard, Users, ShoppingBag, Settings, LogOut } from "lucide-react"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen bg-gray-50">
            <aside className="w-64 bg-indigo-900 text-white flex flex-col">
                <div className="p-6 border-b border-indigo-800">
                    <h1 className="text-xl font-bold">Gestion Commerce</h1>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-indigo-800 transition">
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </Link>
                    <Link href="/admin/team" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-indigo-800 transition">
                        <Users size={20} />
                        <span>Équipe</span>
                    </Link>
                    <Link href="/admin/products" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-indigo-800 transition">
                        <ShoppingBag size={20} />
                        <span>Produits</span>
                    </Link>
                </nav>
                <div className="p-4 border-t border-indigo-800">
                    <Link href="/api/auth/signout" className="flex items-center gap-3 px-4 py-3 text-red-300 hover:bg-indigo-800 rounded-lg transition">
                        <LogOut size={20} />
                        <span>Déconnexion</span>
                    </Link>
                </div>
            </aside>
            <main className="flex-1 overflow-auto p-8">
                {children}
            </main>
        </div>
    )
}
