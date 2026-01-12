"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("superadmin@example.com")
  const [password, setPassword] = useState("password")
  const [twoFactorCode, setTwoFactorCode] = useState("")
  const [showTwoFactor, setShowTwoFactor] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Si on affiche le champ 2FA, on l'envoie, sinon undefined
    const res = await signIn("credentials", {
      email,
      password,
      twoFactorCode: showTwoFactor ? twoFactorCode : undefined,
      redirect: false
    })

    if (res?.error) {
      if (res.error === "2FA_REQUIRED") {
        setShowTwoFactor(true)
        // Pas d'alerte, juste changement d'état
      } else {
        alert("Erreur de connexion (" + res.error + ")")
      }
      setLoading(false)
    } else {
      router.refresh()
      // Laisser le middleware gérer la redirection ou router.push
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-2xl shadow-xl border">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            Gestion Commerciale
          </h1>
          <p className="text-gray-500 mt-2">Connectez-vous à votre espace</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!showTwoFactor ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mot de Passe</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Code A2F (Google Auth)</label>
              <input
                type="text"
                value={twoFactorCode}
                onChange={e => setTwoFactorCode(e.target.value)}
                placeholder="000 000"
                className="w-full p-3 rounded-lg border border-indigo-300 focus:ring-2 focus:ring-indigo-500 outline-none text-center tracking-widest text-xl font-mono"
                autoFocus
              />
              <p className="text-xs text-center mt-2 text-indigo-600">Entrez le code à 6 chiffres</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-bold shadow-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Chargement..." : (showTwoFactor ? "Vérifier & Se Connecter" : "Se Connecter")}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-gray-400">
          Sécurité avancée • Performance optimale
        </div>
      </div>
    </div>
  )
}
