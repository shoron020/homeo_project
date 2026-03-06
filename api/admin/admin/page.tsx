"use client";

import {
    ExternalLink,
    FileText,
    FolderOpen,
    Loader2,
    Package,
    Pencil,
    Plus,
    RefreshCw,
    ShoppingBag,
    ShoppingCart,
    Star,
    Trash2,
    TrendingUp,
    Users,
    XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { authClient } from "~/server/better-auth/client";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Stats {
  totalProducts: number; totalOrders: number; totalUsers: number; totalBlogs: number;
  totalCategories: number; totalReviews: number; pendingOrders: number; lowStockProducts: number;
  totalRevenue: number;
}
interface Product { id: string; name: string; price: number; stock: number; potency: string | null; categoryId: string; isFeatured: boolean; category: { name: string }; _count: { orderItems: number } }
interface Order { id: string; total: number; status: string; createdAt: string; paymentMethod: string; user: { name: string; email: string }; items: { product: { name: string } }[] }
interface Blog { id: string; title: string; category: string; publishedAt: string; slug: string }
interface User { id: string; name: string; email: string; role: string; loyaltyPoints: number; createdAt: string; _count: { orders: number } }
interface Category { id: string; name: string; slug: string; description: string | null; image: string | null; _count: { products: number } }
interface Review { id: string; rating: number; comment: string | null; createdAt: string; user: { name: string; email: string }; product: { name: string; slug: string } }

type Tab = "orders" | "products" | "blogs" | "users" | "categories" | "reviews";

const ALL_STATUSES = ["PLACED", "CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];

const STATUS_COLORS: Record<string, string> = {
  PLACED: "bg-gray-100 text-gray-600",
  CONFIRMED: "bg-blue-50 text-blue-700",
  PROCESSING: "bg-yellow-50 text-yellow-700",
  SHIPPED: "bg-purple-50 text-purple-700",
  OUT_FOR_DELIVERY: "bg-orange-50 text-orange-700",
  DELIVERED: "bg-green-50 text-green-700",
  CANCELLED: "bg-red-50 text-red-500",
};

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 rounded-full bg-gray-50 p-5 text-gray-300">{icon}</div>
      <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{label}</p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminPage() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as Tab) || "orders";

  const [tab, setTab] = useState<Tab>(initialTab);
  const [stats, setStats] = useState<Stats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Filters
  const [orderStatusFilter, setOrderStatusFilter] = useState("ALL");
  const [orderSearch, setOrderSearch] = useState("");

  const { data: session } = authClient.useSession();
  const router = useRouter();
  const currentUser = session?.user as { id?: string; role?: string } | undefined;

  // Load stats once on mount
  useEffect(() => {
    if (!session) return;
    if (currentUser?.role !== "ADMIN") return;
    fetch("/api/admin/stats").then((r) => r.json()).then(setStats).catch(() => null);
  }, [session]);

  useEffect(() => {
    if (!session) { router.push("/login"); return; }
    if (currentUser?.role !== "ADMIN") { toast.error("Admin access required"); router.push("/"); return; }
    loadData();
  }, [session, tab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (tab === "orders") {
        const o = await fetch("/api/admin/orders").then((r) => r.json());
        setOrders(o as Order[]);
      } else if (tab === "products") {
        const p = await fetch("/api/admin/products").then((r) => r.json());
        setProducts(p as Product[]);
      } else if (tab === "blogs") {
        const b = await fetch("/api/admin/blog").then((r) => r.json());
        setBlogs(b as Blog[]);
      } else if (tab === "users") {
        const u = await fetch("/api/admin/users").then((r) => r.json());
        setUsers(u as User[]);
      } else if (tab === "categories") {
        const c = await fetch("/api/admin/categories").then((r) => r.json());
        setCategories(c as Category[]);
      } else if (tab === "reviews") {
        const r = await fetch("/api/admin/reviews").then((r) => r.json());
        setReviews(r as Review[]);
      }
    } catch { toast.error("Failed to load data"); }
    setLoading(false);
  };

  const refreshAll = async () => {
    loadData();
    fetch("/api/admin/stats").then((r) => r.json()).then(setStats).catch(() => null);
  };

  // ─── Actions ───────────────────────────────────────────────────────────────

  const deleteProduct = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await fetch("/api/admin/products", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    toast.success("Product deleted"); loadData();
  };

  const deleteBlog = async (id: string) => {
    if (!confirm("Delete this blog post?")) return;
    await fetch("/api/admin/blog", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    toast.success("Blog post deleted"); loadData();
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    setUpdatingId(orderId);
    await fetch("/api/admin/orders", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId, status }) });
    toast.success(`Order → ${status.replace(/_/g, " ")}`);
    setUpdatingId(null); loadData();
  };

  const toggleUserRole = async (id: string, currentRole: string) => {
    const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
    if (!confirm(`Change this user to ${newRole}?`)) return;
    setUpdatingId(id);
    const res = await fetch("/api/admin/users", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, role: newRole }) });
    if (res.ok) { toast.success(`Role changed to ${newRole}`); loadData(); }
    else toast.error("Failed to update role");
    setUpdatingId(null);
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Permanently delete this user and all their data?")) return;
    const res = await fetch("/api/admin/users", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    const data = await res.json();
    if (res.ok) { toast.success("User deleted"); loadData(); }
    else toast.error(data.error ?? "Failed to delete user");
  };

  const deleteCategory = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"?`)) return;
    const res = await fetch("/api/admin/categories", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    const data = await res.json();
    if (res.ok) { toast.success("Category deleted"); loadData(); }
    else toast.error(data.error ?? "Failed to delete category");
  };

  const deleteReview = async (id: string) => {
    if (!confirm("Delete this review?")) return;
    await fetch("/api/admin/reviews", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    toast.success("Review deleted"); loadData();
  };

  if (!session || currentUser?.role !== "ADMIN") return null;

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const matchStatus = orderStatusFilter === "ALL" || o.status === orderStatusFilter;
    const matchSearch = !orderSearch || o.user.name.toLowerCase().includes(orderSearch.toLowerCase()) || o.user.email.toLowerCase().includes(orderSearch.toLowerCase());
    return matchStatus && matchSearch;
  });

  const TABS: { id: Tab; label: string; icon: React.ReactNode; color: string }[] = [
    { id: "orders", label: "Orders", icon: <ShoppingBag className="h-4 w-4" />, color: "blue" },
    { id: "products", label: "Products", icon: <Package className="h-4 w-4" />, color: "green" },
    { id: "categories", label: "Categories", icon: <FolderOpen className="h-4 w-4" />, color: "teal" },
    { id: "blogs", label: "Blog", icon: <FileText className="h-4 w-4" />, color: "purple" },
    { id: "users", label: "Users", icon: <Users className="h-4 w-4" />, color: "yellow" },
    { id: "reviews", label: "Reviews", icon: <Star className="h-4 w-4" />, color: "orange" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-green-700">Admin</p>
          <h1 className="section-title mt-1">Management Console</h1>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button onClick={refreshAll} className="btn-outline py-2 px-4 text-sm font-bold border-gray-200">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
          {tab === "products" && <Link href="/admin/products/new" className="btn-brand py-2 px-5 text-sm"><Plus className="h-4 w-4" /> Add Product</Link>}
          {tab === "blogs" && <Link href="/admin/blogs/new" className="btn-brand py-2 px-5 text-sm"><Plus className="h-4 w-4" /> New Post</Link>}
          {tab === "categories" && <Link href="/admin/categories/new" className="btn-brand py-2 px-5 text-sm"><Plus className="h-4 w-4" /> New Category</Link>}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 gap-4 mb-8 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { label: "Products", value: stats?.totalProducts, icon: <Package className="h-5 w-5" />, color: "green" },
          { label: "Orders", value: stats?.totalOrders, icon: <ShoppingBag className="h-5 w-5" />, color: "blue" },
          { label: "Revenue", value: stats ? `৳${Math.round(stats.totalRevenue).toLocaleString()}` : undefined, icon: <TrendingUp className="h-5 w-5" />, color: "emerald" },
          { label: "Users", value: stats?.totalUsers, icon: <Users className="h-5 w-5" />, color: "yellow" },
          { label: "Pending", value: stats?.pendingOrders, icon: <ShoppingCart className="h-5 w-5" />, color: "orange", warn: (stats?.pendingOrders ?? 0) > 0 },
          { label: "Low Stock", value: stats?.lowStockProducts, icon: <XCircle className="h-5 w-5" />, color: "red", warn: (stats?.lowStockProducts ?? 0) > 0 },
        ].map((s) => (
          <div key={s.label} className={`glass-card p-4 border-l-4 ${s.warn ? "border-l-red-500" : `border-l-${s.color}-500`}`}>
            <div className="flex items-center justify-between mb-1">
              <span className={`text-${s.color}-600`}>{s.icon}</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{s.label}</span>
            </div>
            <p className={`text-xl font-black ${s.warn ? "text-red-500 animate-pulse" : "text-gray-900"}`}>
              {s.value !== undefined ? s.value : <span className="text-gray-300">—</span>}
            </p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 mb-6 border-b border-gray-100 pb-1">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => { setTab(t.id); router.replace(`/admin?tab=${t.id}`); }}
            className={`flex items-center gap-1.5 px-5 py-2.5 text-sm font-bold transition-all relative rounded-t-lg
              ${tab === t.id ? "text-green-800 bg-green-50" : "text-gray-500 hover:text-green-700 hover:bg-gray-50"}`}>
            {t.icon} {t.label}
            {tab === t.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-green-700 rounded-t-full" />}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 glass-card">
          <Loader2 className="h-10 w-10 animate-spin text-green-700 mb-4" />
          <p className="text-sm font-bold text-gray-500">Loading...</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden shadow-xl">

          {/* ── ORDERS ── */}
          {tab === "orders" && (
            <>
              <div className="p-4 bg-gray-50 border-b border-gray-100 flex flex-wrap gap-3 items-center">
                <input type="text" value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Search by customer..." className="input-field max-w-xs py-2 text-sm" />
                <select value={orderStatusFilter} onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="input-field max-w-[160px] py-2 text-sm">
                  <option value="ALL">All Statuses</option>
                  {ALL_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                </select>
                <span className="text-xs font-bold text-gray-400 ml-auto">{filteredOrders.length} orders</span>
              </div>
              <div className="overflow-x-auto">
                {filteredOrders.length === 0 ? <EmptyState icon={<ShoppingBag className="h-10 w-10" />} label="No orders found" /> : (
                  <table className="w-full text-sm">
                    <thead><tr className="bg-gray-50 font-bold text-gray-500 border-b border-gray-100">
                      {["Order ID", "Customer", "Items", "Amount", "Status", "Date", "Actions"].map((h) => (
                        <th key={h} className="px-5 py-3.5 text-left text-xs uppercase tracking-tight">{h}</th>
                      ))}
                    </tr></thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredOrders.map((o) => (
                        <tr key={o.id} className="hover:bg-green-50/30 transition">
                          <td className="px-5 py-3.5 font-mono text-xs text-gray-400 font-bold">#{o.id.slice(-8).toUpperCase()}</td>
                          <td className="px-5 py-3.5">
                            <div className="font-bold text-gray-900 text-sm">{o.user.name}</div>
                            <div className="text-[10px] text-gray-400">{o.user.email}</div>
                          </td>
                          <td className="px-5 py-3.5 text-xs text-gray-500 max-w-[160px]">
                            <div className="truncate">{o.items.map((i) => i.product.name).join(", ")}</div>
                          </td>
                          <td className="px-5 py-3.5 font-black text-green-800">৳{o.total}</td>
                          <td className="px-5 py-3.5">
                            <select value={o.status} onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                              disabled={updatingId === o.id}
                              className={`rounded-lg px-2 py-1.5 text-xs font-bold border-0 outline-none cursor-pointer ${STATUS_COLORS[o.status] ?? ""}`}>
                              {ALL_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                            </select>
                          </td>
                          <td className="px-5 py-3.5 text-xs font-bold text-gray-400 whitespace-nowrap">
                            {new Date(o.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-5 py-3.5">
                            <Link href={`/admin/orders/${o.id}`}
                              className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-green-700 hover:text-green-900">
                              Inspect <ExternalLink className="h-3 w-3" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}

          {/* ── PRODUCTS ── */}
          {tab === "products" && (
            <div className="overflow-x-auto">
              {products.length === 0 ? <EmptyState icon={<Package className="h-10 w-10" />} label="No products yet" /> : (
                <table className="w-full text-sm">
                  <thead><tr className="bg-gray-50 font-bold text-gray-500 border-b border-gray-100">
                    {["Product", "Category", "Potency", "Orders", "Price", "Stock", "Actions"].map((h) => (
                      <th key={h} className="px-5 py-3.5 text-left text-xs uppercase tracking-tight">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody className="divide-y divide-gray-50">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-green-50/30 transition">
                        <td className="px-5 py-3.5">
                          <div className="font-bold text-gray-900">{p.name}</div>
                          <div className="text-[10px] font-mono text-gray-400">{p.id.slice(-6).toUpperCase()}</div>
                        </td>
                        <td className="px-5 py-3.5"><span className="text-xs font-bold px-2 py-1 rounded-lg bg-gray-100 text-gray-600">{p.category.name}</span></td>
                        <td className="px-5 py-3.5">
                          {p.potency && <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">{p.potency}</span>}
                        </td>
                        <td className="px-5 py-3.5 text-xs font-bold text-gray-500">{p._count.orderItems} sold</td>
                        <td className="px-5 py-3.5 font-black text-green-800">৳{p.price}</td>
                        <td className="px-5 py-3.5">
                          <span className={`text-xs font-bold ${p.stock < 10 ? "text-red-500" : "text-gray-700"}`}>{p.stock} units</span>
                        </td>
                        <td className="px-5 py-3.5 flex gap-2">
                          <Link href={`/admin/products/${p.id}`} className="rounded-lg bg-blue-50 p-2 text-blue-600 hover:bg-blue-100 transition"><Pencil className="h-4 w-4" /></Link>
                          <button onClick={() => deleteProduct(p.id)} className="rounded-lg bg-red-50 p-2 text-red-500 hover:bg-red-100 transition"><Trash2 className="h-4 w-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ── CATEGORIES ── */}
          {tab === "categories" && (
            <div className="overflow-x-auto">
              {categories.length === 0 ? <EmptyState icon={<FolderOpen className="h-10 w-10" />} label="No categories yet" /> : (
                <table className="w-full text-sm">
                  <thead><tr className="bg-gray-50 font-bold text-gray-500 border-b border-gray-100">
                    {["Category", "Slug", "Products", "Description", "Actions"].map((h) => (
                      <th key={h} className="px-5 py-3.5 text-left text-xs uppercase tracking-tight">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody className="divide-y divide-gray-50">
                    {categories.map((c) => (
                      <tr key={c.id} className="hover:bg-green-50/30 transition">
                        <td className="px-5 py-3.5 font-bold text-gray-900">{c.name}</td>
                        <td className="px-5 py-3.5 font-mono text-xs text-gray-400">{c.slug}</td>
                        <td className="px-5 py-3.5">
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-100">
                            {c._count.products} products
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-gray-500 max-w-xs truncate">{c.description || "—"}</td>
                        <td className="px-5 py-3.5 flex gap-2">
                          <Link href={`/admin/categories/${c.id}`} className="rounded-lg bg-blue-50 p-2 text-blue-600 hover:bg-blue-100 transition"><Pencil className="h-4 w-4" /></Link>
                          <button onClick={() => deleteCategory(c.id, c.name)} className="rounded-lg bg-red-50 p-2 text-red-500 hover:bg-red-100 transition"><Trash2 className="h-4 w-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ── BLOG ── */}
          {tab === "blogs" && (
            <div className="overflow-x-auto">
              {blogs.length === 0 ? <EmptyState icon={<FileText className="h-10 w-10" />} label="No blog posts yet" /> : (
                <table className="w-full text-sm">
                  <thead><tr className="bg-gray-50 font-bold text-gray-500 border-b border-gray-100">
                    {["Title", "Category", "Published", "Actions"].map((h) => (
                      <th key={h} className="px-5 py-3.5 text-left text-xs uppercase tracking-tight">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody className="divide-y divide-gray-50">
                    {blogs.map((b) => (
                      <tr key={b.id} className="hover:bg-green-50/30 transition">
                        <td className="px-5 py-3.5 font-bold text-gray-900 max-w-sm truncate">{b.title}</td>
                        <td className="px-5 py-3.5"><span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100">{b.category}</span></td>
                        <td className="px-5 py-3.5 text-xs font-bold text-gray-400">{new Date(b.publishedAt).toLocaleDateString()}</td>
                        <td className="px-5 py-3.5 flex gap-2">
                          <Link href={`/admin/blogs/${b.id}`} className="rounded-lg bg-blue-50 p-2 text-blue-600 hover:bg-blue-100 transition"><Pencil className="h-4 w-4" /></Link>
                          <Link href={`/blog/${b.slug}`} target="_blank" className="rounded-lg bg-gray-50 p-2 text-gray-500 hover:bg-gray-100 transition"><ExternalLink className="h-4 w-4" /></Link>
                          <button onClick={() => deleteBlog(b.id)} className="rounded-lg bg-red-50 p-2 text-red-500 hover:bg-red-100 transition"><Trash2 className="h-4 w-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ── USERS ── */}
          {tab === "users" && (
            <div className="overflow-x-auto">
              {users.length === 0 ? <EmptyState icon={<Users className="h-10 w-10" />} label="No users found" /> : (
                <table className="w-full text-sm">
                  <thead><tr className="bg-gray-50 font-bold text-gray-500 border-b border-gray-100">
                    {["User", "Role", "Orders", "Loyalty Points", "Joined", "Actions"].map((h) => (
                      <th key={h} className="px-5 py-3.5 text-left text-xs uppercase tracking-tight">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody className="divide-y divide-gray-50">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-green-50/30 transition">
                        <td className="px-5 py-3.5">
                          <div className="font-bold text-gray-900">{u.name}</div>
                          <div className="text-[10px] font-mono text-gray-400">{u.email}</div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border
                            ${u.role === "ADMIN" ? "bg-red-50 text-red-700 border-red-100" : "bg-green-50 text-green-700 border-green-100"}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-xs font-bold text-gray-500">{u._count.orders}</td>
                        <td className="px-5 py-3.5">
                          <span className="text-xs font-bold text-yellow-600">⭐ {u.loyaltyPoints} pts</span>
                        </td>
                        <td className="px-5 py-3.5 text-xs font-bold text-gray-400 whitespace-nowrap">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-3.5">
                          {u.id !== currentUser?.id ? (
                            <div className="flex gap-2">
                              <button onClick={() => toggleUserRole(u.id, u.role)} disabled={updatingId === u.id}
                                className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition whitespace-nowrap">
                                {updatingId === u.id ? "..." : u.role === "ADMIN" ? "→ User" : "→ Admin"}
                              </button>
                              <button onClick={() => deleteUser(u.id)} className="rounded-lg bg-red-50 p-2 text-red-500 hover:bg-red-100 transition">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] font-bold text-gray-400 italic">You</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ── REVIEWS ── */}
          {tab === "reviews" && (
            <div className="overflow-x-auto">
              {reviews.length === 0 ? <EmptyState icon={<Star className="h-10 w-10" />} label="No reviews yet" /> : (
                <table className="w-full text-sm">
                  <thead><tr className="bg-gray-50 font-bold text-gray-500 border-b border-gray-100">
                    {["Customer", "Product", "Rating", "Comment", "Date", "Delete"].map((h) => (
                      <th key={h} className="px-5 py-3.5 text-left text-xs uppercase tracking-tight">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody className="divide-y divide-gray-50">
                    {reviews.map((r) => (
                      <tr key={r.id} className="hover:bg-green-50/30 transition">
                        <td className="px-5 py-3.5">
                          <div className="font-bold text-gray-900 text-sm">{r.user.name}</div>
                          <div className="text-[10px] text-gray-400">{r.user.email}</div>
                        </td>
                        <td className="px-5 py-3.5">
                          <Link href={`/products/${r.product.slug}`} target="_blank"
                            className="text-sm font-bold text-green-700 hover:text-green-900 hover:underline">
                            {r.product.name}
                          </Link>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }, (_, i) => (
                              <Star key={i} className={`h-4 w-4 ${i < r.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />
                            ))}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-gray-600 max-w-xs truncate">{r.comment || <span className="text-gray-300 italic">No comment</span>}</td>
                        <td className="px-5 py-3.5 text-xs font-bold text-gray-400 whitespace-nowrap">{new Date(r.createdAt).toLocaleDateString()}</td>
                        <td className="px-5 py-3.5">
                          <button onClick={() => deleteReview(r.id)} className="rounded-lg bg-red-50 p-2 text-red-500 hover:bg-red-100 transition">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
