import { prisma } from '../lib/prisma'
import * as bcrypt from 'bcryptjs'

// const prisma = new PrismaClient() // Removed


async function main() {
    // 1. Super Admin
    const superAdmin = await prisma.user.upsert({
        where: { email: 'superadmin@example.com' },
        update: {},
        create: {
            email: 'superadmin@example.com',
            name: 'Super Admin',
            role: 'SUPERADMIN',
            password: await bcrypt.hash('password', 10),
        },
    })
    console.log('Superadmin created')

    // 2. Tenants & Directors
    const tenant1 = await prisma.tenant.create({
        data: {
            name: "Boutique Paris",
            slug: "boutique-paris",
            users: {
                create: {
                    email: "directeur1@example.com",
                    name: "Pierre Directeur",
                    role: "DIRECTEUR",
                    password: await bcrypt.hash('password', 10)
                }
            }
        }
    })
    console.log('Tenant 1 created')

    const tenant2 = await prisma.tenant.create({
        data: {
            name: "Lyon Store",
            slug: "lyon-store",
            users: {
                create: {
                    email: "directeur2@example.com",
                    name: "Marie Directrice",
                    role: "DIRECTEUR",
                    password: await bcrypt.hash('password', 10)
                }
            }
        }
    })
    console.log('Tenant 2 created')

    // 3. Products for Tenant 1
    await prisma.product.createMany({
        data: [
            { name: "Laptop Dell", price: 999.99, stock: 10, tenantId: tenant1.id },
            { name: "Souris Logitech", price: 29.99, stock: 50, tenantId: tenant1.id },
            { name: "Clavier Mécanique", price: 129.99, stock: 15, tenantId: tenant1.id },
        ]
    })
    console.log('Products for Tenant 1 created')

    // 4. Products for Tenant 2
    await prisma.product.createMany({
        data: [
            { name: "Iphone 15", price: 1199.99, stock: 5, tenantId: tenant2.id },
            { name: "Airpods", price: 199.99, stock: 20, tenantId: tenant2.id },
        ]
    })
    console.log('Products for Tenant 2 created')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
