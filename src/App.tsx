import React, { useState, useEffect } from "react";
import { User, Issue, PushNotification, WardStat, Verification } from "./types";
import { loadState, saveState, createNotification } from "./data";
import Auth from "./components/Auth";
import Home from "./components/Home";
import ReportIssue from "./components/ReportIssue";
import Map from "./components/Map";
import VerifySupport from "./components/VerifySupport";
import TrackResolution from "./components/TrackResolution";
import ImpactDashboard from "./components/ImpactDashboard";
import Gamification from "./components/Gamification";
import AdminPanel from "./components/AdminPanel";
import { 
  ShieldCheck, 
  Home as HomeIcon, 
  PlusCircle, 
  Map as MapIcon, 
  CheckCircle, 
  TrendingUp, 
  Trophy, 
  Settings, 
  LogOut, 
  Bell,
  Sparkles,
  Users,
  Clock
} from "lucide-react";
import { motion } from "motion/react";

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [wardStats, setWardStats] = useState<WardStat[]>([]);
  const [activeTab, setActiveTab] = useState<string>("home");
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);

  // Load initial state on mount
  useEffect(() => {
    const state = loadState();
    setIssues(state.issues);
    setNotifications(state.notifications);
    setCurrentUser(state.currentUser);
    setWardStats(state.wardStats);
  }, []);

  // Sync state changes back to local storage
  const syncState = (updatedIssues?: Issue[], updatedNotifications?: PushNotification[], updatedUser?: User | null, updatedWardStats?: WardStat[]) => {
    if (updatedIssues) setIssues(updatedIssues);
    if (updatedNotifications) setNotifications(updatedNotifications);
    if (updatedUser !== undefined) setCurrentUser(updatedUser);
    if (updatedWardStats) setWardStats(updatedWardStats);

    saveState({
      issues: updatedIssues || issues,
      notifications: updatedNotifications || notifications,
      currentUser: updatedUser !== undefined ? updatedUser : currentUser,
      wardStats: updatedWardStats || wardStats
    });
  };

  // Handle successful login/signup
  const handleLoginSuccess = (user: User) => {
    syncState(undefined, undefined, user);
    
    // Welcome push alert
    const welcomeAlert = createNotification(
      user.id,
      "Network Authorization Success",
      `Welcome back, ${user.username}! You are connected to NagarNetra's Hyperlocal Node.`,
      "success"
    );
    syncState(undefined, [welcomeAlert, ...notifications], user);
  };

  // Logout session
  const handleLogout = () => {
    syncState(undefined, [], null);
    setActiveTab("home");
  };

  // 1. Report issue submission with auto-SLA dispatch routing via Gemini API
  const handleIssueAdded = async (newIssue: Issue) => {
    const updatedIssues = [newIssue, ...issues];
    
    // Add citizen action points
    let updatedUser = currentUser;
    if (updatedUser) {
      updatedUser = {
        ...updatedUser,
        points: updatedUser.points + 10, // 10 points for submission
      };
    }

    // Push notification alert
    const registerAlert = createNotification(
      newIssue.reportedBy,
      "Complaint Registered",
      `"${newIssue.title}" logged. Dispatching AI routing verification audits...`,
      "info",
      newIssue.id
    );

    syncState(updatedIssues, [registerAlert, ...notifications], updatedUser);

    // Async call: Trigger AI Auto-Assignment, Duplicates check & Predictive Risks on backend
    try {
      const response = await fetch("/api/gemini/auto-assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          issue: newIssue,
          existingIssues: issues.slice(0, 10), // compare with first 10 for duplication analysis
        })
      });

      if (response.ok) {
        const assignmentResult = await response.json();
        
        // Update issue with Gemini assignments
        const finalizedIssues = updatedIssues.map((i) => {
          if (i.id === newIssue.id) {
            return {
              ...i,
              slaHours: assignmentResult.slaHours || 48,
              riskLevel: assignmentResult.riskLevel || "Medium",
              riskAlertText: assignmentResult.riskAlertText || "Cascading road failures forecast due to drainage load.",
              escalationContact: assignmentResult.escalationContact || "Chief Engineering Officer, PWD Road division"
            };
          }
          return i;
        });

        // Push routing dispatch notification
        const dispatchAlert = createNotification(
          newIssue.reportedBy,
          "AI Routing & Dispatch Triggered",
          `Grievance mapped to ${newIssue.assignedDepartment || "Municipal Corp Desk"}. Target resolution SLA: ${assignmentResult.slaHours || 48} Hours.`,
          "success",
          newIssue.id
        );

        syncState(finalizedIssues, [dispatchAlert, ...notifications], updatedUser);
      }
    } catch (e) {
      console.error("AI auto assign failed:", e);
    }
  };

  // 2. Citizen-led Verification audit submission
  const handleVerifyIssue = (issueId: string, verification: Verification) => {
    const targetIssue = issues.find((i) => i.id === issueId);
    if (!targetIssue) return;

    const updatedVerifications = [...targetIssue.verifications, verification];
    const isNowVerified = updatedVerifications.length >= 1; // 1 certified volunteer makes it verified

    const updatedIssues = issues.map((i) => {
      if (i.id === issueId) {
        const nextStatus = isNowVerified && i.status === "Reported" ? "Verified" : i.status;
        
        // Append verification timeline event
        const updatedTimeline = [
          ...i.timeline,
          {
            status: "Verified",
            title: "Audited & Verified",
            description: `Verification completed by ${verification.username}. Consensus outcome: ${verification.status.toUpperCase()}.`,
            timestamp: new Date().toISOString(),
            updatedBy: verification.username,
            remarks: verification.remarks
          }
        ];

        return {
          ...i,
          verifications: updatedVerifications,
          isVerified: isNowVerified,
          status: nextStatus as any,
          timeline: updatedTimeline
        };
      }
      return i;
    });

    // Award XP to current logged in user (organic gamification rule!)
    let updatedUser = currentUser;
    if (updatedUser) {
      // Certified verifications award 50 XP, upvotes award 15 XP
      const xpEarned = verification.status === "verified" ? 50 : 25;
      const originalBadges = [...updatedUser.badges];
      
      // Dynamic badge trigger helper
      if (updatedUser.points + xpEarned >= 50 && !originalBadges.includes("Verifier Badge")) {
        originalBadges.push("Verifier Badge");
      }
      if (updatedUser.points + xpEarned >= 100 && !originalBadges.includes("Community Hero")) {
        originalBadges.push("Community Hero");
      }

      updatedUser = {
        ...updatedUser,
        points: updatedUser.points + xpEarned,
        badges: originalBadges
      };
    }

    const auditAlert = createNotification(
      targetIssue.reportedBy,
      "Citizen Verification Logged",
      `Your reported complaint "${targetIssue.title}" has been successfully verified. Mapped for department dispatch.`,
      "success",
      issueId
    );

    syncState(updatedIssues, [auditAlert, ...notifications], updatedUser);
  };

  // 3. Upvoting Support
  const handleUpvoteIssue = (issueId: string) => {
    if (!currentUser) return;

    const updatedIssues = issues.map((i) => {
      if (i.id === issueId) {
        if (i.upvotedBy.includes(currentUser.id)) return i; // safe gate
        return {
          ...i,
          upvotes: i.upvotes + 1,
          upvotedBy: [...i.upvotedBy, currentUser.id]
        };
      }
      return i;
    });

    let updatedUser = currentUser;
    if (updatedUser) {
      updatedUser = {
        ...updatedUser,
        points: updatedUser.points + 15 // 15 XP for supporting/upvoting
      };
    }

    syncState(updatedIssues, undefined, updatedUser);
  };

  // 4. Municipal Authority work dispatches & transitions
  const handleDispatchIssue = (issueId: string, status: "Assigned" | "In Progress" | "Fixed", remark?: string) => {
    const targetIssue = issues.find((i) => i.id === issueId);
    if (!targetIssue) return;

    const updatedIssues = issues.map((i) => {
      if (i.id === issueId) {
        const updatedTimeline = [
          ...i.timeline,
          {
            status: status as any,
            title: `Ticket Transition: ${status}`,
            description: `Work order status changed to ${status}. Dispatch notes logged in municipal registry.`,
            timestamp: new Date().toISOString(),
            updatedBy: "Central Command Admin",
            remarks: remark
          }
        ];

        return {
          ...i,
          status,
          timeline: updatedTimeline
        };
      }
      return i;
    });

    const dispatchAlert = createNotification(
      targetIssue.reportedBy,
      "Ticket Progress Update",
      `Grievance ticket "${targetIssue.title}" status changed to ${status.toUpperCase()}. Inspector notes: "${remark || 'Dispatch updated'}"`,
      status === "Fixed" ? "success" : "info",
      issueId
    );

    // If marked fixed, add to wardStats resolved count
    let updatedWardStats = [...wardStats];
    if (status === "Fixed") {
      updatedWardStats = wardStats.map((w) => {
        if (w.wardName === targetIssue.ward) {
          return {
            ...w,
            resolvedIssues: w.resolvedIssues + 1
          };
        }
        return w;
      });
    }

    syncState(updatedIssues, [dispatchAlert, ...notifications], undefined, updatedWardStats);
  };

  // 5. Post-Resolution feedback rating survey
  const handleAddFeedback = (issueId: string, rating: number, comment: string) => {
    const updatedIssues = issues.map((i) => {
      if (i.id === issueId) {
        return {
          ...i,
          citizenFeedback: {
            rating,
            comment,
            timestamp: new Date().toISOString()
          }
        };
      }
      return i;
    });

    syncState(updatedIssues);
  };

  const handleSelectAndNavigateToMap = (issue: Issue) => {
    setSelectedIssue(issue);
    setActiveTab("map");
  };

  const clearNotifications = () => {
    syncState(undefined, []);
  };

  // Route/Tab view router
  const renderTabContent = () => {
    switch (activeTab) {
      case "home":
        return <Home issues={issues} onNavigate={setActiveTab} onSelectIssue={handleSelectAndNavigateToMap} />;
      case "report":
        return <ReportIssue currentUser={currentUser} onIssueAdded={handleIssueAdded} onNavigate={setActiveTab} />;
      case "map":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[calc(100vh-210px)] min-h-[500px]">
            <div className="lg:col-span-8 h-full">
              <Map issues={issues} onSelectIssue={setSelectedIssue} selectedIssue={selectedIssue} />
            </div>
            
            {/* Map Sidebar: Quick List Picker & Filters */}
            <div className="lg:col-span-4 bg-[#121212] border border-white/5 rounded-3xl p-5 shadow-xl overflow-y-auto space-y-4 text-neutral-200">
              <div className="border-b border-white/5 pb-3">
                <h3 className="font-display font-medium text-white text-base">Complaint Navigator</h3>
                <p className="text-[10px] text-neutral-400 mt-0.5 font-light">Click any reported coordinates to view descriptions & tracking details.</p>
              </div>

              <div className="space-y-2 max-h-[360px] overflow-y-auto">
                {issues.map((issue) => (
                  <div
                    key={issue.id}
                    onClick={() => setSelectedIssue(issue)}
                    className={`p-3.5 border rounded-xl cursor-pointer transition-colors ${
                      selectedIssue?.id === issue.id 
                        ? "bg-teal-950/20 border-teal-500/50" 
                        : "bg-[#161616] border-white/5 hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[9px] font-mono font-bold text-neutral-400 uppercase tracking-widest">
                      <span>{issue.issueType}</span>
                      <span className={issue.status === "Fixed" ? "text-emerald-400" : "text-amber-400"}>
                        {issue.status}
                      </span>
                    </div>
                    <h4 className="font-bold text-neutral-100 text-xs truncate mt-1 font-sans">{issue.title}</h4>
                    <span className="text-[9px] text-neutral-400 font-mono flex items-center gap-0.5 mt-1.5">
                      <MapIcon className="w-3 h-3 text-teal-400" />
                      {issue.ward}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case "verify":
        return (
          <VerifySupport 
            currentUser={currentUser} 
            issues={issues} 
            onVerifyIssue={handleVerifyIssue} 
            onUpvoteIssue={handleUpvoteIssue} 
          />
        );
      case "track":
        return (
          <TrackResolution 
            currentUser={currentUser} 
            issues={issues} 
            notifications={notifications} 
            onAddFeedback={handleAddFeedback} 
            onClearNotifications={clearNotifications}
          />
        );
      case "impact":
        return <ImpactDashboard issues={issues} wardStats={wardStats} />;
      case "gamification":
        return <Gamification currentUser={currentUser} />;
      case "admin":
        return <AdminPanel issues={issues} wardStats={wardStats} onDispatchIssue={handleDispatchIssue} />;
      default:
        return <Home issues={issues} onNavigate={setActiveTab} onSelectIssue={handleSelectAndNavigateToMap} />;
    }
  };

  // Mandatory: Check if session is logged in, else redirect strictly to Auth
  if (!currentUser) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-neutral-200 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      
      {/* Platform Navigation Bar */}
      <header className="bg-[#0A0A0A] border-b border-white/10 sticky top-0 z-[1100] backdrop-blur-md bg-opacity-90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo Brand layout */}
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-teal-400 text-slate-950 rounded-xl shadow-md">
              <ShieldCheck className="w-5.5 h-5.5" />
            </div>
            <div>
              <span className="font-display font-medium text-white tracking-tight text-sm">NagarNetra</span>
              <span className="text-[8px] block font-mono font-bold text-teal-400 tracking-widest uppercase">Governance</span>
            </div>
          </div>

          {/* Core Desktop Navbar Menu list */}
          <nav className="hidden lg:flex items-center gap-1 font-sans">
            {[
              { id: "home", label: "Home", icon: HomeIcon },
              { id: "report", label: "Report Issue", icon: PlusCircle },
              { id: "map", label: "Community Map", icon: MapIcon },
              { id: "verify", label: "Verify & Support", icon: CheckCircle },
              { id: "track", label: "Track Resolution", icon: Clock },
              { id: "impact", label: "Impact Dashboard", icon: TrendingUp },
              { id: "gamification", label: "Gamification & Rewards", icon: Trophy },
              { id: "admin", label: "Admin Panel", icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setSelectedIssue(null); }}
                  className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                    isActive 
                      ? "bg-white text-black shadow-lg" 
                      : "text-neutral-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* User profile dropdown drawer & notifications */}
          <div className="flex items-center gap-3">
            
            {/* Notification Bell toggle */}
            <div className="relative">
              <button 
                onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
                className="p-2 text-neutral-400 hover:text-white hover:bg-white/5 rounded-xl transition-all relative cursor-pointer"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-black"></span>
                )}
              </button>

              {/* Notification Drawer Popover */}
              {showNotificationsDropdown && (
                <div className="absolute right-0 mt-2.5 w-80 bg-[#121212] border border-white/10 rounded-2xl shadow-2xl p-4 z-[1200] space-y-3">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="font-display font-medium text-white text-xs">Push Notifications</span>
                    <button 
                      onClick={() => { clearNotifications(); setShowNotificationsDropdown(false); }}
                      className="text-[9px] text-teal-400 hover:text-teal-300 uppercase tracking-widest font-mono font-bold cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>

                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 text-[10px] leading-relaxed">
                    {notifications.length === 0 ? (
                      <p className="text-neutral-500 italic text-center py-4 font-light">No active system alerts.</p>
                    ) : (
                      notifications.slice(0, 5).map((n) => (
                        <div key={n.id} className="p-2 bg-[#181818] border border-white/5 rounded-lg text-neutral-300">
                          <span className="font-bold text-neutral-200 block">{n.title}</span>
                          <p className="text-neutral-400 mt-0.5 font-light">{n.message}</p>
                          <span className="text-[8px] font-mono text-neutral-500 block mt-1">
                            {new Date(n.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Mini Profile Badge */}
            <div className="flex items-center gap-2 pl-2 border-l border-white/10">
              <div className="w-9 h-9 rounded-xl overflow-hidden border border-white/10 bg-neutral-900 shrink-0">
                <img 
                  src={currentUser.avatar} 
                  alt="Avatar" 
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-neutral-200 line-clamp-1 leading-tight font-sans">{currentUser.username}</div>
                <div className="text-[9px] font-mono font-bold text-teal-400 uppercase tracking-widest leading-none mt-0.5">{currentUser.points} XP</div>
              </div>

              {/* Logout Button */}
              <button 
                onClick={handleLogout}
                className="p-2 text-neutral-500 hover:text-rose-400 hover:bg-rose-950/20 rounded-xl transition-all cursor-pointer"
                title="End session"
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            </div>

          </div>

        </div>
      </header>

      {/* Dynamic Mobile Tab Ribbon bar */}
      <div className="lg:hidden bg-[#121212] border-b border-white/10 px-4 py-2 flex items-center overflow-x-auto gap-1.5 scrollbar-none z-[1050] sticky top-16">
        {[
          { id: "home", label: "Home", icon: HomeIcon },
          { id: "report", label: "Report", icon: PlusCircle },
          { id: "map", label: "Map", icon: MapIcon },
          { id: "verify", label: "Verify", icon: CheckCircle },
          { id: "track", label: "Track", icon: Clock },
          { id: "impact", label: "Impact", icon: TrendingUp },
          { id: "gamification", label: "Gamify", icon: Trophy },
          { id: "admin", label: "Admin", icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSelectedIssue(null); }}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 shrink-0 cursor-pointer ${
                isActive ? "bg-white text-black" : "text-neutral-400 bg-neutral-900/50"
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Body View Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          {renderTabContent()}
        </motion.div>
      </main>

      {/* Platform Footer */}
      <footer className="bg-[#0A0A0A] border-t border-white/10 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-[9px] font-mono text-neutral-500 flex flex-col sm:flex-row items-center justify-between gap-3 tracking-widest">
          <span>© 2026 NAGARNETRA COOPERATIVE GOVERNANCE INC.</span>
          <span>STRICTLY LIVE HACKATHON EXECUTIVE DEMO</span>
        </div>
      </footer>

    </div>
  );
}
