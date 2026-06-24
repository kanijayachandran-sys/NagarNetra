import { Issue, User, PushNotification, WardStat } from "./types";

// Seed real-world issues located around Bangalore, India
export const INITIAL_ISSUES: Issue[] = [
  {
    id: "issue-1",
    title: "Deep Pothole at 80 Feet Road Junction",
    description: "A hazardous 1.5-meter-wide pothole has developed right after the traffic light. Vehicles have to veer sharply to avoid it, which is causing minor collisions and major gridlock during peak commute hours.",
    issueType: "Pothole",
    imageUrl: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=600",
    latitude: 12.9716,
    longitude: 77.5946,
    ward: "Ward 45 - Central",
    reportedBy: "citizen-1",
    reportedByName: "Ananth Rao",
    timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString(), // 2 days ago
    status: "Verified",
    severity: "Critical",
    urgency: "High",
    upvotes: 14,
    upvotedBy: ["citizen-2", "citizen-3"],
    verifications: [
      {
        id: "v-1",
        issueId: "issue-1",
        userId: "volunteer-1",
        username: "Meera Nair (Volunteer)",
        status: "verified",
        remarks: "Physically verified on site. Pothole is over 4 inches deep. Heavy risk to motorcyclists, especially after evening showers.",
        timestamp: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
      }
    ],
    isVerified: true,
    aiConfidence: 0.95,
    assignedDepartment: "Public Works Department",
    expectedResolutionDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString(), // Tomorrow
    slaHours: 24,
    riskLevel: "High",
    riskAlertText: "Risk of vehicle structural damage and high probability of two-wheeler skid incidents during evening rains.",
    escalationContact: "Chief Engineer (Roads Division), Central Zone",
    draftedComplaint: `To,\nThe Assistant Commissioner (Roads),\nPublic Works Division,\nCentral Zone Municipal Office.\n\nSubject: Critical Road Pavement Failure - 80 Feet Road Junction\n\nRespected Officer,\n\nWe hereby bring to your urgent attention a major structural defect on the 80 Feet Road main carriageway. A deep pothole measuring roughly 1.5 meters across is actively disrupting traffic flow and causing severe safety concerns.\n\nThis complaint is formally compiled and registered under NagarNetra's Digital Governance Protocol with 14 community verifications and a verified safety rating. We request immediate hot-mix pavement repair within the next 24-hour SLA.\n\nSincerely,\nLocal Citizen Council & NagarNetra Volunteers.`,
    timeline: [
      {
        status: "Reported",
        title: "Issue Reported",
        description: "Citizen report submitted with geo-coordinates and mobile image validation.",
        timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
        updatedBy: "Ananth Rao"
      },
      {
        status: "Verified",
        title: "Community Verified",
        description: "Verified on-site by Senior Volunteer Meera Nair. Urgency upgraded based on structural risk.",
        timestamp: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
        updatedBy: "Meera Nair",
        remarks: "Severe pavement distress noted."
      }
    ]
  },
  {
    id: "issue-2",
    title: "Major Drinking Water Main Pipe Burst",
    description: "High-pressure clean water is gushing out of the underground connection, flooding the surrounding pedestrian pavement and rendering the service lane unusable. Thousands of gallons are being wasted every hour.",
    issueType: "Water Leakage",
    imageUrl: "https://images.unsplash.com/photo-1542013936693-8848e5744431?auto=format&fit=crop&q=80&w=600",
    latitude: 12.9785,
    longitude: 77.6408,
    ward: "Ward 82 - Indiranagar",
    reportedBy: "citizen-2",
    reportedByName: "Rajesh Kumar",
    timestamp: new Date(Date.now() - 12 * 3600 * 1000).toISOString(), // 12 hours ago
    status: "Assigned",
    severity: "Critical",
    urgency: "High",
    upvotes: 28,
    upvotedBy: ["citizen-1", "citizen-3", "citizen-4"],
    verifications: [
      {
        id: "v-2",
        issueId: "issue-2",
        userId: "volunteer-2",
        username: "Karan Johar",
        status: "verified",
        remarks: "Water logging extends 200m down the street. Local cellars starting to flood. Needs immediate gate-valve closure.",
        timestamp: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
      }
    ],
    isVerified: true,
    aiConfidence: 0.98,
    assignedDepartment: "Water Supply & Sewerage Board",
    expectedResolutionDate: new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
    slaHours: 12,
    riskLevel: "High",
    riskAlertText: "Severe local soil erosion under the adjacent asphalt road; potential sub-base hollow creation.",
    escalationContact: "Sub-divisional Board Engineer (Water Mains Unit)",
    timeline: [
      {
        status: "Reported",
        title: "Report Registered",
        description: "High volume leak alert registered. Voice command processing completed.",
        timestamp: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
        updatedBy: "Rajesh Kumar"
      },
      {
        status: "Verified",
        title: "Water Loss Verified",
        description: "Verified by 3 independent nearby users via geo-fenced upvotes. Authority alerted.",
        timestamp: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
        updatedBy: "Governance Router"
      },
      {
        status: "Assigned",
        title: "Department Dispatched",
        description: "Assigned to the Water Supply Board - Emergency Maintenance Wing. Dispatch team on route.",
        timestamp: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
        updatedBy: "Assigned Router",
        remarks: "Work Ticket #WS-9844 Issued."
      }
    ]
  },
  {
    id: "issue-3",
    title: "Commercial Waste Dumping on Footpath",
    description: "An illegal commercial waste dump has been piled up on the footpath. It is spilling over into the storm drain, blocking water flow. It contains sharp construction debris, plastics, and decomposing organic waste, attracting stray animals.",
    issueType: "Waste Overflow",
    imageUrl: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=80&w=600",
    latitude: 12.9352,
    longitude: 77.6244,
    ward: "Ward 60 - Koramangala",
    reportedBy: "citizen-4",
    reportedByName: "Shalini Sen",
    timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    status: "Reported",
    severity: "Moderate",
    urgency: "Medium",
    upvotes: 6,
    upvotedBy: [],
    verifications: [],
    isVerified: false,
    aiConfidence: 0.89,
    assignedDepartment: "Waste & Sanitation Department",
    slaHours: 48,
    riskLevel: "Medium",
    riskAlertText: "Stagnation of drain water due to spill blockage can trigger dengue larval vector breeding zones.",
    escalationContact: "Solid Waste Management Division Ward Inspector",
    timeline: [
      {
        status: "Reported",
        title: "Dump Reported",
        description: "AI image model detected Waste Pile with 89% confidence. Geolocation verified.",
        timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        updatedBy: "Shalini Sen"
      }
    ]
  },
  {
    id: "issue-4",
    title: "Flickering and Damaged Streetlights on Main Lane",
    description: "Entire strip of 4 streetlights is completely dead or heavily flickering. The street turns pitch dark after 6:30 PM, creating a significant security hazard for children and elderly residents.",
    issueType: "Damaged Streetlight",
    imageUrl: "https://images.unsplash.com/photo-1509024644558-2f56ce76c490?auto=format&fit=crop&q=80&w=600",
    latitude: 12.9592,
    longitude: 77.5734,
    ward: "Ward 31 - Malleshwaram",
    reportedBy: "citizen-3",
    reportedByName: "Pranav Shah",
    timestamp: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    status: "Fixed",
    severity: "Low",
    urgency: "Medium",
    upvotes: 9,
    upvotedBy: ["citizen-1", "citizen-2"],
    verifications: [
      {
        id: "v-4",
        issueId: "issue-4",
        userId: "volunteer-1",
        username: "Meera Nair (Volunteer)",
        status: "verified",
        remarks: "Streetlight wires are dangling below the pole. Safety threat identified.",
        timestamp: new Date(Date.now() - 60 * 3600 * 1000).toISOString(),
      }
    ],
    isVerified: true,
    aiConfidence: 0.92,
    assignedDepartment: "Electrical Maintenance Department",
    citizenFeedback: {
      rating: 5,
      comment: "Incredibly fast! The electrical team came yesterday morning and replaced the faulty ballast and LED panels. The entire lane is now beautifully lit and safe. Thank you NagarNetra!",
      timestamp: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
    },
    timeline: [
      {
        status: "Reported",
        title: "Reported",
        description: "Streetlight fault registered in system.",
        timestamp: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
        updatedBy: "Pranav Shah"
      },
      {
        status: "Verified",
        title: "Verified",
        description: "Community verification complete. Wire safety alert forwarded.",
        timestamp: new Date(Date.now() - 60 * 3600 * 1000).toISOString(),
        updatedBy: "Meera Nair"
      },
      {
        status: "Assigned",
        title: "Assigned",
        description: "Ticket dispatched to ESCOM streetlighting unit.",
        timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
        updatedBy: "Central Control"
      },
      {
        status: "In Progress",
        title: "Work In Progress",
        description: "Technicians present on site. Installing spare components.",
        timestamp: new Date(Date.now() - 30 * 3600 * 1000).toISOString(),
        updatedBy: "Technical Desk"
      },
      {
        status: "Fixed",
        title: "Resolved & Closed",
        description: "Bulb replacements and wiring re-anchoring successfully completed. Tested working.",
        timestamp: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
        updatedBy: "ESCOM Supervisor"
      }
    ]
  }
];

export const INITIAL_WARD_STATS: WardStat[] = [
  {
    wardName: "Ward 45 - Central",
    totalIssues: 42,
    resolvedIssues: 38,
    potholes: 20,
    waterLeaks: 8,
    streetlights: 6,
    wasteOverflow: 4,
    publicInfra: 4,
    avgResolutionTimeHours: 18.5,
  },
  {
    wardName: "Ward 82 - Indiranagar",
    totalIssues: 29,
    resolvedIssues: 23,
    potholes: 10,
    waterLeaks: 12,
    streetlights: 3,
    wasteOverflow: 2,
    publicInfra: 2,
    avgResolutionTimeHours: 14.2,
  },
  {
    wardName: "Ward 60 - Koramangala",
    totalIssues: 35,
    resolvedIssues: 28,
    potholes: 12,
    waterLeaks: 6,
    streetlights: 5,
    wasteOverflow: 10,
    publicInfra: 2,
    avgResolutionTimeHours: 24.8,
  },
  {
    wardName: "Ward 31 - Malleshwaram",
    totalIssues: 18,
    resolvedIssues: 17,
    potholes: 5,
    waterLeaks: 2,
    streetlights: 8,
    wasteOverflow: 1,
    publicInfra: 2,
    avgResolutionTimeHours: 9.6,
  }
];

// Helper to interact with Local Storage
export const loadState = () => {
  try {
    const issues = localStorage.getItem("nagarnetra_issues");
    const notifications = localStorage.getItem("nagarnetra_notifications");
    const currentUser = localStorage.getItem("nagarnetra_user");
    const wardStats = localStorage.getItem("nagarnetra_ward_stats");

    return {
      issues: issues ? JSON.parse(issues) : INITIAL_ISSUES,
      notifications: notifications ? JSON.parse(notifications) : [],
      currentUser: currentUser ? JSON.parse(currentUser) : null,
      wardStats: wardStats ? JSON.parse(wardStats) : INITIAL_WARD_STATS,
    };
  } catch (e) {
    console.error("Failed to load state from localStorage:", e);
    return {
      issues: INITIAL_ISSUES,
      notifications: [],
      currentUser: null,
      wardStats: INITIAL_WARD_STATS,
    };
  }
};

export const saveState = (state: {
  issues?: Issue[];
  notifications?: PushNotification[];
  currentUser?: User | null;
  wardStats?: WardStat[];
}) => {
  try {
    if (state.issues) localStorage.setItem("nagarnetra_issues", JSON.stringify(state.issues));
    if (state.notifications) localStorage.setItem("nagarnetra_notifications", JSON.stringify(state.notifications));
    if (state.currentUser !== undefined) {
      if (state.currentUser === null) {
        localStorage.removeItem("nagarnetra_user");
      } else {
        localStorage.setItem("nagarnetra_user", JSON.stringify(state.currentUser));
      }
    }
    if (state.wardStats) localStorage.setItem("nagarnetra_ward_stats", JSON.stringify(state.wardStats));
  } catch (e) {
    console.error("Failed to save state to localStorage:", e);
  }
};

// Add helper to inject mock notification
export const createNotification = (
  userId: string,
  title: string,
  message: string,
  type: "info" | "success" | "warning",
  issueId?: string
): PushNotification => {
  return {
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId,
    title,
    message,
    type,
    timestamp: new Date().toISOString(),
    read: false,
    issueId,
  };
};
