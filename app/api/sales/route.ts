import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

// Schema pour une vente
const saleSchema = z.object({
    items: z.array(z.object({
        productId: z.string(),
        quantity: z.number().int().positive()
    }))
})

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)

    // Seul VENDEUR (ou Directeur/Gerant) peut vendre
    if (!session?.user?.tenantId || !['VENDEUR', 'DIRECTEUR', 'GERANT'].includes(session.user.role)) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        const body = await req.json()
        const { items } = saleSchema.parse(body)

        // Transaction atomique
        const sale = await prisma.$transaction(async (tx) => {
            let totalAmount = 0
            const saleItemsData = []

            // Vérifier stock et calculer total
            for (const item of items) {
                const product = await tx.product.findUnique({
                    where: { id: item.productId, tenantId: session.user.tenantId! } // Isolation data
                })

                if (!product) {
                    throw new Error(`Product ${item.productId} not found`)
                }

                if (product.stock < item.quantity) {
                    throw new Error(`Insufficient stock for ${product.name}`)
                }

                // Décrémenter stock
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity } }
                })

                const lineTotal = Number(product.price) * item.quantity // Attention Decimal, ici simplifié en number JS
                totalAmount += lineTotal

                saleItemsData.push({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: product.price
                })
            }

            // Créer la vente
            const newSale = await tx.sale.create({
                data: {
                    tenantId: session.user.tenantId!,
                    userId: session.user.id,
                    total: totalAmount,
                    items: {
                        create: saleItemsData
                    }
                },
                include: { items: true }
            })

            return newSale
        })

        return NextResponse.json(sale)

    } catch (error: any) {
        console.error(error)
        return new NextResponse(error.message || "Transaction failed", { status: 400 })
    }
}
