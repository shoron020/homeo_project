"use client";

import { ArrowLeft, BookOpen, Droplets, Navigation, Package, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { authClient } from "~/server/better-auth/client";

interface Review { id: string; rating: number; comment: string | null; createdAt: string; user: { name: string; image: string | null } }
interface Product {
  id: string; name: string; slug: string; potency: string | null; price: number; stock: number;
  indications: string | null; dosage: string | null; ingredients: string | null; directions: string | null;
  avgRating: number; category: { name: string }; reviews: Review[];
}

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button key={i} type="button" onClick={() => onChange?.(i)} className={`text-2xl ${i <= value ? "text-yellow-400" : "text-gray-300"} ${onChange ? "cursor-pointer hover:scale-110 transition" : "cursor-default"}`}>★</button>
      ))}
    </div>
  );
}

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [myRating, setMyRating] = useState(5);
  const [myComment, setMyComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { data: session } = authClient.useSession();

  useEffect(() => {
    fetch(`/api/products/${slug}`).then((r) => r.json()).then((d) => { setProduct(d as Product); setLoading(false); }).catch(() => setLoading(false));
  }, [slug]);

  const addToCart = async () => {
    if (!session) { toast.error("Please sign in to add to cart"); return; }
    if (!product) return;
    await fetch("/api/cart", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: product.id, quantity: qty }) });
    toast.success(`Added ${qty} × ${product.name} to cart!`);
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) { toast.error("Please sign in to review"); return; }
    if (!product) return;
    setSubmitting(true);
    await fetch("/api/reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: product.id, rating: myRating, comment: myComment }) });
    toast.success("Review submitted!");
    setMyComment("");
    // Refresh product
    fetch(`/api/products/${slug}`).then((r) => r.json()).then((d) => setProduct(d as Product));
    setSubmitting(false);
  };

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-green-700 border-t-transparent" /></div>;
  if (!product) return <div className="py-20 text-center"><p className="text-gray-500">Product not found.</p><Link href="/products" className="btn-brand mt-4">Back to Shop</Link></div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <Link href="/products" className="inline-flex items-center gap-2 text-sm text-green-700 hover:text-green-900 mb-8">
        <ArrowLeft className="h-4 w-4" /> Back to Products
      </Link>

      <div className="grid gap-10 md:grid-cols-2">
        {/* Image */}
        <div className="flex items-center justify-center rounded-2xl bg-gradient-to-br from-green-50 to-emerald-100 min-h-80 text-9xl shadow-inner">
          🌿
        </div>

        {/* Info */}
        <div>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">{product.category.name}</span>
            {product.potency && <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">Potency: {product.potency}</span>}
            {product.stock > 0 ? <span className="badge-stock-in">✓ In Stock ({product.stock})</span> : <span className="badge-stock-out">Out of Stock</span>}
          </div>

          <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">{product.name}</h1>

          <div className="mt-2 flex items-center gap-3">
            <StarRating value={Math.round(product.avgRating)} />
            <span className="text-sm text-gray-500">{product.avgRating > 0 ? `${product.avgRating} (${product.reviews.length} reviews)` : "No reviews yet"}</span>
          </div>

          <div className="mt-4 text-4xl font-extrabold text-green-800">৳{product.price}</div>
          <p className="mt-1 text-xs text-gray-500">Inclusive of all taxes. Free shipping on orders above ৳500.</p>

          {/* Qty + Cart */}
          {product.stock > 0 && (
            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center gap-3 rounded-full border border-gray-200 px-4 py-2">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="font-bold text-gray-700 hover:text-green-700">−</button>
                <span className="w-6 text-center font-bold">{qty}</span>
                <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="font-bold text-gray-700 hover:text-green-700">+</button>
              </div>
              <button onClick={addToCart} className="btn-brand flex-1 justify-center py-3">
                <ShoppingCart className="h-4 w-4" /> Add to Cart
              </button>
            </div>
          )}

          {/* Tabs info */}
          <div className="mt-8 rounded-2xl border border-gray-100 bg-gray-50 overflow-hidden">
            {[
              { icon: <Package className="h-4 w-4" />, label: "Indications", content: product.indications },
              { icon: <Droplets className="h-4 w-4" />, label: "Dosage", content: product.dosage },
              { icon: <BookOpen className="h-4 w-4" />, label: "Ingredients", content: product.ingredients },
              { icon: <Navigation className="h-4 w-4" />, label: "Directions", content: product.directions },
            ].filter((t) => t.content).map((t, i) => (
              <div key={i} className={`px-5 py-4 ${i > 0 ? "border-t border-gray-100" : ""}`}>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-green-700 mb-1">{t.icon}{t.label}</div>
                <p className="text-sm text-gray-700 leading-relaxed">{t.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-16">
        <h2 className="section-title mb-6">Customer Reviews</h2>
        <div className="grid gap-8 md:grid-cols-2">
          {/* Review form */}
          <div className="glass-card p-6">
            <h3 className="font-bold text-gray-900 mb-4">Write a Review</h3>
            {!session ? (
              <p className="text-sm text-gray-500">Please <Link href="/login" className="text-green-700 font-semibold underline">sign in</Link> to leave a review.</p>
            ) : (
              <form onSubmit={submitReview} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Your Rating</label>
                  <StarRating value={myRating} onChange={setMyRating} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Comment</label>
                  <textarea value={myComment} onChange={(e) => setMyComment(e.target.value)} rows={3}
                    className="input-field resize-none" placeholder="Share your experience with this product…" />
                </div>
                <button type="submit" disabled={submitting} className="btn-brand w-full justify-center">
                  {submitting ? "Submitting…" : "Submit Review"}
                </button>
              </form>
            )}
          </div>

          {/* Review list */}
          <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
            {product.reviews.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <div className="text-4xl mb-2">💬</div>
                <p className="text-sm">Be the first to review this product!</p>
              </div>
            ) : (
              product.reviews.map((r) => (
                <div key={r.id} className="glass-card p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700">{r.user.name[0]}</div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{r.user.name}</p>
                      <p className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="ml-auto flex text-yellow-400 text-sm">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
                  </div>
                  {r.comment && <p className="text-sm text-gray-700">{r.comment}</p>}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
