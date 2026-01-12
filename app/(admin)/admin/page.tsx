import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export default async function AdminDashboardPage() {
    const session = await getServerSession(authOptions)

    const tenantId = session?.user?.tenantId
    if (!tenantId) return <div>Erreur: Pas de commerce associé</div>

    // Récupérer stats
    const salesCount = await prisma.sale.count({ where: { tenantId } })
    const productsCount = await prisma.product.count({ where: { tenantId } })
    // Calcul CA total (Attention: Decimal)
    const sales = await prisma.sale.findMany({
        where: { tenantId },
        select: { total: true }
    })
    const totalRevenue = sales.reduce((acc: number, sale: any) => acc + Number(sale.total), 0)

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8 text-indigo-900">Vue d'ensemble</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-100">
                    <h3 className="text-indigo-500 text-sm font-medium uppercase">Chiffre d'Affaires</h3>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{totalRevenue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-100">
                    <h3 className="text-indigo-500 text-sm font-medium uppercase">Ventes Totales</h3>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{salesCount}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-100">
                    <h3 className="text-indigo-500 text-sm font-medium uppercase">Produits en Stock</h3>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{productsCount}</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border">
                <h2 className="text-lg font-semibold mb-4 text-gray-800">Dernières Ventes</h2>
                <p className="text-gray-500 italic">Implémentation du tableau des dernières ventes ici...</p>
                {/* Liste des dernières ventes */}
            </div>
        </div>
    )
}
