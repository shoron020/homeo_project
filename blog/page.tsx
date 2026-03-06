"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface BlogPost { id: string; title: string; slug: string; excerpt: string; category: string; publishedAt: string }

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/blog").then((r) => r.json()).then((d) => { setPosts(d as BlogPost[]); setLoading(false); });
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-green-700">Health Hub</p>
        <h1 className="section-title mt-1">Homeopathy Blog</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-gray-600">Updates about remedies, seasonal offers, and health awareness from our expert team.</p>
      </div>
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2">{[...Array(4)].map((_,i) => <div key={i} className="h-56 animate-pulse rounded-2xl bg-gray-100" />)}</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {posts.map((p) => (
            <Link key={p.id} href={`/blog/${p.slug}`} className="group glass-card overflow-hidden flex flex-col transition hover:shadow-lg hover:-translate-y-1">
              <div className="flex h-40 items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 text-6xl">📖</div>
              <div className="flex flex-1 flex-col p-5">
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700 self-start mb-2">{p.category}</span>
                <h2 className="text-base font-bold text-gray-900 leading-snug group-hover:text-green-700 transition">{p.title}</h2>
                <p className="mt-2 text-sm text-gray-500 flex-1 line-clamp-3">{p.excerpt}</p>
                <p className="mt-3 text-xs text-gray-400">{new Date(p.publishedAt).toLocaleDateString("en-BD", { day: "numeric", month: "long", year: "numeric" })}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
