import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "20mb" }));

// Lazy initializer for Google Gen AI
let aiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === "MY_GEMINI_API_KEY" || key.trim() === "") {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// 1. AI Image/Video Issue Classification
app.post("/api/gemini/analyze-image", async (req: Request, res: Response) => {
  try {
    const { image, mimeType } = req.body;
    if (!image) {
      return res.status(400).json({ error: "Missing image base64 data" });
    }

    const ai = getGemini();
    if (!ai) {
      // Fallback response for hackathon demo if API key is not configured
      console.warn("GEMINI_API_KEY is missing. Using high-quality mock response.");
      return res.json({
        issueType: "Pothole",
        title: "Deep Pothole near Central Crossing",
        description: "A wide, deep pothole is exposing road layers, causing vehicle damage and traffic slowdowns. Water is starting to accumulate in it.",
        severity: "Critical",
        urgency: "High",
        confidence: 0.94,
        suggestedDepartment: "Public Works Department",
        warning: "Running in offline/demo fallback mode because GEMINI_API_KEY is not set."
      });
    }

    // Clean base64 data (remove headers if client sends them)
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const actualMimeType = mimeType || "image/jpeg";

    const prompt = `Analyze this civic issue report. Identify what type of hyperlocal civic issue is depicted. 
Classify into one of: Pothole, Water Leakage, Damaged Streetlight, Waste Overflow, or Public Infrastructure Failure.
Provide a clear title, a detailed description, severity (Critical, Moderate, Low), urgency (High, Medium, Low),
a confidence score between 0.0 and 1.0, and suggest the responsible municipal department.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        {
          inlineData: {
            mimeType: actualMimeType,
            data: base64Data,
          },
        },
        { text: prompt },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            issueType: { type: Type.STRING, description: "Pothole, Water Leakage, Damaged Streetlight, Waste Overflow, or Public Infrastructure Failure" },
            title: { type: Type.STRING, description: "Concise description title of the issue" },
            description: { type: Type.STRING, description: "Detailed summary of observations in the image" },
            severity: { type: Type.STRING, description: "Critical, Moderate, or Low" },
            urgency: { type: Type.STRING, description: "High, Medium, or Low" },
            confidence: { type: Type.NUMBER, description: "Confidence score between 0.0 and 1.0" },
            suggestedDepartment: { type: Type.STRING, description: "Suggested municipal department" },
          },
          required: ["issueType", "title", "description", "severity", "urgency", "confidence", "suggestedDepartment"],
        },
      },
    });

    const parsedData = JSON.parse(response.text || "{}");
    return res.json(parsedData);
  } catch (error: any) {
    console.error("Error analyzing image with Gemini API:", error);
    return res.status(500).json({
      error: "Failed to analyze image using Gemini.",
      details: error.message || String(error),
    });
  }
});

// 2. Voice/Text NLP Understanding
app.post("/api/gemini/nlp-text", async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Missing text input" });
    }

    const ai = getGemini();
    if (!ai) {
      // Mock Fallback
      return res.json({
        issueType: "Waste Overflow",
        title: "Garbage Overflow on Market Road",
        description: text,
        severity: "Moderate",
        urgency: "Medium",
        suggestedDepartment: "Waste & Sanitation Department",
        tags: ["Waste", "Sanitation", "Hygiene-Hazard"],
        warning: "Offline fallback mode: GEMINI_API_KEY is not set."
      });
    }

    const prompt = `You are NagarNetra's AI Governance Core. Understand this raw text or voice-to-text input describing a civic complaint.
Structure it into details. Input text: "${text}"`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            issueType: { type: Type.STRING, description: "Pothole, Water Leakage, Damaged Streetlight, Waste Overflow, or Public Infrastructure Failure" },
            title: { type: Type.STRING, description: "A concise 4-8 word title for the complaint" },
            description: { type: Type.STRING, description: "Polished and corrected version of the user complaint" },
            severity: { type: Type.STRING, description: "Critical, Moderate, or Low" },
            urgency: { type: Type.STRING, description: "High, Medium, or Low" },
            suggestedDepartment: { type: Type.STRING, description: "Public Works, Water Supply, Electrical Maintenance, Waste & Sanitation, or Urban Infrastructure" },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3-4 relevant tags/keywords for this issue"
            }
          },
          required: ["issueType", "title", "description", "severity", "urgency", "suggestedDepartment", "tags"],
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    return res.json(parsedData);
  } catch (error: any) {
    console.error("NLP extraction error:", error);
    return res.status(500).json({ error: "Failed to extract text data", details: error.message });
  }
});

// 3. AI Auto-Draft Complaint Generator
app.post("/api/gemini/draft-complaint", async (req: Request, res: Response) => {
  try {
    const { issue } = req.body;
    if (!issue) {
      return res.status(400).json({ error: "Missing issue details for complaint drafting" });
    }

    const ai = getGemini();
    if (!ai) {
      // Mock Fallback
      return res.json({
        letter: `To,
The Chief Executive Engineer,
${issue.suggestedDepartment || "Municipal Authority"},
NagarNetra Civic Corporation, India.

Subject: Urgent Redressal Request for Reported ${issue.issueType || "Civic Issue"}: "${issue.title}"

Respected Sir/Madam,

We are writing to draw your attention to a pressing civic issue reported via the NagarNetra Governance Network: "${issue.title}".
Type: ${issue.issueType}
Urgency Level: ${issue.urgency || "High"}
Details: ${issue.description}

This issue represents an active risk to public safety and infrastructure in the locality. The NagarNetra verification system has verified this incident. We kindly request immediate dispatch of local maintenance teams to inspect and resolve this problem.

Thank you in advance for your swift and cooperative action.

Yours faithfully,
The Citizenry & Volunteers of NagarNetra Council
[NagarNetra Verified Digital Copy - ID: NN-REF-${Math.floor(Math.random() * 90000) + 10000}]`
      });
    }

    const prompt = `Write an official, highly professional, formal municipal complaint letter to the head of "${issue.suggestedDepartment || "Municipal Authority"}" for the following reported issue.
Issue Type: ${issue.issueType}
Title: ${issue.title}
Severity: ${issue.severity}
Description: ${issue.description}
Provide a complete, printable document with date, formal subject line, structured arguments, legal/civic codes, and a reference to active community interest.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    return res.json({ letter: response.text });
  } catch (error: any) {
    console.error("Complaint drafting error:", error);
    return res.status(500).json({ error: "Failed to draft complaint letter", details: error.message });
  }
});

// 4. Duplicate Check, SLA Timeline & Infrastructure Risk alerts
app.post("/api/gemini/auto-assign", async (req: Request, res: Response) => {
  try {
    const { issue, existingIssues } = req.body;
    if (!issue) {
      return res.status(400).json({ error: "Missing issue details" });
    }

    const ai = getGemini();
    if (!ai) {
      // Mock Fallback
      const expectedDays = issue.severity === "Critical" ? 1 : issue.severity === "Moderate" ? 3 : 5;
      return res.json({
        isDuplicate: false,
        similarityScore: 0.05,
        duplicateOfId: null,
        riskLevel: "Medium",
        riskAlertText: "Pothole expansion due to forecasted rains. Secondary hazard of stagnant water breeding vectors is likely.",
        slaHours: expectedDays * 24,
        escalationContact: "Chief Officer - PWD Desk (Grievance Wing)",
        warning: "Offline fallback: GEMINI_API_KEY is not configured."
      });
    }

    const prompt = `You are NagarNetra's Municipal Assignment Engine. Evaluate this reported issue and compare against the provided existing issues list (if any) to see if it is a potential duplicate.
Also predict SLA (Service Level Agreement) resolve time in hours, find the escalation contact desk, and give a predictive risk alert about how leaving this issue unresolved might impact surrounding municipal infrastructure.

Current reported issue:
- Title: ${issue.title}
- Type: ${issue.issueType}
- Severity: ${issue.severity}
- Description: ${issue.description}

Existing issues in the database:
${JSON.stringify(existingIssues || [])}

Calculate similarity score (0.0 to 1.0) and detect if duplicate. Provide the SLA hours (Critical should be 24h, Moderate 72h, Low 120h), and risk alerts.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isDuplicate: { type: Type.BOOLEAN },
            similarityScore: { type: Type.NUMBER, description: "Similarity score with the closest existing issue" },
            duplicateOfId: { type: Type.STRING, description: "The ID of the existing duplicate issue, or null if unique" },
            riskLevel: { type: Type.STRING, description: "High, Medium, or Low risk of cascading damage" },
            riskAlertText: { type: Type.STRING, description: "Predictive warning about cascading failures or secondary safety issues, e.g., 'May cause water-logging leading to road core erosion'" },
            slaHours: { type: Type.INTEGER, description: "Target resolution SLA in hours" },
            escalationContact: { type: Type.STRING, description: "Specific designation or municipal division desk to escalate to if SLA breached" }
          },
          required: ["isDuplicate", "similarityScore", "riskLevel", "riskAlertText", "slaHours", "escalationContact"]
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    return res.json(parsedData);
  } catch (error: any) {
    console.error("Auto assignment error:", error);
    return res.status(500).json({ error: "Failed to assign and check duplicates", details: error.message });
  }
});


// ----------------------------------------------------
// VITE DEV MIDDLEWARE / STATIC FILE SERVING
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Support single page application routing
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
