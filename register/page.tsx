"use client";

import { Leaf } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { authClient } from "~/server/better-auth/client";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await authClient.signUp.email({ name, email, password, callbackURL: "/" });
    if (error) { toast.error(error.message ?? "Registration failed"); setLoading(false); return; }
    toast.success("Account created! Welcome to HomeoPharm BD 🎉");
    router.push("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-700 to-green-900 mb-4">
            <Leaf className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">Create Account</h1>
          <p className="mt-2 text-sm text-gray-600">Join HomeoPharm BD and start your healing journey</p>
        </div>
        <div className="glass-card p-8">
          <div className="mb-5 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
            🎁 <strong>Signup Bonus:</strong> Earn 100 loyalty points on your first order!
          </div>
          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Full Name</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                className="input-field" placeholder="Your full name" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Email Address</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="input-field" placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Password</label>
              <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
                className="input-field" placeholder="At least 8 characters" />
            </div>
            <button type="submit" disabled={loading} className="btn-brand w-full justify-center py-3 text-base">
              {loading ? "Creating Account…" : "Create Account"}
            </button>
          </form>
          <p className="mt-5 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-green-700 hover:text-green-900">Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
