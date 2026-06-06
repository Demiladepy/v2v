"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, Loader2, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate network delay for auth
    setTimeout(() => {
      // We will route straight to dashboard
      // The dashboard will show a mock authenticated state
      router.push("/dashboard");
    }, 1500);
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 min-h-dvh bg-background relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-brand/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-brand-light/5 blur-[100px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-brand rounded-full flex items-center justify-center shadow-sh-md mb-4">
            <Mic className="w-8 h-8 text-white stroke-[2.5]" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground font-serif">
            Welcome Back
          </h1>
          <p className="text-muted-foreground mt-2 text-sm font-sans">
            Sign in to your merchant dashboard
          </p>
        </div>

        <Card className="border-border/40 shadow-sh-md bg-card/60 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="font-serif">Merchant Login</CardTitle>
            <CardDescription className="font-sans">Enter your credentials to access the V2V protocol.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground uppercase tracking-widest font-sans">
                  Email
                </label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@cafeone.com"
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent font-sans"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground uppercase tracking-widest font-sans">
                  Password
                </label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent font-sans"
                  required
                />
              </div>
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full mt-6 py-3 px-4 bg-brand hover:bg-brand/90 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm font-sans disabled:opacity-70 disabled:pointer-events-none"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
}
