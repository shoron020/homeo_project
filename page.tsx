import { ArrowRight, Award, HeadphonesIcon, ShieldCheck, Star, Truck } from "lucide-react";
import Link from "next/link";
import { db } from "~/server/db";

async function getData() {
  const [featured, categories, blogs] = await Promise.all([
    db.product.findMany({
      where: { isFeatured: true },
      include: { category: true, reviews: { select: { rating: true } } },
      take: 6,
    }),
    db.category.findMany({ include: { _count: { select: { products: true } } } }),
    db.blogPost.findMany({ orderBy: { publishedAt: "desc" }, take: 3 }),
  ]);
  return { featured, categories, blogs };
}

function avgRating(reviews: { rating: number }[]) {
  if (!reviews.length) return 0;
  return Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10;
}

export default async function HomePage() {
  const { featured, categories, blogs } = await getData();

  return (
    <div className="min-h-screen">
      {/* ─── Hero ──────────────────────────────────────── */}
      <section className="hero-bg relative overflow-hidden py-24 text-white">
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-green-400 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-yellow-400 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
            <ShieldCheck className="h-4 w-4 text-yellow-400" />
            Bangladesh's Trusted Homeopathic Pharmacy
          </div>
          <h1 className="mt-4 text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl">
            Heal Naturally with <br />
            <span className="text-yellow-400">Homeopathic Remedies</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-green-100">
            Discover 500+ authentic homeopathic medicines, mother tinctures, biochemic tablets &amp; ointments. Fast delivery across Bangladesh.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/products" className="btn-gold text-base px-8 py-3">
              Shop Now <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/blog" className="rounded-full border-2 border-white/50 px-8 py-3 text-base font-semibold text-white transition hover:border-white hover:bg-white/10">
              Read Health Blog
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Trust Badges ───────────────────────────────── */}
      <section className="bg-white py-8 shadow-sm">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 md:grid-cols-4">
          {[
            { icon: <Truck className="h-6 w-6 text-green-700" />, title: "Fast Delivery", sub: "All over Bangladesh" },
            { icon: <ShieldCheck className="h-6 w-6 text-green-700" />, title: "100% Authentic", sub: "Tested & certified" },
            { icon: <Award className="h-6 w-6 text-green-700" />, title: "Loyalty Rewards", sub: "Points on every order" },
            { icon: <HeadphonesIcon className="h-6 w-6 text-green-700" />, title: "24/7 Support", sub: "WhatsApp & helpline" },
          ].map((b) => (
            <div key={b.title} className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-50">{b.icon}</div>
              <div>
                <div className="text-sm font-bold text-gray-900">{b.title}</div>
                <div className="text-xs text-gray-500">{b.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Categories ─────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-green-700">Browse By</p>
            <h2 className="section-title mt-1">Product Categories</h2>
          </div>
          <Link href="/products" className="btn-outline py-2 px-5 text-sm">View All</Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {categories.map((cat, i) => {
            const gradients = [
              "from-green-800 to-green-600",
              "from-teal-700 to-teal-500",
              "from-emerald-700 to-emerald-500",
              "from-cyan-700 to-cyan-500",
            ];
            return (
              <Link key={cat.id} href={`/products?category=${cat.slug}`}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br p-6 text-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
                style={{ background: `linear-gradient(135deg, hsl(${145 + i * 15},51%,${28 - i * 3}%), hsl(${145 + i * 15},48%,${40 - i * 3}%))` }}>
                <div className="text-3xl mb-2">🌿</div>
                <h3 className="text-base font-bold leading-snug">{cat.name}</h3>
                <p className="mt-1 text-xs text-white/70">{cat._count.products} products</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ─── Featured Products ──────────────────────────── */}
      <section className="bg-gradient-to-b from-green-50 to-white py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-green-700">Top Picks</p>
              <h2 className="section-title mt-1">Featured Remedies</h2>
            </div>
            <Link href="/products" className="btn-outline py-2 px-5 text-sm">See All</Link>
          </div>
          <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-3">
            {featured.map((p) => {
              const avg = avgRating(p.reviews);
              return (
                <Link key={p.id} href={`/products/${p.slug}`} className="product-card group block">
                  <div className="flex h-44 items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 text-6xl">
                    🌿
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                        {p.potency ?? p.category.name}
                      </span>
                      {p.stock > 0
                        ? <span className="badge-stock-in">In Stock</span>
                        : <span className="badge-stock-out">Out of Stock</span>}
                    </div>
                    <h3 className="mt-2 text-sm font-bold text-gray-900 leading-snug group-hover:text-green-700 transition">
                      {p.name}
                    </h3>
                    <p className="mt-1 text-xs text-gray-500 line-clamp-2">{p.indications}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-lg font-extrabold text-green-800">৳{p.price}</span>
                      <div className="flex items-center gap-1 text-xs text-yellow-500">
                        <Star className="h-3 w-3 fill-current" />
                        {avg > 0 ? avg : "New"}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Discounts Banner ───────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="rounded-2xl bg-gradient-to-r from-yellow-500 to-amber-600 p-8 text-white shadow-xl md:flex md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest opacity-80">Limited Offer</p>
            <h2 className="mt-1 text-3xl font-extrabold">Get 10% Off Your First Order!</h2>
            <p className="mt-2 text-sm opacity-80">Register today and earn 100 bonus loyalty points on signup.</p>
          </div>
          <Link href="/register" className="mt-4 inline-flex rounded-full bg-white px-8 py-3 text-sm font-bold text-amber-700 shadow transition hover:shadow-lg md:mt-0">
            Register Now →
          </Link>
        </div>
      </section>

      {/* ─── Blog ───────────────────────────────────────── */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-green-700">Health Hub</p>
              <h2 className="section-title mt-1">Latest from Our Blog</h2>
            </div>
            <Link href="/blog" className="btn-outline py-2 px-5 text-sm">All Posts</Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {blogs.map((b) => (
              <Link key={b.id} href={`/blog/${b.slug}`} className="group rounded-2xl border border-gray-100 bg-gray-50 overflow-hidden transition hover:shadow-lg hover:-translate-y-1">
                <div className="flex h-36 items-center justify-center bg-gradient-to-br from-green-100 to-emerald-50 text-5xl">📖</div>
                <div className="p-5">
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">{b.category}</span>
                  <h3 className="mt-2 text-base font-bold text-gray-900 leading-snug group-hover:text-green-700 transition line-clamp-2">{b.title}</h3>
                  <p className="mt-1 text-xs text-gray-500 line-clamp-2">{b.excerpt}</p>
                  <p className="mt-3 text-xs text-gray-400">{new Date(b.publishedAt).toLocaleDateString("en-BD", { day: "numeric", month: "long", year: "numeric" })}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────── */}
      <footer className="bg-gray-900 text-gray-400 py-14">
        <div className="mx-auto max-w-7xl px-4 grid gap-10 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl font-extrabold text-white">HomeoPharm BD</span>
            </div>
            <p className="text-sm leading-relaxed">Bangladesh's most trusted online homeopathic pharmacy. Quality remedies delivered to your door.</p>
          </div>
          <div>
            <h4 className="mb-3 font-bold text-white text-sm">Shop</h4>
            {[["Remedies by Ailment", "/products?category=remedies-by-ailment"], ["Mother Tinctures", "/products?category=mother-tinctures"], ["Biochemic Tablets", "/products?category=biochemic-tablets"], ["Topical Ointments", "/products?category=topical-ointments"]].map(([label, href]) => (
              <Link key={href} href={href} className="block text-sm py-1 hover:text-white transition">{label}</Link>
            ))}
          </div>
          <div>
            <h4 className="mb-3 font-bold text-white text-sm">Help</h4>
            {[["FAQ", "/faq"], ["Blog", "/blog"], ["Contact Us", "/contact"], ["Track Order", "/dashboard"]].map(([label, href]) => (
              <Link key={href} href={href} className="block text-sm py-1 hover:text-white transition">{label}</Link>
            ))}
          </div>
          <div>
            <h4 className="mb-3 font-bold text-white text-sm">Contact</h4>
            <p className="text-sm">📍 123 Remedies Lane, Dhaka-1205, Bangladesh</p>
            <p className="text-sm mt-1">📞 +880 1700-000000</p>
            <p className="text-sm mt-1">✉️ support@homeopharm.com.bd</p>
            <p className="text-sm mt-1">Reg. No: DGDA/HOM/2024/001</p>
            <a href="https://wa.me/8801700000000" target="_blank" rel="noreferrer"
              className="mt-3 inline-flex items-center gap-2 rounded-full bg-green-600 px-4 py-2 text-xs font-bold text-white hover:bg-green-500 transition">
              💬 WhatsApp Us
            </a>
          </div>
        </div>
        <p className="mt-10 text-center text-xs text-gray-600">© 2024 HomeoPharm BD. All rights reserved. | ICE M2022 E-commerce Lab Project</p>
      </footer>
    </div>
  );
}
