export interface User {
  id: string;
  email: string;
  username: string;
  points: number;
  badges: string[];
  role: "citizen" | "authority" | "volunteer";
  avatar: string;
  trustScore: number; // starts at 1.0, increases with good verifications, decreases with fake reports
  location?: {
    lat: number;
    lng: number;
    ward: string;
  };
}

export interface Verification {
  id: string;
  issueId: string;
  userId: string;
  username: string;
  status: "verified" | "flagged_duplicate" | "flagged_fake";
  remarks: string;
  timestamp: string;
}

export interface TimelineEvent {
  status: "Reported" | "Verified" | "Assigned" | "In Progress" | "Fixed";
  title: string;
  description: string;
  timestamp: string;
  updatedBy: string;
  remarks?: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  issueType: "Pothole" | "Water Leakage" | "Damaged Streetlight" | "Waste Overflow" | "Public Infrastructure Failure";
  imageUrl: string;
  latitude: number;
  longitude: number;
  ward: string;
  reportedBy: string; // userId
  reportedByName: string;
  timestamp: string;
  status: "Reported" | "Verified" | "Assigned" | "In Progress" | "Fixed";
  severity: "Critical" | "Moderate" | "Low";
  urgency: "High" | "Medium" | "Low";
  upvotes: number;
  upvotedBy: string[]; // userIds
  verifications: Verification[];
  isVerified: boolean;
  aiConfidence: number;
  assignedDepartment?: string;
  expectedResolutionDate?: string;
  slaHours?: number;
  riskLevel?: "High" | "Medium" | "Low";
  riskAlertText?: string;
  escalationContact?: string;
  draftedComplaint?: string;
  timeline: TimelineEvent[];
  citizenFeedback?: {
    rating: number; // 1-5
    comment: string;
    timestamp: string;
  };
}

export interface WardStat {
  wardName: string;
  totalIssues: number;
  resolvedIssues: number;
  potholes: number;
  waterLeaks: number;
  streetlights: number;
  wasteOverflow: number;
  publicInfra: number;
  avgResolutionTimeHours: number;
}

export interface PushNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning";
  timestamp: string;
  read: boolean;
  issueId?: string;
}
