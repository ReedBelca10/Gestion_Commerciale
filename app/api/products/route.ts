import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

const productSchema = z.object({
    name: z.string().min(2),
    price: z.number().positive(),
    stock: z.number().int().min(0)
})

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.tenantId || !['DIRECTEUR', 'GERANT', 'MAGASINIER'].includes(session.user.role)) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    // Seul Directeur ou Magasinier peut ajouter produits ? Supposons Directeur/Gérant pour créer, Magasinier pour stock.
    // Simplification : Directeur/Gérant créent.
    if (session.user.role === 'MAGASINIER') {
        // Magasinier update stock usually, not create product? Let's allow create for now or restrict.
        // User request: "accès... seul le Magasinier peut modifier les quantités en stock"
        // Implique create product = Directeur/Gerant.
        return new NextResponse("Magasinier cannot create products", { status: 403 })
    }

    try {
        const body = await req.json()
        const { name, price, stock } = productSchema.parse(body)

        const product = await prisma.product.create({
            data: {
                name,
                price,
                stock,
                tenantId: session.user.tenantId
            }
        })

        return NextResponse.json(product)

    } catch (error) {
        return new NextResponse("Error", { status: 500 })
    }
}

export async function GET(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.tenantId) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    const products = await prisma.product.findMany({
        where: { tenantId: session.user.tenantId },
        orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(products)
}

// PUT pour mise à jour stock (Magasinier)
export async function PUT(req: Request) {
    // Implementation would handle specific update logic
    return new NextResponse("Use specific PATCH endpoints", { status: 501 })
}
