"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { motion } from "framer-motion";
import { LogIn, Loader2, CheckCircle } from "lucide-react";

function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);

      const data = await apiFetch("/auth/token", {
        method: "POST",
        body: formData,
        auth: false,
      });

      localStorage.setItem("token", data.access_token);
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card p-8 max-w-md w-full border border-border">
      <div className="flex items-center gap-2 mb-6">
        <LogIn className="text-accent-gold w-6 h-6" />
        <h1 className="text-2xl font-bold text-text-primary">Welcome Back</h1>
      </div>

      {registered && (
        <div className="mb-6 p-3 bg-accent-emerald/10 border border-accent-emerald/30 rounded-lg flex items-center gap-2 text-accent-emerald text-sm">
          <CheckCircle className="w-4 h-4" />
          Registration successful! Please log in.
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Username</label>
          <input
            type="text"
            required
            className="w-full p-2 bg-bg-secondary border border-border rounded-lg text-text-primary focus:ring-2 focus:ring-accent-gold outline-none"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Password</label>
          <input
            type="password"
            required
            className="w-full p-2 bg-bg-secondary border border-border rounded-lg text-text-primary focus:ring-2 focus:ring-accent-gold outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <p className="text-red-400 text-sm font-medium">{error}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-accent-gold hover:bg-yellow-600 text-black font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-accent-gold/20"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : "Log In"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-text-muted">
        New to Money Mentor?{" "}
        <a href="/auth/register" className="text-accent-gold hover:underline">Create an account</a>
      </p>
    </div>
  );
}

function LoginFormFallback() {
  return (
    <div className="glass-card p-8 max-w-md w-full border border-border flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-accent-gold" />
    </div>
  );
}

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Suspense fallback={<LoginFormFallback />}>
          <LoginForm />
        </Suspense>
      </motion.div>
    </div>
  );
}
