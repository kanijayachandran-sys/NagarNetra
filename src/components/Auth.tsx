import React, { useState } from "react";
import { User } from "../types";
import { ShieldCheck, UserCheck, Key, Mail, Landmark, Sparkles } from "lucide-react";
import { motion } from "motion/react";

interface AuthProps {
  onLoginSuccess: (user: User) => void;
}

export default function Auth({ onLoginSuccess }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"citizen" | "volunteer" | "authority">("citizen");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password || (!isLogin && !username)) {
      setError("Please fill out all required fields.");
      setLoading(false);
      return;
    }

    setTimeout(() => {
      // Simulate database login/signup
      let user: User;

      if (isLogin) {
        // Mock authentication success
        user = {
          id: `usr-${Math.floor(Math.random() * 100000)}`,
          email: email,
          username: email.split("@")[0],
          points: 0,
          badges: [],
          role: role, // bind selected role for demo testing ease
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
          trustScore: 1.0,
          location: {
            lat: 12.9716,
            lng: 77.5946,
            ward: "Ward 45 - Central",
          },
        };
      } else {
        // Sign Up with empty points/rewards as mandatory constraint
        user = {
          id: `usr-${Math.floor(Math.random() * 100000)}`,
          email: email,
          username: username,
          points: 0,
          badges: [],
          role: role,
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username)}`,
          trustScore: 1.0,
          location: {
            lat: 12.9716,
            lng: 77.5946,
            ward: "Ward 45 - Central",
          },
        };
      }

      onLoginSuccess(user);
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans">
      {/* Dynamic Background Accents */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>

      {/* Main Container */}
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 gap-6 z-10">
        
        {/* Left Side: Brand Concept Card (Bento Grid Style) */}
        <div className="md:col-span-7 bg-[#121212] border border-white/5 rounded-3xl p-8 flex flex-col justify-between shadow-2xl">
          <div>
            <div className="flex items-center gap-2 mb-8">
              <div className="p-2 bg-teal-500/10 text-teal-400 rounded-xl border border-teal-500/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="font-display font-medium text-xl tracking-tight text-white">NagarNetra</span>
              <span className="px-2.5 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-[9px] text-teal-400 font-mono font-bold uppercase tracking-widest">CIVIC AI</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-medium tracking-tight mb-4 leading-[1.15]">
              Hyperlocal Civic Governance, <br />
              <span className="italic text-teal-300">Powered by AI Trust.</span>
            </h1>

            <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed mb-6 max-w-md font-light">
              Collaboratively identify, verify, and resolve municipal problems like potholes, waste dumps, and water leaks. Powered by decentralized civic trust models and Gemini AI governance algorithms.
            </p>

            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="bg-[#181818] border border-white/5 rounded-2xl p-4">
                <span className="text-[10px] text-neutral-500 block mb-1 uppercase font-bold tracking-widest font-mono">AI Audit Routing</span>
                <span className="text-xs font-semibold text-neutral-300">Auto Department Despatch</span>
              </div>
              <div className="bg-[#181818] border border-white/5 rounded-2xl p-4">
                <span className="text-[10px] text-neutral-500 block mb-1 uppercase font-bold tracking-widest font-mono">Citizen Audit</span>
                <span className="text-xs font-semibold text-neutral-300">Decentralised Verifications</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between text-[9px] text-neutral-500 font-mono">
            <span>STRICTLY LIVE HACKATHON DEMO</span>
            <span>v1.0.0-PROD</span>
          </div>
        </div>

        {/* Right Side: Auth Form (Bento Card Style) */}
        <div className="md:col-span-5 bg-[#121212] border border-white/5 rounded-3xl p-8 flex flex-col justify-center shadow-2xl">
          <div className="mb-6">
            <h2 className="text-xl font-display font-medium text-white">{isLogin ? "Sign In" : "Register Profile"}</h2>
            <p className="text-xs text-neutral-500 mt-1 font-light">
              {isLogin ? "Access your municipal network dashboard." : "Create your zero-rewards initial profile."}
            </p>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-3.5 rounded-xl mb-4 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-1.5 font-mono">Username</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500">
                    <UserCheck className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Enter your handle"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-[#181818] border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-teal-500/30 focus:ring-1 focus:ring-teal-500/20 transition-all font-medium font-sans"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-1.5 font-mono">Email Address</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  placeholder="name@ward.gov"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#181818] border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-teal-500/30 focus:ring-1 focus:ring-teal-500/20 transition-all font-medium font-sans"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-1.5 font-mono">Secret Key / Password</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500">
                  <Key className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#181818] border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-teal-500/30 focus:ring-1 focus:ring-teal-500/20 transition-all font-medium font-sans"
                  required
                />
              </div>
            </div>

            {/* Role selection Bento option */}
            <div className="pt-2">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-1.5 font-mono">Simulate Network Role</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRole("citizen")}
                  className={`py-2 rounded-xl text-[9px] uppercase tracking-widest font-extrabold border transition-all cursor-pointer ${
                    role === "citizen"
                      ? "bg-teal-500/20 text-teal-300 border-teal-500/40"
                      : "bg-[#181818] border-white/5 text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  Citizen
                </button>
                <button
                  type="button"
                  onClick={() => setRole("volunteer")}
                  className={`py-2 rounded-xl text-[9px] uppercase tracking-widest font-extrabold border transition-all cursor-pointer ${
                    role === "volunteer"
                      ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40"
                      : "bg-[#181818] border-white/5 text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  Volunteer
                </button>
                <button
                  type="button"
                  onClick={() => setRole("authority")}
                  className={`py-2 rounded-xl text-[9px] uppercase tracking-widest font-extrabold border transition-all cursor-pointer ${
                    role === "authority"
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                      : "bg-[#181818] border-white/5 text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  Authority
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-teal-400 to-indigo-500 hover:from-teal-500 hover:to-indigo-600 text-slate-950 font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md active:scale-[0.98] mt-4 flex items-center justify-center gap-1 cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  {isLogin ? "Authenticate Session" : "Create Zero-Points Profile"}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs text-neutral-400 hover:text-teal-400 transition-colors font-medium underline underline-offset-4 cursor-pointer"
            >
              {isLogin ? "Don't have a profile? Register one" : "Already verified? Authenticate here"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
