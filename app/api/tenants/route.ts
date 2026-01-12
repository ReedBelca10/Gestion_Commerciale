import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"
import { rateLimit } from "@/lib/ratelimit"

const tenantSchema = z.object({
    name: z.string().min(2),
    slug: z.string().min(2),
    adminEmail: z.string().email(),
    adminName: z.string().min(2),
    adminPassword: z.string().min(6)
})

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)

    if (session?.user?.role !== 'SUPERADMIN') {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        const body = await req.json()
        const { name, slug, adminEmail, adminName, adminPassword } = tenantSchema.parse(body)

        // Check slug exists
        const existingTenant = await prisma.tenant.findUnique({ where: { slug } })
        if (existingTenant) {
            return new NextResponse("Tenant slug already exists", { status: 400 })
        }

        // Check user exists
        const existingUser = await prisma.user.findUnique({ where: { email: adminEmail } })
        if (existingUser) {
            return new NextResponse("User email already exists", { status: 400 })
        }

        // Create Tenant and Admin User transactionally
        const result = await prisma.$transaction(async (tx) => {
            const tenant = await tx.tenant.create({
                data: {
                    name,
                    slug
                }
            })

            const hashedPassword = await import("bcryptjs").then(m => m.hash(adminPassword, 10))

            const user = await tx.user.create({
                data: {
                    name: adminName,
                    email: adminEmail,
                    password: hashedPassword,
                    role: 'DIRECTEUR',
                    tenantId: tenant.id
                }
            })
            return { tenant, user }
        })

        return NextResponse.json(result)

    } catch (error) {
        console.error(error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function GET(req: Request) {
    const session = await getServerSession(authOptions)

    if (session?.user?.role !== 'SUPERADMIN') {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    const tenants = await prisma.tenant.findMany({
        include: {
            _count: {
                select: { users: true, products: true, sales: true }
            }
        }
    })

    return NextResponse.json(tenants)
}
