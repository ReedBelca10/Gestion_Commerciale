require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
})

async function main() {
    console.log('Starting seed script...')
    const dbUrl = process.env.DATABASE_URL
    console.log('Env var loaded? ', !!dbUrl)
    if (dbUrl) {
        console.log('DB URL starts with:', dbUrl.substring(0, 11))
    } else {
        console.error('CRITICAL: DATABASE_URL is missing!')
        process.exit(1)
    }



    // 1. Super Admin
    const email = 'superadmin@example.com'
    const password = await bcrypt.hash('password', 10)

    const superAdmin = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
            email,
            name: 'Super Admin',
            role: 'SUPERADMIN',
            password,
        },
    })
    console.log('Superadmin created')

    // 2. Tenants & Directors
    // Check if tenants exist to avoid unique constraint errors if re-run
    const existingTenant1 = await prisma.tenant.findUnique({ where: { slug: "boutique-paris" } })
    let tenant1
    if (!existingTenant1) {
        tenant1 = await prisma.tenant.create({
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
    } else {
        tenant1 = existingTenant1
        console.log('Tenant 1 already exists')
    }

    const existingTenant2 = await prisma.tenant.findUnique({ where: { slug: "lyon-store" } })
    let tenant2
    if (!existingTenant2) {
        tenant2 = await prisma.tenant.create({
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
    } else {
        tenant2 = existingTenant2
        console.log('Tenant 2 already exists')
    }

    // 3. Products
    if (tenant1) {
        const count = await prisma.product.count({ where: { tenantId: tenant1.id } })
        if (count === 0) {
            await prisma.product.createMany({
                data: [
                    { name: "Laptop Dell", price: 999.99, stock: 10, tenantId: tenant1.id },
                    { name: "Souris Logitech", price: 29.99, stock: 50, tenantId: tenant1.id },
                    { name: "Clavier Mécanique", price: 129.99, stock: 15, tenantId: tenant1.id },
                ]
            })
            console.log('Products for Tenant 1 created')
        }
    }

    if (tenant2) {
        const count = await prisma.product.count({ where: { tenantId: tenant2.id } })
        if (count === 0) {
            await prisma.product.createMany({
                data: [
                    { name: "Iphone 15", price: 1199.99, stock: 5, tenantId: tenant2.id },
                    { name: "Airpods", price: 199.99, stock: 20, tenantId: tenant2.id },
                ]
            })
            console.log('Products for Tenant 2 created')
        }
    }
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
