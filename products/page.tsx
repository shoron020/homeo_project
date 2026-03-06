"use client";

import { Search, SlidersHorizontal, Star, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { authClient } from "~/server/better-auth/client";

interface Product {
  id: string; name: string; slug: string; potency: string | null;
  price: number; stock: number; indications: string | null;
  avgRating: number; reviewCount: number;
  category: { name: string; slug: string };
}

interface Category { id: string; name: string; slug: string; _count: { products: number } }

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [potency, setPotency] = useState("");
  const [loading, setLoading] = useState(true);
  const { data: session } = authClient.useSession();

  const POTENCIES = ["6C", "12C", "30C", "200C", "1M", "6X", "12X", "30X", "Q"];

  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then(setCategories).catch(() => null);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (potency) params.set("potency", potency);
    fetch(`/api/products?${params}`).then((r) => r.json()).then((d) => { setProducts(d as Product[]); setLoading(false); }).catch(() => setLoading(false));
  }, [q, category, potency]);

  const addToCart = async (productId: string) => {
    if (!session) { toast.error("Please sign in to add to cart"); return; }
    await fetch("/api/cart", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId, quantity: 1 }) });
    toast.success("Added to cart!");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-green-700">Explore</p>
        <h1 className="section-title mt-1">All Homeopathic Products</h1>
      </div>

      <div className="flex flex-col gap-8 md:flex-row">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-60 shrink-0">
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-5">
              <SlidersHorizontal className="h-4 w-4 text-green-700" />
              <span className="font-bold text-gray-900">Filters</span>
              {(category || potency) && (
                <button onClick={() => { setCategory(""); setPotency(""); }} className="ml-auto text-xs text-red-500 hover:text-red-700">
                  <X className="h-3 w-3" /> Clear
                </button>
              )}
            </div>

            {/* Category */}
            <div className="mb-5">
              <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-500">Category</h3>
              <button onClick={() => setCategory("")}
                className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition ${!category ? "bg-green-700 text-white font-semibold" : "hover:bg-green-50 text-gray-700"}`}>
                All Categories
              </button>
              {categories.map((c) => (
                <button key={c.id} onClick={() => setCategory(c.slug)}
                  className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition ${category === c.slug ? "bg-green-700 text-white font-semibold" : "hover:bg-green-50 text-gray-700"}`}>
                  {c.name} <span className="text-xs opacity-60">({c._count.products})</span>
                </button>
              ))}
            </div>

            {/* Potency */}
            <div>
              <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-500">Potency</h3>
              <div className="flex flex-wrap gap-1">
                {POTENCIES.map((p) => (
                  <button key={p} onClick={() => setPotency(potency === p ? "" : p)}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${potency === p ? "border-green-700 bg-green-700 text-white" : "border-gray-200 text-gray-600 hover:border-green-400"}`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search by name, symptom, or potency…" value={q} onChange={(e) => setQ(e.target.value)}
              className="input-field pl-11" />
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-5 md:grid-cols-3">
              {[...Array(6)].map((_, i) => <div key={i} className="h-64 animate-pulse rounded-2xl bg-gray-200" />)}
            </div>
          ) : products.length === 0 ? (
            <div className="py-20 text-center text-gray-400">
              <div className="text-5xl mb-4">🔍</div>
              <p className="font-semibold">No products found</p>
              <p className="text-sm mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-5 md:grid-cols-3">
              {products.map((p) => (
                <div key={p.id} className="product-card">
                  <Link href={`/products/${p.slug}`}>
                    <div className="flex h-40 items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 text-5xl">🌿</div>
                    <div className="p-4">
                      <div className="flex items-center justify-between gap-1">
                        {p.potency && <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">{p.potency}</span>}
                        {p.stock > 0 ? <span className="badge-stock-in">In Stock</span> : <span className="badge-stock-out">Out of Stock</span>}
                      </div>
                      <h3 className="mt-2 text-sm font-bold text-gray-900 leading-snug hover:text-green-700 transition line-clamp-2">{p.name}</h3>
                      <p className="mt-0.5 text-xs text-gray-400 line-clamp-1">{p.category.name}</p>
                      <p className="mt-1 text-xs text-gray-500 line-clamp-2">{p.indications}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-base font-extrabold text-green-800">৳{p.price}</span>
                        {p.reviewCount > 0 && (
                          <div className="flex items-center gap-0.5 text-xs text-yellow-500">
                            <Star className="h-3 w-3 fill-current" />{p.avgRating}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                  <div className="px-4 pb-4">
                    <button onClick={() => addToCart(p.id)} disabled={p.stock === 0}
                      className="btn-brand w-full py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed justify-center">
                      {p.stock > 0 ? "Add to Cart" : "Out of Stock"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
