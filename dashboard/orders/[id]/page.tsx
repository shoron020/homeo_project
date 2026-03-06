"use client";

import { ArrowLeft, CheckCircle, Circle, Clock, Download, Package } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { authClient } from "~/server/better-auth/client";

const STATUSES = ["PLACED", "CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"];
const STATUS_LABELS: Record<string, string> = {
  PLACED: "Order Placed", CONFIRMED: "Confirmed", PROCESSING: "Processing",
  SHIPPED: "Shipped", OUT_FOR_DELIVERY: "Out for Delivery", DELIVERED: "Delivered",
};

interface TrackingEvent { id: string; status: string; note: string | null; createdAt: string }
interface OrderItem { id: string; quantity: number; price: number; product: { name: string; potency: string | null } }
interface Order {
  id: string; total: number; status: string; paymentMethod: string; address: string; phone: string; createdAt: string;
  items: OrderItem[]; trackingEvents: TrackingEvent[];
}

function downloadInvoice(order: Order) {
  // Dynamically import jsPDF only in browser
  void import("jspdf").then(({ jsPDF }) => {
    const doc = new jsPDF();
    doc.setFontSize(18); doc.setFont("helvetica", "bold");
    doc.text("HomeoPharm BD – Invoice", 14, 22);
    doc.setFontSize(10); doc.setFont("helvetica", "normal");
    doc.text(`Order: #${order.id.slice(-8).toUpperCase()}`, 14, 32);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 14, 38);
    doc.text(`Payment: ${order.paymentMethod}`, 14, 44);
    doc.text(`Delivery to: ${order.address}`, 14, 50);
    doc.text(`Phone: ${order.phone}`, 14, 56);

    doc.setFontSize(11); doc.setFont("helvetica", "bold");
    doc.text("Items", 14, 66);
    doc.setFont("helvetica", "normal"); doc.setFontSize(10);
    let y = 72;
    order.items.forEach((item) => {
      doc.text(`${item.quantity}× ${item.product.name}${item.product.potency ? ` (${item.product.potency})` : ""}`, 14, y);
      doc.text(`৳${(item.price * item.quantity).toFixed(0)}`, 170, y, { align: "right" });
      y += 7;
    });
    doc.setFont("helvetica", "bold");
    doc.text(`Total: ৳${order.total}`, 170, y + 5, { align: "right" });
    doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(150);
    doc.text("Thank you for shopping with HomeoPharm BD!", 14, 280);
    doc.text("Reg. No: DGDA/HOM/2024/001 | support@homeopharm.com.bd", 14, 285);
    doc.save(`invoice-${order.id.slice(-8)}.pdf`);
  });
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [trackingEvents, setTrackingEvents] = useState<TrackingEvent[]>([]);
  const { data: session } = authClient.useSession();
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!session || !id) return;
    fetch(`/api/orders/${id}`).then((r) => r.json()).then((d) => {
      const o = d as Order;
      setOrder(o);
      setTrackingEvents(o.trackingEvents);
    });

    // Connect SSE for real-time tracking
    const es = new EventSource(`/api/orders/${id}/tracking`);
    esRef.current = es;
    es.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data as string) as { events: TrackingEvent[] };
        if (data.events?.length) {
          setTrackingEvents(data.events);
          // Update order status to latest
          const latest = data.events[data.events.length - 1];
          if (latest) setOrder((prev) => prev ? { ...prev, status: latest.status } : prev);
        }
      } catch { /* ignore */ }
    };
    es.onerror = () => es.close();
    return () => { es.close(); };
  }, [id, session]);

  if (!order) return <div className="flex min-h-[60vh] items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-green-700 border-t-transparent" /></div>;

  const currentStep = STATUSES.indexOf(order.status);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-green-700 hover:text-green-900 mb-8">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>

      <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Order #{order.id.slice(-8).toUpperCase()}</h1>
          <p className="text-sm text-gray-500 mt-1">{new Date(order.createdAt).toLocaleDateString("en-BD", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
        </div>
        <button onClick={() => downloadInvoice(order)} className="btn-brand py-2 px-4 text-sm">
          <Download className="h-4 w-4" /> Download Invoice
        </button>
      </div>

      {/* Real-time tracking timeline */}
      <div className="glass-card p-6 mb-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <h2 className="font-bold text-gray-900 text-sm uppercase tracking-widest">Live Order Tracking</h2>
        </div>
        <div className="flex items-center overflow-x-auto pb-2">
          {STATUSES.map((s, i) => {
            const done = i <= currentStep;
            const active = i === currentStep;
            return (
              <div key={s} className="flex items-center" style={{ minWidth: i < STATUSES.length - 1 ? "auto" : undefined }}>
                <div className={`flex flex-col items-center text-center ${done ? "tracking-step-done" : "tracking-step-pending"}`}>
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all ${active ? "border-yellow-500 bg-yellow-50 scale-110" : done ? "border-green-600 bg-green-600" : "border-gray-300 bg-white"}`}>
                    {done && !active ? <CheckCircle className="h-4 w-4 text-white" /> : active ? <Clock className="h-4 w-4 text-yellow-600" /> : <Circle className="h-4 w-4 text-gray-300" />}
                  </div>
                  <span className={`mt-1 text-xs font-semibold whitespace-nowrap ${active ? "text-yellow-600" : done ? "text-green-700" : "text-gray-400"}`}>
                    {STATUS_LABELS[s]}
                  </span>
                </div>
                {i < STATUSES.length - 1 && <div className={`h-0.5 w-10 flex-shrink-0 mx-1 transition-all ${i < currentStep ? "bg-green-600" : "bg-gray-200"}`} />}
              </div>
            );
          })}
        </div>

        {/* Event log */}
        {trackingEvents.length > 0 && (
          <div className="mt-6 border-t border-gray-100 pt-4 space-y-3">
            {[...trackingEvents].reverse().map((e) => (
              <div key={e.id} className="flex gap-3 text-sm">
                <CheckCircle className="h-4 w-4 mt-0.5 text-green-600 shrink-0" />
                <div>
                  <p className="font-semibold text-gray-800">{STATUS_LABELS[e.status] ?? e.status}</p>
                  {e.note && <p className="text-gray-500 text-xs">{e.note}</p>}
                  <p className="text-xs text-gray-400">{new Date(e.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order details */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="glass-card p-6">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Package className="h-4 w-4 text-green-700" /> Order Items</h2>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <div>
                  <p className="font-semibold text-gray-900">{item.product.name}</p>
                  <p className="text-xs text-gray-500">{item.quantity}× · {item.product.potency ?? ""}</p>
                </div>
                <p className="font-bold text-gray-900">৳{(item.price * item.quantity).toFixed(0)}</p>
              </div>
            ))}
            <div className="border-t pt-3 flex justify-between font-extrabold text-green-800">
              <span>Total</span><span>৳{order.total}</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="font-bold text-gray-900 mb-4">Delivery Info</h2>
          <div className="space-y-2 text-sm text-gray-700">
            <p><span className="font-semibold">Address:</span> {order.address}</p>
            <p><span className="font-semibold">Phone:</span> {order.phone}</p>
            <p><span className="font-semibold">Payment:</span> {order.paymentMethod}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
