import React, { useState } from "react";
import { Issue, User, Verification } from "../types";
import { 
  ShieldCheck, 
  MapPin, 
  ThumbsUp, 
  Check, 
  AlertOctagon, 
  Copy, 
  Award, 
  Sparkles,
  Info
} from "lucide-react";
import { motion } from "motion/react";

interface VerifySupportProps {
  currentUser: User | null;
  issues: Issue[];
  onVerifyIssue: (issueId: string, verification: Verification) => void;
  onUpvoteIssue: (issueId: string) => void;
}

export default function VerifySupport({ currentUser, issues, onVerifyIssue, onUpvoteIssue }: VerifySupportProps) {
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [verificationRemarks, setVerificationRemarks] = useState("");
  const [verificationStatus, setVerificationStatus] = useState<"verified" | "flagged_duplicate" | "flagged_fake">("verified");
  const [successMsg, setSuccessMsg] = useState("");

  const unverifiedIssues = issues.filter((i) => i.status === "Reported" || i.status === "Verified");
  const activeIssue = issues.find((i) => i.id === selectedIssueId);

  // Helper to calculate approximate distance in KM between two lat/lng coordinates (Haversine formula)
  const calculateDistanceKM = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  };

  // Perform citizen verification audit
  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !activeIssue || !verificationRemarks) return;

    // Simulated location check for demo: user is centered around Bangalore Central
    const userLat = currentUser.location?.lat || 12.9716;
    const userLng = currentUser.location?.lng || 77.5946;
    const distance = calculateDistanceKM(userLat, userLng, activeIssue.latitude, activeIssue.longitude);

    // Gated Check: distance validation
    const distancePassed = distance < 8.0; // 8km boundary threshold

    const newVerification: Verification = {
      id: `v-${Date.now()}`,
      issueId: activeIssue.id,
      userId: currentUser.id,
      username: currentUser.username + (currentUser.role === "volunteer" ? " (Certified Volunteer)" : ""),
      status: verificationStatus,
      remarks: verificationRemarks + (!distancePassed ? ` [Alert: Audit conducted from ${distance.toFixed(1)}km out-of-bounds]` : ""),
      timestamp: new Date().toISOString()
    };

    onVerifyIssue(activeIssue.id, newVerification);
    setSuccessMsg(`Citizen audit recorded successfully! Trust impact score updated.`);
    setVerificationRemarks("");
    
    setTimeout(() => {
      setSuccessMsg("");
      setSelectedIssueId(null);
    }, 2000);
  };

  return (
    <div className="space-y-6 font-sans pb-12">
      
      {/* Page header banner (Bento grid style) */}
      <div className="bg-[#121212] border border-white/5 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-950/40 border border-teal-500/20 text-teal-400 text-[10px] font-bold tracking-widest uppercase font-mono">
            <ShieldCheck className="w-3.5 h-3.5 animate-pulse" />
            Citizen Audit Core
          </span>
          <h1 className="text-xl sm:text-2xl font-display font-medium text-white pt-1">Verify Nearby Complaints</h1>
          <p className="text-xs text-neutral-400 leading-relaxed max-w-xl font-light">
            Audit reported issues to prevent duplicate filings, identify fake/malicious submissions, and build locality trust consensus.
          </p>
        </div>

        {/* Volunteer Trust Score Bento widget */}
        <div className="bg-[#181818] border border-white/10 rounded-2xl p-4 flex items-center gap-3 shrink-0 shadow-lg">
          <div className="p-2.5 bg-indigo-950/30 text-indigo-400 rounded-xl">
            <Award className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <span className="text-[10px] text-neutral-500 block uppercase font-mono font-bold tracking-wider">Your Trust Score</span>
            <span className="text-base font-bold text-white font-sans">
              {currentUser ? (currentUser.trustScore * 100).toFixed(0) : "100"}% consensus rating
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Active Issues awaiting verification audit (Span 7) */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="font-display font-medium text-white text-base flex items-center gap-1.5">
            <Info className="w-4 h-4 text-neutral-400" />
            Audit Queue ({unverifiedIssues.length} Active)
          </h2>

          {unverifiedIssues.length === 0 ? (
            <div className="bg-[#121212] border border-white/5 rounded-3xl p-12 text-center shadow-xl">
              <div className="w-12 h-12 bg-[#181818] text-neutral-400 rounded-full flex items-center justify-center mx-auto mb-3 border border-white/5">
                <Check className="w-6 h-6" />
              </div>
              <p className="font-bold text-neutral-200 text-sm">No pending audits!</p>
              <p className="text-xs text-neutral-400 mt-1 font-light">All reported issues have reached citizen-led verification consensus.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {unverifiedIssues.map((issue) => {
                const alreadyUpvoted = currentUser && issue.upvotedBy.includes(currentUser.id);
                return (
                  <div 
                    key={issue.id}
                    className={`bg-[#121212] border rounded-2xl p-5 shadow-xl transition-all relative overflow-hidden flex flex-col md:flex-row gap-5 ${
                      selectedIssueId === issue.id 
                        ? "border-teal-500/50 bg-teal-950/10" 
                        : "border-white/5 bg-[#121212]"
                    }`}
                  >
                    {/* Media Thumbnail */}
                    <div className="w-full md:w-28 h-24 rounded-xl overflow-hidden shrink-0 bg-neutral-900 border border-white/5">
                      <img 
                        src={issue.imageUrl} 
                        alt={issue.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="text-[9px] font-mono font-bold bg-[#181818] text-neutral-300 px-2 py-0.5 rounded uppercase tracking-wider">
                            {issue.issueType}
                          </span>
                          <span className="text-[9px] font-semibold text-rose-400 font-mono bg-rose-950/20 px-2 py-0.5 rounded border border-rose-900/30 tracking-wider">
                            {issue.severity}
                          </span>
                          <span className="text-[9px] text-neutral-400 font-medium ml-auto font-mono tracking-wider">{issue.ward}</span>
                        </div>

                        <h3 className="font-bold text-white text-sm font-display leading-tight">{issue.title}</h3>
                        <p className="text-neutral-400 text-xs line-clamp-2 mt-1 leading-normal font-light">{issue.description}</p>
                      </div>

                      <div className="flex items-center gap-3 pt-3.5 border-t border-white/5 mt-3">
                        {/* Audit Verification trigger button */}
                        <button
                          onClick={() => setSelectedIssueId(issue.id)}
                          className="bg-white hover:bg-neutral-100 text-black font-bold px-3.5 py-1.5 rounded-lg text-[10px] uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Conduct Audit
                        </button>

                        {/* Upvote support */}
                        <button
                          onClick={() => onUpvoteIssue(issue.id)}
                          disabled={alreadyUpvoted}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border transition-colors cursor-pointer ${
                            alreadyUpvoted 
                              ? "bg-teal-950/30 border-teal-900/30 text-teal-400 cursor-not-allowed" 
                              : "bg-[#1c1c1c] border-white/5 text-neutral-400 hover:text-white"
                          }`}
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          {alreadyUpvoted ? `Upvoted (${issue.upvotes})` : `Support / Upvote (${issue.upvotes})`}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Selected issue verification form (Span 5) */}
        <div className="lg:col-span-5">
          {activeIssue ? (
            <div className="bg-[#121212] border border-white/5 rounded-3xl p-6 shadow-xl space-y-5 sticky top-24 text-neutral-200">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h3 className="font-display font-medium text-white text-base">Citizen Audit Form</h3>
                <button 
                  onClick={() => setSelectedIssueId(null)} 
                  className="text-neutral-400 hover:text-white text-xs font-bold font-mono uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              {successMsg ? (
                <div className="bg-emerald-950/20 border border-emerald-800/30 text-emerald-400 text-xs p-4 rounded-2xl font-medium flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0 bg-emerald-600 text-black rounded-full p-0.5" />
                  {successMsg}
                </div>
              ) : (
                <form onSubmit={handleVerifySubmit} className="space-y-4">
                  <div className="bg-[#181818] border border-white/5 rounded-2xl p-4 space-y-1.5 text-xs text-neutral-300">
                    <div className="font-bold text-white font-display line-clamp-1">{activeIssue.title}</div>
                    <p className="line-clamp-2 leading-relaxed text-[11px] font-light text-neutral-400">{activeIssue.description}</p>
                    <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 pt-1 font-mono">
                      <MapPin className="w-3.5 h-3.5 text-teal-400" />
                      Coords: {activeIssue.latitude.toFixed(4)}, {activeIssue.longitude.toFixed(4)}
                    </div>
                  </div>

                  {/* Verification Status choices */}
                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-2 font-mono">
                      Your Verification Finding
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setVerificationStatus("verified")}
                        className={`py-2 rounded-xl text-[10px] uppercase tracking-wider font-extrabold border transition-all cursor-pointer ${
                          verificationStatus === "verified"
                            ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-400"
                            : "bg-[#181818] border-white/5 text-neutral-500 hover:text-neutral-300"
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 mx-auto mb-1" />
                        Verify OK
                      </button>

                      <button
                        type="button"
                        onClick={() => setVerificationStatus("flagged_duplicate")}
                        className={`py-2 rounded-xl text-[10px] uppercase tracking-wider font-extrabold border transition-all cursor-pointer ${
                          verificationStatus === "flagged_duplicate"
                            ? "bg-indigo-950/30 border-indigo-500/30 text-indigo-400"
                            : "bg-[#181818] border-white/5 text-neutral-500 hover:text-neutral-300"
                        }`}
                      >
                        <Copy className="w-3.5 h-3.5 mx-auto mb-1" />
                        Duplicate
                      </button>

                      <button
                        type="button"
                        onClick={() => setVerificationStatus("flagged_fake")}
                        className={`py-2 rounded-xl text-[10px] uppercase tracking-wider font-extrabold border transition-all cursor-pointer ${
                          verificationStatus === "flagged_fake"
                            ? "bg-rose-950/30 border-rose-500/30 text-rose-400"
                            : "bg-[#181818] border-white/5 text-neutral-500 hover:text-neutral-300"
                        }`}
                      >
                        <AlertOctagon className="w-3.5 h-3.5 mx-auto mb-1" />
                        Flag Fake
                      </button>
                    </div>
                  </div>

                  {/* Remarks input text box */}
                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-1.5 font-mono">
                      Audit Remarks & Evidence
                    </label>
                    <textarea
                      placeholder="Specify what you witnessed. Provide details on size, danger, or surrounding impact..."
                      value={verificationRemarks}
                      onChange={(e) => setVerificationRemarks(e.target.value)}
                      rows={3}
                      className="w-full bg-[#181818] border border-white/5 rounded-xl p-3 text-xs text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-teal-500/30 font-sans"
                      required
                    />
                  </div>

                  {/* Distance Security Warning */}
                  <div className="p-3 bg-indigo-950/10 border border-indigo-900/20 rounded-xl text-[10px] text-indigo-400 leading-normal flex items-start gap-2">
                    <Sparkles className="w-4 h-4 shrink-0 mt-0.5 animate-pulse" />
                    <span>
                      <b>GPS Validation:</b> Our system cross-references your current location. Out-of-bounds audits are flagged for manual secondary review by administrative coordinators.
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-white hover:bg-neutral-100 text-black font-bold py-2.5 rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer"
                  >
                    Commit Verification
                  </button>

                </form>
              )}
            </div>
          ) : (
            <div className="bg-[#121212] border border-white/5 rounded-3xl p-8 text-center shadow-xl space-y-3 sticky top-24">
              <div className="w-12 h-12 bg-[#181818] text-neutral-500 rounded-full flex items-center justify-center mx-auto border border-white/5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-white text-sm font-display">No Issue Selected</h4>
              <p className="text-xs text-neutral-400 leading-relaxed max-w-xs mx-auto font-light">
                Select an reported incident from the active audit queue on the left to review photos, coordinates, and compile your finding.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
