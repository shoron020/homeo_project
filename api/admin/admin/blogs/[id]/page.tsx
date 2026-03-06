"use client";

import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function AdminBlogForm() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const isNew = id === "new";

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    category: "General",
    excerpt: "",
    content: "",
    image: "",
  });

  useEffect(() => {
    if (!isNew) {
      fetch("/api/admin/blog")
        .then((r) => r.json())
        .then((posts: any[]) => {
          const p = posts.find((item) => item.id === id);
          if (p) {
            setForm({
              title: p.title,
              slug: p.slug,
              category: p.category,
              excerpt: p.excerpt,
              content: p.content,
              image: p.image || "",
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

    const res = await fetch("/api/admin/blog", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      toast.success(isNew ? "Blog post created!" : "Blog post updated!");
      router.push("/admin?tab=blogs");
    } else {
      toast.error("Failed to save blog post.");
    }
    setSaving(false);
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-green-700" /></div>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link href="/admin?tab=blogs" className="inline-flex items-center gap-2 text-sm text-green-700 hover:text-green-900 mb-8 font-semibold">
        <ArrowLeft className="h-4 w-4" /> Back to Admin Panel
      </Link>

      <div className="mb-8 text-center md:text-left">
        <h1 className="text-3xl font-extrabold text-gray-900">{isNew ? "Create New Blog Post" : "Edit Blog Post"}</h1>
        <p className="text-gray-500 mt-1">Share health awareness or remedy updates with your customers.</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Post Title</label>
            <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="input-field text-lg font-bold" placeholder="e.g. Essential Remedies for Winter Flu" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">URL Slug</label>
            <input type="text" required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="input-field" placeholder="e.g. winter-flu-remedies" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Category</label>
            <select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field">
              <option value="General">General</option>
              <option value="Remedies">Remedies</option>
              <option value="Seasonal">Seasonal</option>
              <option value="Health Awareness">Health Awareness</option>
              <option value="Offers">Offers</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Short Excerpt (Snippet)</label>
          <textarea rows={2} required value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            className="input-field resize-none" placeholder="A brief summary of the post for listing pages..." />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Main Content</label>
          <textarea rows={12} required value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
            className="input-field font-serif leading-relaxed" placeholder="Write your full article here. Use double newlines for paragraphs..." />
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button type="submit" disabled={saving} className="btn-brand px-10 py-3 text-base">
            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            {saving ? "Saving..." : (isNew ? "Publish Post" : "Save Changes")}
          </button>
        </div>
      </form>
    </div>
  );
}
