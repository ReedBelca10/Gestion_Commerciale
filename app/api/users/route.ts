import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"
import bcrypt from "bcryptjs"

const userSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(["GERANT", "VENDEUR", "MAGASINIER"])
})

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)

    // Seul le Directeur peut créer des employés pour son tenant
    if (session?.user?.role !== 'DIRECTEUR' || !session.user.tenantId) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        const body = await req.json()
        const { name, email, password, role } = userSchema.parse(body)

        // Vérifier unicité email
        const existing = await prisma.user.findUnique({ where: { email } })
        if (existing) {
            return new NextResponse("Email already exists", { status: 400 })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
                tenantId: session.user.tenantId
            }
        })

        const { password: _, ...userWithoutPassword } = user
        return NextResponse.json(userWithoutPassword)

    } catch (error) {
        return new NextResponse("Internal/Validation Error", { status: 500 })
    }
}

export async function GET(req: Request) {
    const session = await getServerSession(authOptions)

    if (session?.user?.role !== 'DIRECTEUR' && session?.user?.role !== 'SUPERADMIN') {
        // Gérant pourrait voir aussi ?
        return new NextResponse("Unauthorized", { status: 401 })
    }

    // Si Directeur, voir ses employés
    if (session.user.role === 'DIRECTEUR' && session.user.tenantId) {
        const users = await prisma.user.findMany({
            where: {
                tenantId: session.user.tenantId,
                id: { not: session.user.id } // Exclure soi-même ou pas
            },
            select: { id: true, name: true, email: true, role: true, createdAt: true }
        })
        return NextResponse.json(users)
    }

    return new NextResponse("Unauthorized", { status: 401 })
}
