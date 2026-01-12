import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateSecret, generateURI } from "otplib"
import QRCode from "qrcode"

// GENERATE 2FA
export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 })

    // Implementation for GENERATE
    const secret = generateSecret()
    // generateURI(options)
    const otpauth = generateURI({ secret, issuer: "GestionCommerciale", label: session.user.email! })
    const qrCode = await QRCode.toDataURL(otpauth)

    // On stocke le secret temporairement ou on l'envoie pour verification
    // Ici on l'envoie au client qui doit le renvoyer pour verif
    return NextResponse.json({ secret, qrCode })
}
