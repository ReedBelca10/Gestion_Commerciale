import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Checkout from "@/components/pos/Checkout" // Composant Client à venir

export default async function AppPosPage() {
    const session = await getServerSession(authOptions)

    return (
        <div className="h-full flex flex-col">
            {/* Checkout est un Client Component qui gérera le state, SWR et la vente */}
            <Checkout
                tenantId={session?.user?.tenantId!}
                userRole={session?.user?.role!}
                userId={session?.user?.id!}
            />
        </div>
    )
}
