"use client";

import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function AdminProductForm() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const isNew = id === "new";

  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    categoryId: "",
    potency: "",
    price: 0,
    stock: 0,
    indications: "",
    dosage: "",
    ingredients: "",
    directions: "",
    isFeatured: false,
  });

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories);

    if (!isNew) {
      // Find the product to edit
      fetch("/api/admin/products")
        .then((r) => r.json())
        .then((products: any[]) => {
          const p = products.find((prod) => prod.id === id);
          if (p) {
            setForm({
              name: p.name,
              slug: p.slug,
              categoryId: p.categoryId,
              potency: p.potency || "",
              price: p.price,
              stock: p.stock,
              indications: p.indications || "",
              dosage: p.dosage || "",
              ingredients: p.ingredients || "",
              directions: p.directions || "",
              isFeatured: p.isFeatured || false,
            });
          }
          setLoading(false);
        });
    }
  }, [id, isNew]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const method = isNew ? "POST" : "PUT";
    const body = isNew ? form : { id, ...form };

    const res = await fetch("/api/admin/products", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      toast.success(isNew ? "Product created!" : "Product updated!");
      router.push("/admin?tab=products");
    } else {
      toast.error("Failed to save product.");
    }
    setSaving(false);
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-green-700" /></div>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link href="/admin?tab=products" className="inline-flex items-center gap-2 text-sm text-green-700 hover:text-green-900 mb-8 font-semibold">
        <ArrowLeft className="h-4 w-4" /> Back to Admin Panel
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">{isNew ? "Add New Product" : "Edit Product"}</h1>
        <p className="text-gray-500 mt-1">Fill in the details for the homeopathic remedy.</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Product Name</label>
            <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input-field" placeholder="e.g. Arnica Montana 30C" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">URL Slug</label>
            <input type="text" required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="input-field" placeholder="e.g. arnica-30c" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Category</label>
            <select required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="input-field">
              <option value="">Select Category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Potency</label>
            <input type="text" value={form.potency} onChange={(e) => setForm({ ...form, potency: e.target.value })}
              className="input-field" placeholder="e.g. 30C, Q, 6X" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Price (৳)</label>
            <input type="number" required value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              className="input-field" min="0" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Stock Level</label>
            <input type="number" required value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
              className="input-field" min="0" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Main Indications</label>
          <textarea rows={2} value={form.indications} onChange={(e) => setForm({ ...form, indications: e.target.value })}
            className="input-field resize-none" placeholder="What does this treat? (e.g. Bruising, shock, muscle pain)" />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Dosage Instructions</label>
            <textarea rows={3} value={form.dosage} onChange={(e) => setForm({ ...form, dosage: e.target.value })}
              className="input-field resize-none" placeholder="e.g. 4 pills 3 times daily" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Directions for Use</label>
            <textarea rows={3} value={form.directions} onChange={(e) => setForm({ ...form, directions: e.target.value })}
              className="input-field resize-none" placeholder="e.g. Dissolve under tongue, avoid coffee..." />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Ingredients</label>
          <textarea rows={2} value={form.ingredients} onChange={(e) => setForm({ ...form, ingredients: e.target.value })}
            className="input-field resize-none" placeholder="List active ingredients..." />
        </div>

        <div className="flex items-center gap-3">
          <input type="checkbox" id="featured" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
            className="h-5 w-5 rounded border-gray-300 text-green-700 focus:ring-green-500" />
          <label htmlFor="featured" className="text-sm font-bold text-gray-700 select-none">Feature this product on homepage</label>
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button type="submit" disabled={saving} className="btn-brand px-10 py-3 text-base">
            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            {saving ? "Saving..." : (isNew ? "Create Product" : "Save Changes")}
          </button>
        </div>
      </form>
    </div>
  );
}
