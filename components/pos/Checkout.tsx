"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Trash2, ShoppingCart, Plus, Minus, Search } from "lucide-react"

// Types
type Product = {
    id: string
    name: string
    price: number
    stock: number
}

type CartItem = Product & {
    quantity: number
}

export default function Checkout({ tenantId, userRole, userId }: { tenantId: string, userRole: string, userId: string }) {
    const [products, setProducts] = useState<Product[]>([])
    const [cart, setCart] = useState<CartItem[]>([])
    const [loading, setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")

    // Fetch Products (Simple polling for pseudo-realtime)
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch("/api/products")
                const data = await res.json()
                setProducts(data)
            } catch (e) {
                console.error("Failed to fetch products")
            }
        }

        fetchProducts()
        const interval = setInterval(fetchProducts, 5000) // Poll every 5s
        return () => clearInterval(interval)
    }, [])

    const addToCart = (product: Product) => {
        const existing = cart.find(item => item.id === product.id)
        if (existing) {
            if (existing.quantity >= product.stock) return // Stock limit
            setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
        } else {
            setCart([...cart, { ...product, quantity: 1 }])
        }
    }

    const removeFromCart = (productId: string) => {
        setCart(cart.filter(item => item.id !== productId))
    }

    const updateQuantity = (productId: string, delta: number) => {
        const item = cart.find(i => i.id === productId)
        const product = products.find(p => p.id === productId)
        if (!item || !product) return

        const newQty = item.quantity + delta
        if (newQty <= 0) {
            removeFromCart(productId)
        } else if (newQty <= product.stock) {
            setCart(cart.map(i => i.id === productId ? { ...i, quantity: newQty } : i))
        }
    }

    const total = cart.reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0)

    const handleCheckout = async () => {
        setLoading(true)
        try {
            const res = await fetch("/api/sales", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    items: cart.map(item => ({ productId: item.id, quantity: item.quantity }))
                })
            })

            if (!res.ok) {
                const err = await res.text()
                alert(`Erreur: ${err}`)
                return
            }

            setCart([])
            alert("Vente validée !")
            // Refresh products immediately
            const pRes = await fetch("/api/products")
            const pData = await pRes.json()
            setProducts(pData)

        } catch (e) {
            alert("Erreur réseau")
        } finally {
            setLoading(false)
        }
    }

    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))

    return (
        <div className="flex h-full">
            {/* Product Grid */}
            <div className="flex-1 bg-gray-50 p-6 overflow-auto">
                <div className="mb-6 relative">
                    <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Rechercher un produit..."
                        className="w-full pl-10 pr-4 py-3 rounded-xl border-gray-200 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredProducts.map(product => (
                        <button
                            key={product.id}
                            onClick={() => addToCart(product)}
                            disabled={product.stock <= 0}
                            className={`p-4 rounded-xl shadow-sm border text-left transition hover:shadow-md bg-white ${product.stock <= 0 ? 'opacity-50 cursor-not-allowed' : 'hover:border-indigo-300'}`}
                        >
                            <div className="h-20 bg-gray-100 rounded-lg mb-3 flex items-center justify-center text-gray-400">
                                Image
                            </div>
                            <h3 className="font-semibold text-gray-800 truncate">{product.name}</h3>
                            <div className="flex justify-between items-center mt-2">
                                <span className="font-bold text-indigo-600">{Number(product.price).toFixed(2)} €</span>
                                <span className={`text-xs px-2 py-1 rounded-full ${product.stock > 5 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    Stock: {product.stock}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Cart Sidebar */}
            <div className="w-[400px] bg-white border-l shadow-xl flex flex-col z-20">
                <div className="p-6 border-b">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <ShoppingCart /> Panier
                    </h2>
                </div>

                <div className="flex-1 overflow-auto p-4 space-y-4">
                    {cart.length === 0 ? (
                        <div className="text-center text-gray-400 mt-10">Panier vide</div>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 border">
                                <div className="flex-1">
                                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                                    <p className="text-sm text-gray-500">{Number(item.price).toFixed(2)} € x {item.quantity}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1 rounded hover:bg-white"><Minus size={16} /></button>
                                    <span className="font-bold w-6 text-center">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1 rounded hover:bg-white"><Plus size={16} /></button>
                                </div>
                                <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600 ml-2">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-6 border-t bg-gray-50">
                    <div className="flex justify-between items-center mb-6 text-xl font-bold">
                        <span>Total</span>
                        <span className="text-indigo-600">{total.toFixed(2)} €</span>
                    </div>
                    <button
                        onClick={handleCheckout}
                        disabled={cart.length === 0 || loading}
                        className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg"
                    >
                        {loading ? "Traitement..." : "Payer"}
                    </button>
                </div>
            </div>
        </div>
    )
}
