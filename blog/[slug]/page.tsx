"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface BlogPost { id: string; title: string; slug: string; content: string; category: string; publishedAt: string }

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    fetch(`/api/blog/${slug}`).then((r) => r.json()).then((d) => setPost(d as BlogPost));
  }, [slug]);

  if (!post) return <div className="flex min-h-[60vh] items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-green-700 border-t-transparent" /></div>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-green-700 hover:text-green-900 mb-8">
        <ArrowLeft className="h-4 w-4" /> Back to Blog
      </Link>
      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700 mb-4 inline-block">{post.category}</span>
      <h1 className="mt-2 text-3xl font-extrabold text-gray-900 leading-tight">{post.title}</h1>
      <p className="mt-2 text-sm text-gray-400">{new Date(post.publishedAt).toLocaleDateString("en-BD", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
      <div className="mt-8 flex h-56 items-center justify-center rounded-2xl bg-gradient-to-br from-green-50 to-emerald-100 text-8xl">📖</div>
      <div className="mt-8 prose prose-sm max-w-none">
        {post.content.split("\n\n").map((para, i) => (
          <p key={i} className="mb-4 text-gray-700 leading-relaxed whitespace-pre-line">{para}</p>
        ))}
      </div>
    </div>
  );
}
