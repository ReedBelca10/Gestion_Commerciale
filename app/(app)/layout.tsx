import Link from "next/link"
import { ShoppingCart, Package, LogOut } from "lucide-react"

export default function AppLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex flex-col h-screen bg-white">
            {/* Header */}
            <header className="h-16 border-b flex items-center justify-between px-6 bg-white shadow-sm z-10">
                <div className="font-bold text-xl text-indigo-600">POS System</div>
                <nav className="flex items-center gap-6">
                    <Link href="/app" className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 font-medium">
                        <ShoppingCart size={20} />
                        Caisse
                    </Link>
                    <Link href="/app/stock" className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 font-medium">
                        <Package size={20} />
                        Stock
                    </Link>
                    <Link href="/api/auth/signout" className="flex items-center gap-2 text-red-500 hover:text-red-600 font-medium">
                        <LogOut size={18} />
                        Quitter
                    </Link>
                </nav>
            </header>
            {/* Content */}
            <main className="flex-1 overflow-hidden relative">
                {children}
            </main>
        </div>
    )
}
