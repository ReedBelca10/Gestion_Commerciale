import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function SuperAdminPage() {
    const session = await getServerSession(authOptions)

    if (session?.user?.role !== 'SUPERADMIN') {
        // Middleware handles it mostly, but double check
        return <div>Unauthorized</div>
    }

    const tenants = await prisma.tenant.findMany({
        include: {
            _count: {
                select: { users: true, products: true, sales: true }
            }
        }
    })

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">SuperAdmin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <h3 className="text-gray-500 text-sm font-medium">Total Commerces</h3>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{tenants.length}</p>
                </div>
                {/* Ajouter d'autres stats globales si besoin */}
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
                    <h2 className="font-semibold text-gray-700">Liste des Commerces</h2>
                    <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">
                        + Nouveau Commerce
                    </button>
                </div>
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500">
                        <tr>
                            <th className="px-6 py-3 font-medium">Nom</th>
                            <th className="px-6 py-3 font-medium">Slug</th>
                            <th className="px-6 py-3 font-medium">Utilisateurs</th>
                            <th className="px-6 py-3 font-medium">Ventes</th>
                            <th className="px-6 py-3 font-medium">Créé le</th>
                            <th className="px-6 py-3 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {tenants.map(tenant => (
                            <tr key={tenant.id} className="hover:bg-gray-50">
                                <td className="px-6 py-3 font-medium text-gray-900">{tenant.name}</td>
                                <td className="px-6 py-3 text-gray-500">{tenant.slug}</td>
                                <td className="px-6 py-3 text-gray-500">{tenant._count.users}</td>
                                <td className="px-6 py-3 text-gray-500">{tenant._count.sales}</td>
                                <td className="px-6 py-3 text-gray-500">{new Date(tenant.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-3 text-right">
                                    <button className="text-indigo-600 hover:text-indigo-900">Gérer</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
