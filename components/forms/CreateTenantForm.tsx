"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"

const tenantSchema = z.object({
    name: z.string().min(2, "Le nom doit faire au moins 2 caractères"),
    slug: z.string().min(2, "Le slug doit faire au moins 2 caractères").regex(/^[a-z0-9-]+$/, "Lettres minuscules, chiffres et tirets uniquement"),
    adminName: z.string().min(2, "Le nom du directeur est requis"),
    adminEmail: z.string().email("Email invalide"),
    adminPassword: z.string().min(6, "Le mot de passe doit faire au moins 6 caractères")
})

export default function CreateTenantForm() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        name: "", slug: "", adminName: "", adminEmail: "", adminPassword: ""
    })
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(false)

    const validate = () => {
        try {
            tenantSchema.parse(formData)
            setErrors({})
            return true
        } catch (e: any) {
            if (e instanceof z.ZodError) {
                const fieldErrors: Record<string, string> = {};
                (e as any).errors.forEach((err: any) => {
                    if (err.path[0]) fieldErrors[err.path[0].toString()] = err.message
                })
                setErrors(fieldErrors)
            }
            return false
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validate()) return

        setLoading(true)
        try {
            const res = await fetch("/api/tenants", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })

            if (!res.ok) {
                const text = await res.text()
                if (text.includes("slug already exists")) {
                    setErrors(prev => ({ ...prev, slug: "Ce slug est déjà pris" }))
                } else if (text.includes("email already exists")) {
                    setErrors(prev => ({ ...prev, adminEmail: "Cet email est déjà utilisé" }))
                } else {
                    alert("Erreur lors de la création: " + text)
                }
                setLoading(false)
                return
            }

            router.push("/superadmin")
            router.refresh()
        } catch (e) {
            alert("Erreur réseau")
            setLoading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => {
            const newData = { ...prev, [name]: value }
            // Auto-generate slug from name if slug is empty or matches previous auto-slug
            if (name === "name" && (!prev.slug || prev.slug === prev.name.toLowerCase().replace(/[^a-z0-9]/g, '-'))) {
                newData.slug = value.toLowerCase().replace(/[^a-z0-9]/g, '-')
            }
            return newData
        })
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg border max-w-2xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-6">Créer un Nouveau Commerce</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Nom du Commerce</label>
                    <input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full p-3 rounded-lg border ${errors.name ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-blue-500 outline-none transition`}
                        placeholder="Ex: Ma Boutique"
                    />
                    {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Identifiant Unique (Slug)</label>
                    <input
                        name="slug"
                        value={formData.slug}
                        onChange={handleChange}
                        className={`w-full p-3 rounded-lg border ${errors.slug ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-blue-500 outline-none transition`}
                        placeholder="Ex: ma-boutique"
                    />
                    {errors.slug && <p className="text-xs text-red-500">{errors.slug}</p>}
                </div>
            </div>

            <div className="border-t pt-6 mt-4">
                <h3 className="font-semibold text-gray-900 mb-4">Informations Directeur</h3>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Nom Complet</label>
                        <input
                            name="adminName"
                            value={formData.adminName}
                            onChange={handleChange}
                            className={`w-full p-3 rounded-lg border ${errors.adminName ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-blue-500 outline-none`}
                        />
                        {errors.adminName && <p className="text-xs text-red-500">{errors.adminName}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Email</label>
                            <input
                                name="adminEmail"
                                type="email"
                                value={formData.adminEmail}
                                onChange={handleChange}
                                className={`w-full p-3 rounded-lg border ${errors.adminEmail ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-blue-500 outline-none`}
                            />
                            {errors.adminEmail && <p className="text-xs text-red-500">{errors.adminEmail}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Mot de Passe</label>
                            <input
                                name="adminPassword"
                                type="password"
                                value={formData.adminPassword}
                                onChange={handleChange}
                                className={`w-full p-3 rounded-lg border ${errors.adminPassword ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-blue-500 outline-none`}
                            />
                            {errors.adminPassword && <p className="text-xs text-red-500">{errors.adminPassword}</p>}
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-4 flex justify-end gap-4">
                <button type="button" onClick={() => router.back()} className="px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-lg">Annuler</button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 shadow-lg shadow-blue-200 disabled:opacity-50 transition"
                >
                    {loading ? "Création..." : "Créer le Commerce"}
                </button>
            </div>
        </form>
    )
}
