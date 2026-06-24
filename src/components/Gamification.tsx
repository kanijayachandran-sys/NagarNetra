import React from "react";
import { User } from "../types";
import { 
  Award, 
  Flame, 
  Trophy, 
  ShieldAlert, 
  Sparkles, 
  MapPin, 
  Star,
  Users,
  TrendingUp,
  Info
} from "lucide-react";
import { motion } from "motion/react";

interface GamificationProps {
  currentUser: User | null;
}

// Sample mock scoreboard entries for high-fidelity demonstration
const LEADERBOARD_ENTRIES = [
  { rank: 1, name: "Suresh Pillai", points: 840, ward: "Ward 45 - Central", badge: "Top Contributor" },
  { rank: 2, name: "Meera Nair", points: 790, ward: "Ward 45 - Central", badge: "Verifier" },
  { rank: 3, name: "Divya Krishnan", points: 650, ward: "Ward 82 - Indiranagar", badge: "Community Hero" },
  { rank: 4, name: "Aarav Mehta", points: 540, ward: "Ward 31 - Malleshwaram", badge: "Verifier" },
  { rank: 5, name: "Neha Sharma", points: 410, ward: "Ward 60 - Koramangala", badge: "Community Hero" }
];

export default function Gamification({ currentUser }: GamificationProps) {
  // Safe extraction of current points/badges, starting at empty as per mandatory rules
  const points = currentUser ? currentUser.points : 0;
  const badges = currentUser ? currentUser.badges : [];
  const username = currentUser ? currentUser.username : "Citizen Guest";
  const userRole = currentUser ? currentUser.role : "citizen";

  // Calculate current simulated place
  const userRank = points > 0 ? 6 : "Unranked";

  return (
    <div className="space-y-6 font-sans pb-12">
      
      {/* Header Bento Card */}
      <div className="bg-[#121212] border border-white/5 rounded-3xl p-6 shadow-xl">
        <div className="max-w-2xl space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-mono font-bold uppercase tracking-wider">
            <Trophy className="w-3.5 h-3.5" />
            NagarNetra Leaderboards
          </span>
          <h1 className="text-xl sm:text-2xl font-display font-medium text-white">Gamified Civic Recognition</h1>
          <p className="text-xs text-neutral-400 leading-relaxed font-light">
            NagarNetra uses volunteer proof-of-work gamification. Points are only allocated for verifications, auditing, and high citizen-rated resolutions. Strictly organic, non-pay-to-win.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: User profile progression card & badge catalog (Span 7) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* User Scoreboard Profile widget */}
          <div className="bg-[#121212] border border-white/5 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-950/10 rounded-full blur-2xl"></div>
            
            {/* Bottts Avatar */}
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-[#181818] border border-white/5 shrink-0">
              <img 
                src={currentUser?.avatar || "https://api.dicebear.com/7.x/bottts/svg?seed=Guest"} 
                alt="User Avatar" 
                className="w-full h-full object-contain"
              />
            </div>

            <div className="space-y-2 text-center sm:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                <h3 className="font-display font-medium text-white text-base">{username}</h3>
                <span className="text-[9px] font-mono uppercase tracking-wider font-extrabold px-2 py-0.5 rounded bg-[#181818] border border-white/5 text-neutral-400">
                  {userRole}
                </span>
              </div>

              <p className="text-neutral-400 text-xs font-light">
                Your civic account started on <b>{new Date().toLocaleDateString()}</b> with zero initial points.
              </p>

              <div className="flex justify-center sm:justify-start gap-6 pt-2">
                <div>
                  <span className="text-[10px] text-neutral-500 font-mono uppercase font-bold block">Current Points</span>
                  <span className="text-xl font-bold text-white font-mono">{points} XP</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 font-mono uppercase font-bold block">Consensus Rank</span>
                  <span className="text-xl font-bold text-teal-400 font-mono">#{userRank}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Badges Lock grid */}
          <div className="bg-[#121212] border border-white/5 rounded-3xl p-6 shadow-xl space-y-4">
            <div>
              <h3 className="font-display font-medium text-white text-sm">Community Badges Catalog</h3>
              <p className="text-[10px] text-neutral-500 mt-0.5 font-light">Badges are awarded automatically for verified contributions.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              {[
                { 
                  name: "Community Hero", 
                  req: "Register 5 complaints that pass verification", 
                  desc: "Awarded to citizens actively logging local failures.",
                  color: "border-rose-900/30 bg-rose-950/10 text-rose-400 hover:border-rose-500/30"
                },
                { 
                  name: "Verifier Badge", 
                  req: "Perform 10 on-site verification audits", 
                  desc: "Earned by volunteers moderating community queues.",
                  color: "border-indigo-900/30 bg-indigo-950/10 text-indigo-400 hover:border-indigo-500/30"
                },
                { 
                  name: "Top Contributor", 
                  req: "Maintain over 95% trust rating across 15 audits", 
                  desc: "Reserved for elite volunteers of high consensus trust.",
                  color: "border-emerald-900/30 bg-emerald-950/10 text-emerald-400 hover:border-emerald-500/30"
                }
              ].map((badge) => {
                const isUnlocked = badges.includes(badge.name);
                return (
                  <div 
                    key={badge.name}
                    className={`border rounded-2xl p-4 flex flex-col justify-between text-left transition-all ${
                      isUnlocked ? badge.color : "bg-[#181818] border-white/5 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <Award className="w-5 h-5 shrink-0" />
                        <span className="font-bold text-[11px] font-display">{badge.name}</span>
                      </div>
                      <p className="text-[10px] text-neutral-400 leading-relaxed mb-3 font-light">{badge.desc}</p>
                    </div>

                    <div className="border-t border-dashed border-white/5 pt-2 text-[9px] text-neutral-500 font-mono font-medium leading-tight">
                      <span>Requirement:</span>
                      <p className="text-neutral-300 font-bold mt-0.5">{badge.req}</p>
                      <span className="text-[9px] font-bold mt-1.5 inline-block uppercase font-mono px-1.5 py-0.5 rounded bg-[#181818]">
                        {isUnlocked ? "✓ Unlocked" : "Locked"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Side: Scoreboard Leaderboard (Span 5) */}
        <div className="lg:col-span-5 bg-[#121212] border border-white/5 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="font-display font-medium text-white text-sm">Monthly Locality Scoreboard</h3>
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-teal-400 bg-teal-950/20 border border-teal-900/30 px-2 py-0.5 rounded">
              Bengaluru Central
            </span>
          </div>

          <div className="space-y-3">
            {LEADERBOARD_ENTRIES.map((entry) => (
              <div 
                key={entry.rank}
                className="flex items-center justify-between p-3 border border-white/5 rounded-2xl bg-[#181818]/50 hover:bg-[#181818] transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-extrabold text-xs shadow-sm ${
                    entry.rank === 1 
                      ? "bg-amber-950/40 text-amber-400 border border-amber-900/30" 
                      : entry.rank === 2
                      ? "bg-neutral-800 text-neutral-200 border border-neutral-750"
                      : "bg-neutral-900 border border-white/5 text-neutral-500"
                  }`}>
                    {entry.rank}
                  </span>
                  
                  <div>
                    <span className="font-bold text-white text-xs block font-display">{entry.name}</span>
                    <span className="text-[9px] text-neutral-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-teal-400" />
                      {entry.ward}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono font-extrabold text-white text-xs block">{entry.points} XP</span>
                  <span className="text-[9px] font-semibold text-indigo-400 bg-indigo-950/20 border border-indigo-900/30 px-1.5 py-0.5 rounded uppercase tracking-wider font-mono">
                    {entry.badge}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-indigo-950/10 border border-indigo-900/20 rounded-2xl text-[10px] text-indigo-400 leading-normal flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="font-light">
              Points are allocated instantly as soon as community audits agree with your findings, or when citizens rate resolved tickets. No pay-to-win mechanics.
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
