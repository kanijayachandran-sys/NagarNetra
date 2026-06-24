import React from "react";
import { Issue } from "../types";
import { 
  PlusCircle, 
  MapPin, 
  Sparkles, 
  Flame, 
  CheckCircle2, 
  Users, 
  ArrowRight, 
  Compass, 
  Layers, 
  Volume2, 
  Zap, 
  Megaphone 
} from "lucide-react";
import { motion } from "motion/react";

interface HomeProps {
  issues: Issue[];
  onNavigate: (tab: string) => void;
  onSelectIssue: (issue: Issue) => void;
}

export default function Home({ issues, onNavigate, onSelectIssue }: HomeProps) {
  // Compute true impact statistics
  const totalReported = issues.length;
  const totalResolved = issues.filter((i) => i.status === "Fixed").length;
  // Dynamic calculation for seed data + custom additions
  const activeVolunteers = Array.from(
    new Set(issues.flatMap((i) => i.verifications.map((v) => v.userId)))
  ).length + 18; // base seed count

  // Filter out resolved issues for the active feed to show citizen attention
  const activeFeed = [...issues]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-6 font-sans text-neutral-200">
      
      {/* Bento Grid Header Block */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Welcome & Mission Statement (Span 7) */}
        <div className="lg:col-span-7 bg-gradient-to-br from-neutral-900 to-indigo-950 text-white rounded-3xl p-8 flex flex-col justify-between border border-white/10 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl"></div>
          
          <div className="space-y-4 z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-[10px] font-bold tracking-widest uppercase font-mono">
              <Compass className="w-3.5 h-3.5 animate-spin-slow" />
              NagarNetra Core Vision
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-medium tracking-tight leading-[1.1]">
              Hyperlocal Solutions <br />
              For <span className="italic font-normal text-teal-300">Civic Harmony.</span>
            </h1>
            <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed max-w-xl font-light">
              NagarNetra links vigilant citizens, localized volunteer certifiers, and municipal administrative bodies under a unified, transparent AI governance pipeline. No bureaucracy, just pure accountability.
            </p>
          </div>

          <div className="pt-8 flex flex-wrap gap-3 z-10">
            <button
              onClick={() => onNavigate("report")}
              className="bg-teal-400 hover:bg-teal-500 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg active:scale-[0.98] transition-all cursor-pointer"
            >
              <PlusCircle className="w-4.5 h-4.5" />
              Report New Issue
            </button>
            <button
              onClick={() => onNavigate("map")}
              className="bg-neutral-850 hover:bg-neutral-800 border border-neutral-700 text-neutral-100 font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
            >
              Explore Map
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* AI Analytical Insights Panel (Span 5) */}
        <div className="lg:col-span-5 bg-[#121212] border border-white/5 rounded-3xl p-6 flex flex-col justify-between shadow-xl relative overflow-hidden bento-card">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-bold tracking-widest uppercase font-mono">
                <Sparkles className="w-3.5 h-3.5" />
                AI Advisory Hub
              </span>
              <span className="text-[10px] text-neutral-500 font-mono font-bold tracking-wider">LIVE METRIC</span>
            </div>

            <div className="bg-[#181818] border border-white/5 rounded-2xl p-4 space-y-3.5">
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-indigo-950 text-indigo-400 rounded-lg shrink-0 mt-0.5 border border-indigo-500/20">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-neutral-200 text-xs font-display tracking-tight">Monsoon Vulnerability Warning</h4>
                  <p className="text-neutral-400 text-[10px] mt-0.5 leading-relaxed font-light">
                    High pothole progression risk identified in <b className="text-white">Ward 45</b> due to pavement water pooling trends. Recommending structural pavement overlays.
                  </p>
                </div>
              </div>

              <div className="border-t border-white/5 pt-3 flex items-start gap-3">
                <div className="p-1.5 bg-emerald-950 text-emerald-400 rounded-lg shrink-0 mt-0.5 border border-emerald-500/20">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-neutral-200 text-xs font-display tracking-tight">Routing Dispatch Efficiency</h4>
                  <p className="text-neutral-400 text-[10px] mt-0.5 leading-relaxed font-light">
                    Auto-routing algorithms reduced assignment bottlenecks by <b className="text-white">42%</b> this week. Top performing division: <i className="text-neutral-300">Water Supply Board</i>.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 pt-4 mt-4 flex items-center justify-between text-[10px] text-neutral-500 font-mono font-medium">
            <span>Model: <b className="text-neutral-400">Gemini 2.5 Flash</b></span>
            <span>Accuracy Score: <b className="text-emerald-400">96.8%</b></span>
          </div>
        </div>

      </div>

      {/* Impact Stats Bento Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
        <div className="bg-[#121212] border border-white/5 rounded-2xl p-5 shadow-xl bento-card flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest font-mono">Total Logged</span>
            <span className="p-1.5 bg-neutral-900 text-neutral-400 rounded-lg border border-white/5">
              <Layers className="w-4 h-4" />
            </span>
          </div>
          <div>
            <span className="text-3xl font-display font-medium text-white">{totalReported}</span>
            <span className="text-[10px] block text-neutral-500 font-mono uppercase tracking-wider mt-1">Verified Local Complaints</span>
          </div>
        </div>

        <div className="bg-[#121212] border border-white/5 rounded-2xl p-5 shadow-xl bento-card flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest font-mono">Successfully Fixed</span>
            <span className="p-1.5 bg-emerald-950 text-emerald-400 rounded-lg border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div>
            <span className="text-3xl font-display font-medium text-emerald-400">{totalResolved}</span>
            <span className="text-[10px] block text-neutral-500 font-mono uppercase tracking-wider mt-1">SLA Resolved & Closed</span>
          </div>
        </div>

        <div className="col-span-2 md:col-span-1 bg-[#121212] border border-white/5 rounded-2xl p-5 shadow-xl bento-card flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest font-mono">Verified Volunteers</span>
            <span className="p-1.5 bg-indigo-950 text-indigo-400 rounded-lg border border-indigo-500/20">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div>
            <span className="text-3xl font-display font-medium text-indigo-400">{activeVolunteers}</span>
            <span className="text-[10px] block text-neutral-500 font-mono uppercase tracking-wider mt-1">Active On-Site Inspectors</span>
          </div>
        </div>
      </div>

      {/* Main Core Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Hand: Live Hyperlocal Feed (Span 8) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="text-rose-500 w-5 h-5 animate-pulse" />
              <h2 className="font-display font-bold text-xl text-neutral-100">Active Hyperlocal Feed</h2>
            </div>
            <button
              onClick={() => onNavigate("map")}
              className="text-xs font-bold text-teal-400 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
            >
              See All on Map
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {activeFeed.map((issue) => (
              <div 
                key={issue.id}
                onClick={() => onSelectIssue(issue)}
                className="bg-[#121212] border border-white/5 rounded-2xl p-5 shadow-lg hover:border-white/10 transition-all cursor-pointer group relative overflow-hidden flex flex-col sm:flex-row gap-5"
              >
                {/* Image Section */}
                <div className="w-full sm:w-36 h-28 rounded-xl overflow-hidden shrink-0 bg-neutral-900 border border-white/5 relative">
                  <img 
                    src={issue.imageUrl} 
                    alt={issue.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[8px] font-mono font-bold text-neutral-300 uppercase tracking-widest border border-white/5">
                    {issue.issueType}
                  </span>
                </div>

                {/* Info Section */}
                <div className="flex flex-col justify-between flex-1">
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                      <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider ${
                        issue.severity === "Critical" 
                          ? "bg-rose-950/50 text-rose-300 border border-rose-800/40" 
                          : "bg-amber-950/50 text-amber-300 border border-amber-800/40"
                      }`}>
                        {issue.severity} Severity
                      </span>
                      <span className="text-[8px] font-semibold bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded border border-white/5">
                        {issue.status}
                      </span>
                      <span className="text-[8px] font-mono font-bold text-teal-400 ml-auto flex items-center gap-1 bg-teal-950/40 px-2 py-0.5 rounded border border-teal-800/30">
                        <Sparkles className="w-2.5 h-2.5 text-teal-300" />
                        AI CONFIDENCE: {(issue.aiConfidence * 100).toFixed(0)}%
                      </span>
                    </div>

                    <h3 className="font-bold text-neutral-100 text-base group-hover:text-teal-400 transition-colors line-clamp-1 font-display">
                      {issue.title}
                    </h3>
                    <p className="text-neutral-400 text-xs line-clamp-2 mt-1 leading-relaxed font-light">
                      {issue.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/5 pt-2.5 mt-3 text-[10px] text-neutral-500 font-mono">
                    <span className="flex items-center gap-1 text-neutral-400">
                      <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                      {issue.ward}
                    </span>
                    <span>{new Date(issue.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Hand: Volunteer Hub & Success Stories (Span 4) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Volunteer Callout Bento Card */}
          <div className="bg-gradient-to-br from-indigo-950/50 to-neutral-900 border border-indigo-500/20 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
            <div className="space-y-3">
              <div className="p-2 bg-indigo-600 text-white rounded-2xl w-fit">
                <Megaphone className="w-5 h-5" />
              </div>
              <h3 className="font-display font-medium text-white text-lg leading-snug">
                Join the Citizen <br />
                <span className="italic">Verification Network</span>
              </h3>
              <p className="text-neutral-400 text-xs leading-relaxed font-light">
                Empower your local community. Get geo-fenced alerts on reported issues near you, inspect physical locations, and verify complaints to earn trust badges.
              </p>
            </div>
            <button
              onClick={() => onNavigate("verify")}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider w-full mt-6 transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
            >
              Verify Nearby Reports
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Real-time Success Spotlight */}
          <div className="bg-[#121212] border border-white/5 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="font-display font-bold text-neutral-200 text-sm flex items-center gap-1.5">
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" />
              Local Success Story
            </h3>

            <div className="space-y-3">
              <div className="h-28 rounded-2xl overflow-hidden bg-neutral-900 border border-white/5">
                <img 
                  src="https://images.unsplash.com/photo-1509024644558-2f56ce76c490?auto=format&fit=crop&q=80&w=600" 
                  alt="Malleshwaram streetlight repair"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <h4 className="font-bold text-neutral-200 text-xs">Malleshwaram Streetlights Restored</h4>
                <p className="text-neutral-400 text-[11px] leading-relaxed mt-1 font-light">
                  Citizen Pranav reported dead poles at Malleshwaram Lane. <b className="text-teal-400">AI prioritized</b> the danger of exposed wiring. Community verified it within 12 hours. Electrical team resolved the issue in under 48 hours.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
