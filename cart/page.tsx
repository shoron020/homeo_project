"use client";

import { CreditCard, ShoppingBag, Smartphone, Trash2, Truck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { authClient } from "~/server/better-auth/client";

interface CartItem {
  id: string; quantity: number;
  product: { id: string; name: string; price: number; stock: number; potency: string | null; category: { name: string } };
}

const PAYMENT_METHODS = [
  { id: "CARD", label: "Credit / Debit Card", icon: <CreditCard className="h-5 w-5" /> },
  { id: "BKASH", label: "bKash", icon: <Smartphone className="h-5 w-5 text-pink-600" /> },
  { id: "NAGAD", label: "Nagad", icon: <Smartphone className="h-5 w-5 text-orange-500" /> },
  { id: "COD", label: "Cash on Delivery", icon: <Truck className="h-5 w-5 text-green-700" /> },
];

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState("COD");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [placing, setPlacing] = useState(false);
  const { data: session } = authClient.useSession();
  const router = useRouter();

  const fetchCart = () => {
    if (!session) return;
    setLoading(true);
    fetch("/api/cart").then((r) => r.json()).then((d) => { setItems(d as CartItem[]); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchCart(); }, [session]);

  const remove = async (productId: string) => {
    await fetch("/api/cart", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId }) });
    fetchCart();
  };

  const updateQty = async (productId: string, qty: number) => {
    if (qty < 1) return;
    await fetch("/api/cart", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId, quantity: qty }) });
    fetchCart();
  };

  const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const shipping = subtotal >= 500 ? 0 : 60;
  const total = subtotal + shipping;

  const placeOrder = async () => {
    if (!address.trim()) { toast.error("Please enter delivery address"); return; }
    if (!phone.trim()) { toast.error("Please enter phone number"); return; }
    setPlacing(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paymentMethod: method, address, phone,
        items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity, price: i.product.price })),
      }),
    });
    if (res.ok) {
      const order = await res.json() as { id: string };
      toast.success("Order placed successfully! 🎉");
      router.push(`/dashboard/orders/${order.id}`);
    } else {
      toast.error("Something went wrong. Please try again.");
    }
    setPlacing(false);
  };

  if (!session) return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center px-4">
      <ShoppingBag className="h-16 w-16 text-gray-300" />
      <h2 className="text-xl font-bold text-gray-700">Sign in to see your cart</h2>
      <Link href="/login" className="btn-brand">Sign In</Link>
    </div>
  );

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-green-700 border-t-transparent" /></div>;

  if (items.length === 0) return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center px-4">
      <ShoppingBag className="h-16 w-16 text-gray-300" />
      <h2 className="text-xl font-bold text-gray-700">Your cart is empty</h2>
      <Link href="/products" className="btn-brand">Browse Products</Link>
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="section-title mb-8">My Cart</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="glass-card flex items-center gap-4 p-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-green-50 text-3xl">🌿</div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-gray-900 truncate">{item.product.name}</h3>
                <p className="text-xs text-gray-500">{item.product.category.name} {item.product.potency && `· ${item.product.potency}`}</p>
                <p className="text-sm font-bold text-green-800 mt-1">৳{item.product.price}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => updateQty(item.product.id, item.quantity - 1)} className="h-7 w-7 rounded-full border border-gray-200 text-center font-bold hover:bg-gray-50">−</button>
                <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                <button onClick={() => updateQty(item.product.id, item.quantity + 1)} className="h-7 w-7 rounded-full border border-gray-200 text-center font-bold hover:bg-gray-50">+</button>
              </div>
              <div className="text-right min-w-[5rem]">
                <p className="text-sm font-extrabold text-gray-900">৳{(item.product.price * item.quantity).toFixed(0)}</p>
                <button onClick={() => remove(item.product.id)} className="mt-1 text-red-400 hover:text-red-600 transition">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order summary + checkout */}
        <div className="space-y-4">
          <div className="glass-card p-6">
            <h2 className="font-bold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span className="font-semibold">৳{subtotal}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Shipping</span><span className={shipping === 0 ? "text-green-700 font-semibold" : "font-semibold"}>{shipping === 0 ? "FREE" : `৳${shipping}`}</span></div>
              {shipping > 0 && <p className="text-xs text-green-600">Add ৳{500 - subtotal} more for free shipping</p>}
              <div className="border-t border-gray-200 pt-2 flex justify-between text-base font-extrabold">
                <span>Total</span><span className="text-green-800">৳{total}</span>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="glass-card p-6">
            <h2 className="font-bold text-gray-900 mb-4">Payment Method</h2>
            <div className="space-y-2">
              {PAYMENT_METHODS.map((m) => (
                <button key={m.id} onClick={() => setMethod(m.id)}
                  className={`flex w-full items-center gap-3 rounded-xl border-2 p-3 text-sm font-semibold transition ${method === m.id ? "border-green-700 bg-green-50 text-green-800" : "border-gray-200 hover:border-green-300"}`}>
                  {m.icon} {m.label}
                  {method === m.id && <span className="ml-auto h-4 w-4 rounded-full border-2 border-green-700 bg-green-700" />}
                </button>
              ))}
            </div>
          </div>

          {/* Delivery details */}
          <div className="glass-card p-6">
            <h2 className="font-bold text-gray-900 mb-4">Delivery Details</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Phone Number</label>
                <input type="tel" placeholder="+880 1XXX-XXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Delivery Address</label>
                <textarea rows={3} placeholder="House, Road, Area, City…" value={address} onChange={(e) => setAddress(e.target.value)} className="input-field resize-none" />
              </div>
            </div>
          </div>

          <button onClick={placeOrder} disabled={placing} className="btn-brand w-full justify-center py-4 text-base">
            {placing ? "Placing Order…" : `Place Order – ৳${total}`}
          </button>
        </div>
      </div>
    </div>
  );
}
