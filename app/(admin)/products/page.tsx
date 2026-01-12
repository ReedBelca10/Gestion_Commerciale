"use client"

import { useState, useEffect } from "react"

export default function ProductsPage() {
    const [products, setProducts] = useState<any[]>([])
    const [formData, setFormData] = useState({ name: "", price: "", stock: "" })
    const [loading, setLoading] = useState(false)

    const fetchProducts = async () => {
        const res = await fetch("/api/products")
        if (res.ok) setProducts(await res.json())
    }

    useEffect(() => { fetchProducts() }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        await fetch("/api/products", {
            method: "POST",
            body: JSON.stringify({
                name: formData.name,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock)
            })
        })
        setFormData({ name: "", price: "", stock: "" })
        fetchProducts()
        setLoading(false)
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6 text-indigo-900">Gestion des Produits</h1>

            {/* Formulaire Création */}
            <div className="bg-white p-6 rounded-xl shadow-sm border mb-8">
                <h2 className="font-semibold mb-4">Ajouter un produit</h2>
                <form onSubmit={handleSubmit} className="flex gap-4 items-end">
                    <div>
                        <label className="block text-sm text-gray-600">Nom</label>
                        <input className="border p-2 rounded" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-600">Prix (€)</label>
                        <input className="border p-2 rounded w-24" type="number" step="0.01" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-600">Stock</label>
                        <input className="border p-2 rounded w-24" type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} />
                    </div>
                    <button type="submit" disabled={loading} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                        Ajouter
                    </button>
                </form>
            </div>

            {/* Liste */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-indigo-50 text-indigo-900">
                        <tr>
                            <th className="p-4">Nom</th>
                            <th className="p-4">Prix</th>
                            <th className="p-4">Stock</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((p: any) => (
                            <tr key={p.id} className="border-t">
                                <td className="p-4">{p.name}</td>
                                <td className="p-4">{p.price} €</td>
                                <td className="p-4 font-bold">{p.stock}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
