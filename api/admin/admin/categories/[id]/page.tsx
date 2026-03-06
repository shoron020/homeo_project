"use client";

import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function AdminCategoryForm() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const isNew = id === "new";

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    image: "",
  });

  useEffect(() => {
    if (!isNew) {
      fetch("/api/admin/categories")
        .then((r) => r.json())
        .then((cats: any[]) => {
          const c = cats.find((item) => item.id === id);
          if (c) {
            setForm({
              name: c.name,
              slug: c.slug,
              description: c.description || "",
              image: c.image || "",
            });
          }
          setLoading(false);
        });
    }
  }, [id, isNew]);

  // Auto-generate slug from name when creating new
  const handleNameChange = (value: string) => {
    const newSlug = isNew
      ? value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
      : form.slug;
    setForm({ ...form, name: value, slug: newSlug });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const method = isNew ? "POST" : "PUT";
    const body = isNew ? form : { id, ...form };

    const res = await fetch("/api/admin/categories", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      toast.success(isNew ? "Category created!" : "Category updated!");
      router.push("/admin?tab=categories");
    } else {
      const data = await res.json();
      toast.error(data.error ?? "Failed to save category.");
    }
    setSaving(false);
  };

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-green-700" />
      </div>
    );

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link
        href="/admin?tab=categories"
        className="inline-flex items-center gap-2 text-sm text-green-700 hover:text-green-900 mb-8 font-semibold"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Admin Panel
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">
          {isNew ? "New Category" : "Edit Category"}
        </h1>
        <p className="text-gray-500 mt-1">
          Categories group your homeopathic products for easy browsing.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
            Category Name
          </label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="input-field text-lg font-bold"
            placeholder="e.g. Mother Tinctures"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
            URL Slug
          </label>
          <input
            type="text"
            required
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            className="input-field font-mono text-sm"
            placeholder="e.g. mother-tinctures"
          />
          <p className="text-[11px] text-gray-400 mt-1 font-mono">
            /products?category={form.slug || "..."}
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
            Description
          </label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="input-field resize-none"
            placeholder="Brief description for this category..."
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
            Image URL
          </label>
          <input
            type="text"
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
            className="input-field"
            placeholder="/images/cat-example.jpg"
          />
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button type="submit" disabled={saving} className="btn-brand px-10 py-3 text-base">
            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            {saving ? "Saving..." : isNew ? "Create Category" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
