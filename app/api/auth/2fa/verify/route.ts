import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { TOTP } from "otplib"

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 })

    try {
        const { token, secret } = await req.json()

        const totp = new TOTP({ algorithm: 'sha1', digits: 6, period: 30 })
        const isValid = totp.verify(token, secret)

        if (!isValid) {
            return new NextResponse("Invalid Token", { status: 400 })
        }

        // Save secret and enable 2FA
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                twoFactorSecret: secret,
                twoFactorEnabled: true
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        return new NextResponse("Error", { status: 500 })
    }
}
