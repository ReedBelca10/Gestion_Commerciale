"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function TwoFactorSetup() {
    const [qrCode, setQrCode] = useState<string | null>(null)
    const [secret, setSecret] = useState<string | null>(null)
    const [code, setCode] = useState("")
    const [loading, setLoading] = useState(false)

    const startSetup = async () => {
        setLoading(true)
        const res = await fetch("/api/auth/2fa/generate", { method: "POST" })
        const data = await res.json()
        setQrCode(data.qrCode)
        setSecret(data.secret)
        setLoading(false)
    }

    const verifySetup = async () => {
        const res = await fetch("/api/auth/2fa/verify", {
            method: "POST",
            body: JSON.stringify({ token: code, secret }),
            headers: { "Content-Type": "application/json" }
        })

        if (res.ok) {
            alert("2FA Activé !")
            setQrCode(null)
        } else {
            alert("Code invalide")
        }
    }

    return (
        <div className="p-4 border rounded-lg bg-white shadow-sm">
            <h3 className="font-bold text-lg mb-4">Sécurité (2FA)</h3>

            {!qrCode ? (
                <button onClick={startSetup} disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded">
                    Configurer l'A2F
                </button>
            ) : (
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">Scannez ce QR Code avec Google Authenticator</p>
                    <img src={qrCode} alt="QR Code 2FA" className="border p-2" />
                    <p className="text-xs text-mono bg-gray-100 p-2 break-all">{secret}</p>

                    <div className="flex gap-2">
                        <input
                            value={code}
                            onChange={e => setCode(e.target.value)}
                            placeholder="Code à 6 chiffres"
                            className="border p-2 rounded"
                        />
                        <button onClick={verifySetup} className="px-4 py-2 bg-green-600 text-white rounded">Vérifier</button>
                    </div>
                </div>
            )}
        </div>
    )
}
