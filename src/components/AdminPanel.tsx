import React, { useState } from "react";
import { Issue, WardStat } from "../types";
import { 
  ShieldCheck, 
  MapPin, 
  Clock, 
  Users, 
  CheckSquare, 
  Sparkles, 
  AlertTriangle, 
  ExternalLink,
  Briefcase,
  Play
} from "lucide-react";
import { motion } from "motion/react";

interface AdminPanelProps {
  issues: Issue[];
  wardStats: WardStat[];
  onDispatchIssue: (issueId: string, status: "Assigned" | "In Progress" | "Fixed", remark?: string) => void;
}

export default function AdminPanel({ issues, wardStats, onDispatchIssue }: AdminPanelProps) {
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(issues[0]?.id || null);
  const [adminRemark, setAdminRemark] = useState("");

  const activeIssue = issues.find((i) => i.id === selectedIssueId);

  // Helper: calculate numerical AI Priority Score (Out of 100) to auto-prioritize queue
  const getPriorityScore = (issue: Issue) => {
    let score = 0;
    // Severity weight (Max 40)
    if (issue.severity === "Critical") score += 40;
    else if (issue.severity === "Moderate") score += 25;
    else score += 10;

    // Urgency weight (Max 30)
    if (issue.urgency === "High") score += 30;
    else if (issue.urgency === "Medium") score += 15;
    else score += 5;

    // Verification consensus boost (Max 30)
    if (issue.isVerified) score += 30;
    else score += issue.upvotes >= 5 ? 15 : 5;

    return score;
  };

  // Sort queue by priority score descending
  const prioritizedQueue = [...issues].sort((a, b) => getPriorityScore(b) - getPriorityScore(a));

  const handleActionClick = (status: "Assigned" | "In Progress" | "Fixed") => {
    if (!activeIssue) return;
    onDispatchIssue(activeIssue.id, status, adminRemark || undefined);
    setAdminRemark("");
  };

  return (
    <div className="space-y-6 font-sans pb-12">
      
      {/* Page Header (Bento layout style) */}
      <div className="bg-[#121212] border border-white/5 rounded-3xl p-6 shadow-xl">
        <h1 className="text-xl sm:text-2xl font-display font-medium text-white">Municipal Authority Desk</h1>
        <p className="text-xs text-neutral-400 mt-1 font-light">
          Internal administrative console. Prioritize, dispatch, and review AI predictive alerts for local infrastructure stress.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: AI-Prioritized Complaint Queue (Span 7) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-medium text-white text-sm flex items-center gap-1.5">
              <Sparkles className="w-4.5 h-4.5 text-teal-400 animate-pulse" />
              AI-Prioritized Issue Queue
            </h2>
            <span className="text-[10px] text-neutral-500 font-mono font-bold uppercase tracking-wider">Sorted by Priority Index</span>
          </div>

          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {prioritizedQueue.map((issue) => {
              const priorityScore = getPriorityScore(issue);
              
              return (
                <div
                  key={issue.id}
                  onClick={() => setSelectedIssueId(issue.id)}
                  className={`p-4 border rounded-2xl bg-[#121212] cursor-pointer transition-all flex items-start gap-4 shadow-xl ${
                    selectedIssueId === issue.id 
                      ? "border-teal-500/50 bg-teal-950/15" 
                      : "border-white/5"
                  }`}
                >
                  {/* Circular Priority Indicator */}
                  <div className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center font-mono shrink-0 border ${
                    priorityScore >= 75 
                      ? "bg-rose-950/20 border-rose-900/30 text-rose-400 font-bold" 
                      : priorityScore >= 50
                      ? "bg-amber-950/20 border-amber-900/30 text-amber-400"
                      : "bg-neutral-900 border-white/5 text-neutral-500"
                  }`}>
                    <span className="text-[13px] leading-tight font-bold">{priorityScore}</span>
                    <span className="text-[6px] tracking-wider uppercase font-extrabold">Index</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold text-neutral-500 uppercase tracking-wider">
                      <span>{issue.issueType}</span>
                      <span>•</span>
                      <span>{issue.ward}</span>
                    </div>

                    <h3 className="font-bold text-white text-xs font-sans truncate mt-0.5">{issue.title}</h3>
                    
                    <div className="flex items-center justify-between pt-1.5 border-t border-white/5 mt-1.5">
                      <span className="text-[8.5px] font-bold uppercase tracking-wider text-teal-400 bg-teal-950/20 border border-teal-900/30 px-1.5 py-0.5 rounded">
                        SLA: {issue.slaHours || 48}h
                      </span>
                      <span className="text-[8.5px] font-semibold text-neutral-500 font-mono">
                        Status: <b className="text-neutral-300">{issue.status}</b>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Dispatch center & Predictive Alerts (Span 5) */}
        <div className="lg:col-span-5">
          {activeIssue ? (
            <div className="bg-[#121212] border border-white/5 rounded-3xl p-6 shadow-xl space-y-5 sticky top-24">
              
              {/* Card Title Header */}
              <div className="border-b border-white/5 pb-3">
                <span className="text-[9px] font-mono font-bold bg-[#181818] border border-white/5 px-2 py-0.5 rounded text-neutral-400 uppercase tracking-widest">
                  Active Routing Desk
                </span>
                <h3 className="font-display font-medium text-white text-sm mt-1">{activeIssue.title}</h3>
                <p className="text-[10px] text-neutral-400 mt-1 line-clamp-2 font-light">{activeIssue.description}</p>
              </div>

              {/* AI Predictive Risk alert block */}
              {activeIssue.riskAlertText && (
                <div className="bg-rose-950/20 border border-rose-900/30 rounded-2xl p-4 space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 text-rose-400 font-bold font-display">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    AI Cascading Risk Forecast
                  </div>
                  <p className="text-neutral-300 leading-relaxed text-[11px] font-light">{activeIssue.riskAlertText}</p>
                  <div className="pt-1.5 border-t border-rose-900/40 mt-1.5 text-[9px] text-rose-400 font-mono">
                    Escalation Division: <b>{activeIssue.escalationContact || "Grievance Division Office"}</b>
                  </div>
                </div>
              )}

              {/* Action Buttons to trigger workflow state transitions */}
              <div className="space-y-4 pt-1">
                <div>
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1.5 font-mono">
                    Authority Dispatch Remark
                  </label>
                  <input
                    type="text"
                    placeholder="Enter dispatch notes, worker ID, or inspection updates..."
                    value={adminRemark}
                    onChange={(e) => setAdminRemark(e.target.value)}
                    className="w-full bg-[#181818] border border-white/5 rounded-xl px-3 py-2 text-xs text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-teal-500/30 font-sans"
                  />
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block font-mono">
                    Dispatch Operations
                  </span>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleActionClick("Assigned")}
                      disabled={activeIssue.status === "Assigned"}
                      className="py-2 rounded-xl text-[9px] font-bold uppercase tracking-wider border bg-indigo-950/30 border-indigo-900/30 text-indigo-400 hover:bg-indigo-900/40 transition-colors disabled:opacity-40 cursor-pointer"
                    >
                      Assign Desk
                    </button>

                    <button
                      onClick={() => handleActionClick("In Progress")}
                      disabled={activeIssue.status === "In Progress"}
                      className="py-2 rounded-xl text-[9px] font-bold uppercase tracking-wider border bg-amber-950/30 border-amber-900/30 text-amber-400 hover:bg-amber-900/40 transition-colors disabled:opacity-40 cursor-pointer"
                    >
                      Work In Prog
                    </button>

                    <button
                      onClick={() => handleActionClick("Fixed")}
                      disabled={activeIssue.status === "Fixed"}
                      className="py-2 rounded-xl text-[9px] font-bold uppercase tracking-wider border bg-emerald-950/30 border-emerald-900/30 text-emerald-400 hover:bg-emerald-900/40 transition-colors disabled:opacity-40 cursor-pointer"
                    >
                      Mark Resolved
                    </button>
                  </div>
                </div>
              </div>

              {/* Department Performance Indicator */}
              <div className="bg-[#181818] border border-white/5 rounded-2xl p-4 text-[10px] text-neutral-400 leading-normal space-y-1">
                <div className="font-bold text-neutral-200 uppercase font-mono text-[9px] tracking-wider flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-teal-400" />
                  Department Performance Summary
                </div>
                <div>Routing Department: <b className="text-white font-medium">{activeIssue.assignedDepartment || "Public Works Department"}</b></div>
                <div>Avg SLA Resolution Time: <b className="text-white font-medium">18.5 Hours</b></div>
              </div>

            </div>
          ) : (
            <div className="bg-[#121212] border border-white/5 rounded-3xl p-8 text-center shadow-xl space-y-3 sticky top-24">
              <h4 className="font-bold text-white text-sm font-display">Select Ticket</h4>
              <p className="text-xs text-neutral-400 max-w-xs mx-auto font-light">Select a complaint from the prioritize index table to perform dispatches.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
