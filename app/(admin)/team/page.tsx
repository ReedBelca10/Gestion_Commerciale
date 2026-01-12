"use client"

import { useState, useEffect } from "react"

export default function TeamPage() {
    const [users, setUsers] = useState<any[]>([])
    const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "VENDEUR" })

    const fetchUsers = async () => {
        const res = await fetch("/api/users")
        if (res.ok) setUsers(await res.json())
    }

    useEffect(() => { fetchUsers() }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await fetch("/api/users", {
            method: "POST",
            body: JSON.stringify(formData)
        })
        setFormData({ ...formData, name: "", email: "" }) // Reset partiel
        fetchUsers()
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6 text-indigo-900">Mon Équipe</h1>

            <div className="bg-white p-6 rounded-xl shadow-sm border mb-8">
                <h2 className="font-semibold mb-4">Nouveau Membre</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <input placeholder="Nom" className="border p-2 rounded" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    <input placeholder="Email" className="border p-2 rounded" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                    <input placeholder="Mot de passe" type="password" className="border p-2 rounded" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                    <select className="border p-2 rounded" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                        <option value="VENDEUR">Vendeur</option>
                        <option value="MAGASINIER">Magasinier</option>
                        <option value="GERANT">Gérant</option>
                    </select>
                    <button className="bg-indigo-600 text-white px-4 py-2 rounded">Créer</button>
                </form>
            </div>

            <div className="bg-white rounded-xl shadow-sm border">
                {users.map((u: any) => (
                    <div key={u.id} className="p-4 border-b flex justify-between">
                        <div>
                            <div className="font-bold">{u.name}</div>
                            <div className="text-sm text-gray-500">{u.email}</div>
                        </div>
                        <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold self-center">{u.role}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
