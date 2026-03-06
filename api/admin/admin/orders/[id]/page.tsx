"use client";

import {
    ArrowLeft,
    CheckCircle2,
    Circle,
    Clock,
    Loader2,
    MapPin,
    Package,
    Phone,
    Save,
    Truck,
    User,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const ALL_STATUSES = [
  "PLACED",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

const STATUS_ICONS: Record<string, React.ReactNode> = {
  PLACED: <Circle className="h-4 w-4" />,
  CONFIRMED: <CheckCircle2 className="h-4 w-4" />,
  PROCESSING: <Package className="h-4 w-4" />,
  SHIPPED: <Truck className="h-4 w-4" />,
  OUT_FOR_DELIVERY: <Truck className="h-4 w-4" />,
  DELIVERED: <CheckCircle2 className="h-4 w-4" />,
  CANCELLED: <Circle className="h-4 w-4" />,
};

const STATUS_COLORS: Record<string, string> = {
  PLACED: "bg-gray-100 text-gray-600 border-gray-200",
  CONFIRMED: "bg-blue-50 text-blue-700 border-blue-100",
  PROCESSING: "bg-yellow-50 text-yellow-700 border-yellow-100",
  SHIPPED: "bg-purple-50 text-purple-700 border-purple-100",
  OUT_FOR_DELIVERY: "bg-orange-50 text-orange-700 border-orange-100",
  DELIVERED: "bg-green-50 text-green-700 border-green-200",
  CANCELLED: "bg-red-50 text-red-500 border-red-100",
};

interface TrackingEvent {
  id: string;
  status: string;
  note: string | null;
  createdAt: string;
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: { name: string; potency: string | null; image: string | null };
}

interface OrderDetail {
  id: string;
  total: number;
  status: string;
  paymentMethod: string;
  address: string;
  phone: string;
  createdAt: string;
  user: { name: string; email: string };
  items: OrderItem[];
  trackingEvents: TrackingEvent[];
}

export default function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const loadOrder = async () => {
    setLoading(true);
    try {
      const orders = await fetch("/api/admin/orders").then((r) => r.json());
      const found = (orders as OrderDetail[]).find((o) => o.id === id);
      if (found) {
        setOrder(found);
        setNewStatus(found.status);
      }
    } catch {
      toast.error("Failed to load order");
    }
    setLoading(false);
  };

  useEffect(() => { loadOrder(); }, [id]);

  const updateStatus = async () => {
    if (!order || newStatus === order.status && !note) return;
    setSaving(true);
    const res = await fetch("/api/admin/orders", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: id, status: newStatus, note: note || undefined }),
    });
    if (res.ok) {
      toast.success("Order updated!");
      setNote("");
      await loadOrder();
    } else {
      toast.error("Failed to update order");
    }
    setSaving(false);
  };

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-green-700" />
      </div>
    );

  if (!order)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-gray-500 font-bold">Order not found</p>
        <Link href="/admin?tab=orders" className="btn-brand px-6 py-2 text-sm">Back to Orders</Link>
      </div>
    );

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Link
        href="/admin?tab=orders"
        className="inline-flex items-center gap-2 text-sm text-green-700 hover:text-green-900 mb-8 font-semibold"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Orders
      </Link>

      <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-green-700">Admin · Order Detail</p>
          <h1 className="text-3xl font-extrabold text-gray-900 mt-1">
            #{order.id.slice(-10).toUpperCase()}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Placed {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <span
          className={`px-4 py-1.5 rounded-full text-xs font-black uppercase border ${STATUS_COLORS[order.status] ?? ""}`}
        >
          {STATUS_ICONS[order.status]} {order.status.replace(/_/g, " ")}
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Customer Info */}
        <div className="glass-card p-6 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Customer</h2>
          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
            <div>
              <div className="font-bold text-gray-900">{order.user.name}</div>
              <div className="text-xs text-gray-400">{order.user.email}</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
            <span className="text-sm font-mono text-gray-700">{order.phone}</span>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-red-400 mt-0.5 shrink-0" />
            <span className="text-sm text-gray-700 leading-snug">{order.address}</span>
          </div>
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase">Payment</span>
            <span className="text-xs font-black px-2 py-0.5 bg-gray-100 rounded text-gray-700">
              {order.paymentMethod}
            </span>
          </div>
        </div>

        {/* Order Items */}
        <div className="glass-card p-6 md:col-span-2">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Items</h2>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-50">
                <div>
                  <div className="font-bold text-sm text-gray-900">{item.product.name}</div>
                  {item.product.potency && (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                      {item.product.potency}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">৳{item.price} × {item.quantity}</div>
                  <div className="text-xs font-black text-green-700">৳{item.price * item.quantity}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between pt-3 border-t border-gray-100">
            <span className="font-bold text-gray-600">Grand Total</span>
            <span className="text-xl font-black text-green-800">৳{order.total}</span>
          </div>
        </div>
      </div>

      {/* Update Status */}
      <div className="glass-card p-6 mt-6">
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Update Status</h2>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-bold text-gray-500 mb-1.5">New Status</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="input-field"
            >
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
              ))}
            </select>
          </div>
          <div className="flex-[2] min-w-[200px]">
            <label className="block text-xs font-bold text-gray-500 mb-1.5">
              Tracking Note <span className="text-gray-300">(optional)</span>
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="input-field"
              placeholder="e.g. Package handed to courier..."
            />
          </div>
          <button onClick={updateStatus} disabled={saving} className="btn-brand px-6 py-2.5 text-sm shrink-0">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Saving..." : "Update"}
          </button>
        </div>
      </div>

      {/* Tracking Timeline */}
      {order.trackingEvents.length > 0 && (
        <div className="glass-card p-6 mt-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Tracking History</h2>
          <div className="space-y-4">
            {[...order.trackingEvents].reverse().map((evt, i) => (
              <div key={evt.id} className="flex gap-4">
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 shrink-0
                    ${i === 0 ? "border-green-500 text-green-600 bg-green-50" : "border-gray-200 text-gray-400 bg-white"}`}>
                    <Clock className="h-3.5 w-3.5" />
                  </div>
                  {i < order.trackingEvents.length - 1 && <div className="w-0.5 flex-1 bg-gray-100 min-h-[16px]" />}
                </div>
                <div className="pb-4">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-black px-2 py-0.5 rounded-full border ${STATUS_COLORS[evt.status] ?? ""}`}>
                      {evt.status.replace(/_/g, " ")}
                    </span>
                    <span className="text-[11px] font-mono text-gray-400">
                      {new Date(evt.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {evt.note && <p className="text-sm text-gray-600 mt-1">{evt.note}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
