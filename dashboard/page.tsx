"use client";

import { Award, ChevronRight, LogOut, Package, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { authClient } from "~/server/better-auth/client";

interface Order { id: string; total: number; status: string; createdAt: string; paymentMethod: string; items: { product: { name: string } }[] }

const STATUS_COLORS: Record<string, string> = {
  PLACED: "bg-blue-100 text-blue-700",
  CONFIRMED: "bg-cyan-100 text-cyan-700",
  PROCESSING: "bg-yellow-100 text-yellow-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  OUT_FOR_DELIVERY: "bg-orange-100 text-orange-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = authClient.useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session) { router.push("/login"); return; }
    fetch("/api/orders").then((r) => r.json()).then((d) => { setOrders(d as Order[]); setLoading(false); }).catch(() => setLoading(false));
  }, [session]);

  const handleLogout = async () => {
    await authClient.signOut();
    toast.success("Signed out successfully");
    router.push("/");
  };

  if (!session) return null;

  const user = session.user as { name: string; email: string; image?: string; loyaltyPoints?: number; role?: string };
  const totalSpent = orders.filter((o) => o.status !== "CANCELLED").reduce((s, o) => s + o.total, 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-green-700">My Account</p>
          <h1 className="section-title mt-1">Dashboard</h1>
        </div>
        <button onClick={handleLogout} className="btn-outline py-2 px-4 text-sm gap-2">
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8 md:grid-cols-4">
        {[
          { icon: <User className="h-5 w-5 text-green-700" />, label: "Name", value: user.name },
          { icon: <Package className="h-5 w-5 text-blue-700" />, label: "Total Orders", value: orders.length },
          { icon: <Award className="h-5 w-5 text-yellow-600" />, label: "Loyalty Points", value: `${user.loyaltyPoints ?? 0} pts` },
          { icon: <Package className="h-5 w-5 text-purple-700" />, label: "Total Spent", value: `৳${totalSpent.toFixed(0)}` },
        ].map((s) => (
          <div key={s.label} className="glass-card p-4">
            <div className="mb-2">{s.icon}</div>
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className="text-base font-bold text-gray-900 truncate">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Admin link */}
      {user.role === "ADMIN" && (
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-green-800 to-green-700 p-4 text-white flex items-center justify-between">
          <span className="text-sm font-bold">🛡️ You have admin access</span>
          <Link href="/admin" className="rounded-full bg-white px-4 py-1.5 text-xs font-bold text-green-800 hover:bg-green-50 transition">Go to Admin Panel →</Link>
        </div>
      )}

      {/* Orders */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-5">Order History</h2>
        {loading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-100" />)}</div>
        ) : orders.length === 0 ? (
          <div className="py-10 text-center text-gray-400">
            <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>You haven't placed any orders yet.</p>
            <Link href="/products" className="btn-brand mt-4 inline-flex">Shop Now</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <Link key={o.id} href={`/dashboard/orders/${o.id}`}
                className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4 transition hover:border-green-300 hover:bg-green-50 group">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-gray-400">#{o.id.slice(-8).toUpperCase()}</span>
                    <span className={`status-pill ${STATUS_COLORS[o.status] ?? "bg-gray-100 text-gray-600"}`}>{o.status.replace(/_/g, " ")}</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 truncate">{o.items.map((i) => i.product.name).join(", ")}</p>
                  <p className="mt-0.5 text-xs text-gray-400">{new Date(o.createdAt).toLocaleDateString("en-BD", { day: "numeric", month: "short", year: "numeric" })}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-extrabold text-green-800">৳{o.total}</p>
                  <p className="text-xs text-gray-400">{o.paymentMethod}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-green-700 transition" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
