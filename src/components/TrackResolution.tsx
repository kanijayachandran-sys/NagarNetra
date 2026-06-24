import React, { useState } from "react";
import { Issue, PushNotification, User } from "../types";
import { 
  CheckCircle, 
  MapPin, 
  Clock, 
  User as UserIcon, 
  CheckSquare, 
  MessageSquare, 
  Send, 
  Star,
  Bell,
  Check
} from "lucide-react";
import { motion } from "motion/react";

interface TrackResolutionProps {
  currentUser: User | null;
  issues: Issue[];
  notifications: PushNotification[];
  onAddFeedback: (issueId: string, rating: number, comment: string) => void;
  onClearNotifications: () => void;
}

export default function TrackResolution({ 
  currentUser, 
  issues, 
  notifications, 
  onAddFeedback,
  onClearNotifications 
}: TrackResolutionProps) {
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(issues[0]?.id || null);
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const activeIssue = issues.find((i) => i.id === selectedIssueId);

  // Compute status timeline steps
  const steps = ["Reported", "Verified", "Assigned", "In Progress", "Fixed"];

  const getStepIndex = (status: string) => {
    return steps.indexOf(status);
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeIssue) return;

    onAddFeedback(activeIssue.id, feedbackRating, feedbackComment);
    setFeedbackSubmitted(true);
    setFeedbackComment("");
    
    setTimeout(() => {
      setFeedbackSubmitted(false);
    }, 2000);
  };

  return (
    <div className="space-y-6 font-sans pb-12">
      
      {/* Dynamic Header Block */}
      <div className="bg-[#121212] border border-white/5 rounded-3xl p-6 shadow-xl">
        <h1 className="text-xl sm:text-2xl font-display font-medium text-white">Track Grievance Resolution</h1>
        <p className="text-xs text-neutral-400 mt-1 font-light">
          Monitor active dispatch works, inspect official department remarks, and close resolved tickets with citizen feedback loops.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left List Pane: Active tracked issues (Span 4) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-medium text-white text-sm">Tracked Tickets ({issues.length})</h2>
            {notifications.length > 0 && (
              <button 
                onClick={onClearNotifications}
                className="text-[10px] text-teal-400 font-bold hover:text-teal-300 uppercase tracking-wider font-mono cursor-pointer"
              >
                Clear Notifications
              </button>
            )}
          </div>

          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {issues.map((issue) => (
              <div
                key={issue.id}
                onClick={() => { setSelectedIssueId(issue.id); setFeedbackSubmitted(false); }}
                className={`p-4 border rounded-2xl cursor-pointer transition-all flex items-start gap-3.5 bg-[#121212] shadow-xl ${
                  selectedIssueId === issue.id 
                    ? "border-teal-500/50 bg-teal-950/15" 
                    : "border-white/5"
                }`}
              >
                <div className={`p-1.5 rounded-xl text-black ${
                  issue.status === "Fixed" 
                    ? "bg-emerald-400" 
                    : issue.status === "In Progress"
                    ? "bg-indigo-400"
                    : "bg-amber-400"
                }`}>
                  <Clock className="w-4 h-4" />
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-center text-[9px] font-mono font-bold uppercase text-neutral-500">
                    <span>{issue.issueType}</span>
                    <span className={issue.status === "Fixed" ? "text-emerald-400" : "text-amber-400"}>
                      {issue.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-xs font-sans line-clamp-1">{issue.title}</h3>
                  <div className="flex justify-between items-center text-[9px] text-neutral-500 pt-1.5 border-t border-white/5 mt-1 font-mono">
                    <span>{issue.ward}</span>
                    <span>{new Date(issue.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Local push notifications panel */}
          <div className="bg-[#121212] border border-white/5 rounded-3xl p-5 space-y-3">
            <h3 className="font-display font-medium text-white text-xs flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-teal-400 animate-bounce" />
              Live System Telemetry Notifications
            </h3>

            {notifications.length === 0 ? (
              <p className="text-[10px] text-neutral-500 leading-normal font-mono uppercase tracking-wider">
                No active updates. Ticket changes trigger real-time simulated push alerts here.
              </p>
            ) : (
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                {notifications.map((notif) => (
                  <div 
                    key={notif.id}
                    className="p-2.5 rounded-lg bg-black/60 border border-white/5 text-[10px] leading-relaxed"
                  >
                    <div className="font-bold text-white flex justify-between items-center">
                      <span>{notif.title}</span>
                      <span className="text-[8px] font-mono text-neutral-500">
                        {new Date(notif.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-neutral-400 text-[9px] mt-0.5 font-light">{notif.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Details Pane: Linear Timeline & feedback survey (Span 8) */}
        <div className="lg:col-span-8">
          {activeIssue ? (
            <div className="bg-[#121212] border border-white/5 rounded-3xl p-6 shadow-xl space-y-6">
              
              {/* Ticket Meta Details */}
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-4 gap-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono font-bold bg-[#181818] px-2.5 py-1 rounded text-neutral-400 border border-white/5 uppercase tracking-widest">
                    ID: {activeIssue.id.toUpperCase()}
                  </span>
                  <h2 className="font-display font-medium text-white text-base leading-tight mt-1">
                    {activeIssue.title}
                  </h2>
                  <div className="flex items-center gap-1 text-[10px] text-neutral-500 font-mono">
                    <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    {activeIssue.ward} | Coords: {activeIssue.latitude.toFixed(4)}, {activeIssue.longitude.toFixed(4)}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-neutral-500 font-mono">Department Route:</span>
                  <div className="font-bold text-white text-xs font-sans">{activeIssue.assignedDepartment || "SLA Assigning..."}</div>
                </div>
              </div>

              {/* Progress Flow Timeline */}
              <div className="space-y-4">
                <h3 className="font-mono font-medium text-neutral-500 text-[10px] uppercase tracking-widest">Resolution Pipeline</h3>
                
                {/* Visual Steps Node Strip */}
                <div className="flex items-center justify-between relative px-2.5 py-4">
                  {/* Background progress line */}
                  <div className="absolute left-10 right-10 top-1/2 -translate-y-1/2 h-0.5 bg-neutral-800 z-0"></div>
                  <div 
                    className="absolute left-10 top-1/2 -translate-y-1/2 h-0.5 bg-teal-400 z-0 transition-all duration-700"
                    style={{ width: `${(getStepIndex(activeIssue.status) / (steps.length - 1)) * 100}%` }}
                  ></div>

                  {steps.map((step, idx) => {
                    const currentIdx = getStepIndex(activeIssue.status);
                    const isDone = idx <= currentIdx;
                    const isCurrent = idx === currentIdx;

                    return (
                      <div key={step} className="flex flex-col items-center z-10 relative">
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                          isDone 
                            ? "bg-teal-400 border-teal-400 text-black shadow-md shadow-teal-500/20" 
                            : "bg-neutral-900 border-white/10 text-neutral-500"
                        }`}>
                          {isDone ? <Check className="w-4 h-4" /> : <span className="text-[10px] font-mono font-bold">{idx + 1}</span>}
                        </div>
                        <span className={`text-[9px] font-bold mt-2 font-mono tracking-wider ${
                          isCurrent ? "text-teal-400" : "text-neutral-500"
                        }`}>
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Granular Timeline events list */}
                <div className="border-t border-white/5 pt-4 space-y-3 max-h-[180px] overflow-y-auto pr-1">
                  {activeIssue.timeline.map((event, idx) => (
                    <div key={idx} className="flex gap-4 items-start text-xs leading-normal">
                      <div className="w-2.5 h-2.5 rounded-full bg-teal-400 shrink-0 mt-1.5 relative">
                        {idx !== activeIssue.timeline.length - 1 && (
                          <div className="absolute left-1 h-12 w-0.5 bg-neutral-800 top-2.5"></div>
                        )}
                      </div>
                      <div className="flex-1 pb-2">
                        <div className="flex justify-between font-bold text-neutral-300 text-[11px] font-sans">
                          <span>{event.title}</span>
                          <span className="text-[9px] font-mono font-normal text-neutral-500">
                            {new Date(event.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-neutral-400 text-[10px] mt-0.5 font-light">{event.description}</p>
                        {event.remarks && (
                          <div className="mt-1 px-2.5 py-1.5 bg-[#181818] border border-white/5 rounded-lg text-[10px] text-neutral-300 italic font-sans font-light">
                            Remarks: {event.remarks}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Citizen Completion Feedback Survey (Star Rating + comment) */}
              <div className="border-t border-white/5 pt-5 mt-5">
                {activeIssue.status === "Fixed" ? (
                  activeIssue.citizenFeedback ? (
                    <div className="bg-emerald-950/10 border border-emerald-900/20 rounded-2xl p-4 space-y-2">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs font-display">
                        <CheckCircle className="w-4.5 h-4.5 text-emerald-400 shrink-0 animate-pulse" />
                        Citizen Survey Completed
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star 
                            key={idx} 
                            className={`w-4 h-4 ${
                              idx < activeIssue.citizenFeedback!.rating 
                                ? "text-amber-400 fill-amber-400" 
                                : "text-neutral-800"
                            }`} 
                          />
                        ))}
                      </div>

                      <p className="text-neutral-300 text-[11px] leading-relaxed font-sans font-light">
                        &ldquo;{activeIssue.citizenFeedback!.comment}&rdquo;
                      </p>
                    </div>
                  ) : (
                    feedbackSubmitted ? (
                      <div className="bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 text-xs p-4 rounded-2xl font-medium">
                        Feedback logged! Thank you for validating the municipal repair works.
                      </div>
                    ) : (
                      <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                          <h4 className="font-display font-medium text-white text-sm">Post-Resolution Feedback</h4>
                          <p className="text-[10px] text-neutral-400 font-light">The authority marked this ticket as resolved. Rate their repair quality below:</p>
                        </div>

                        {/* Interactive Star nodes */}
                        <div className="flex items-center gap-1.5">
                          {Array.from({ length: 5 }).map((_, idx) => {
                            const starVal = idx + 1;
                            const isSelect = starVal <= feedbackRating;
                            return (
                              <button
                                type="button"
                                key={idx}
                                onClick={() => setFeedbackRating(starVal)}
                                className="focus:outline-none hover:scale-105 transition-transform cursor-pointer"
                              >
                                <Star className={`w-6 h-6 ${
                                  isSelect ? "text-amber-400 fill-amber-400" : "text-neutral-800"
                                }`} />
                              </button>
                            );
                          })}
                        </div>

                        <div>
                          <textarea
                            placeholder="Tell us what you think of the resolved works. Were they clean, complete, and durable?"
                            value={feedbackComment}
                            onChange={(e) => setFeedbackComment(e.target.value)}
                            rows={3}
                            className="w-full bg-[#181818] border border-white/5 rounded-xl p-3.5 text-xs text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-teal-500/30 font-sans"
                            required
                          />
                        </div>

                        <button
                          type="submit"
                          className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold px-4 py-2 rounded-xl text-xs uppercase tracking-widest transition-all shadow-xl cursor-pointer"
                        >
                          Submit Resolution Survey
                        </button>
                      </form>
                    )
                  )
                ) : (
                  <div className="bg-neutral-900/50 border border-white/5 rounded-2xl p-4 text-[11px] text-neutral-400 leading-relaxed font-light">
                    🔔 Post-resolution feedback survey will unlock once the municipal maintenance department completes and closes the work ticket. Currently <b>{activeIssue.status}</b>.
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="bg-[#121212] border border-white/5 rounded-3xl p-12 text-center shadow-xl">
              <p className="text-sm font-bold text-neutral-400 font-display">Select a tracked ticket from the list panel.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
