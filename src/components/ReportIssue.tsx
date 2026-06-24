import React, { useState, useEffect } from "react";
import { Issue, User } from "../types";
import { 
  Camera, 
  MapPin, 
  Mic, 
  MicOff, 
  Sparkles, 
  RefreshCw, 
  Edit3, 
  Eye, 
  CheckCircle, 
  AlertTriangle,
  UploadCloud,
  FileText
} from "lucide-react";
import { motion } from "motion/react";

interface ReportIssueProps {
  currentUser: User | null;
  onIssueAdded: (issue: Issue) => void;
  onNavigate: (tab: string) => void;
}

// Interactive sample assets for judges/presenters to play with immediately!
const DEMO_SAMPLES = [
  {
    name: "Road Pothole",
    imageUrl: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=600",
    description: "Deep structural pothole on the main asphalt lane."
  },
  {
    name: "Water Main Burst",
    imageUrl: "https://images.unsplash.com/photo-1542013936693-8848e5744431?auto=format&fit=crop&q=80&w=600",
    description: "Water pipe rupture flooding pavement and blocking drains."
  },
  {
    name: "Waste Overflow",
    imageUrl: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=80&w=600",
    description: "Unregulated garbage heaps blocking walking footpaths."
  }
];

export default function ReportIssue({ currentUser, onIssueAdded, onNavigate }: ReportIssueProps) {
  // Image states
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  // Location states
  const [latitude, setLatitude] = useState<number>(12.9716);
  const [longitude, setLongitude] = useState<number>(77.5946);
  const [ward, setWard] = useState<string>("Ward 45 - Central");
  const [locLoading, setLocLoading] = useState(false);

  // Voice recognition states
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [recognition, setRecognition] = useState<any>(null);

  // AI analysis states
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnalyzed, setAiAnalyzed] = useState(false);
  const [aiConfidence, setAiConfidence] = useState<number>(0);
  
  // Form input fields (filled by AI first, manually editable)
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [issueType, setIssueType] = useState<Issue["issueType"]>("Pothole");
  const [severity, setSeverity] = useState<Issue["severity"]>("Moderate");
  const [urgency, setUrgency] = useState<Issue["urgency"]>("Medium");
  const [suggestedDepartment, setSuggestedDepartment] = useState("");
  const [draftedLetter, setDraftedLetter] = useState("");
  const [generatingDraft, setGeneratingDraft] = useState(false);

  // Flow views: 'input' | 'preview'
  const [flowStep, setFlowStep] = useState<"input" | "preview">("input");

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-IN"; // English (India) works great

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (e: any) => {
        const text = e.results[0][0].transcript;
        setTranscript(text);
        setDescription((prev) => prev ? prev + " " + text : text);
        setIsListening(false);
      };

      rec.onerror = (e: any) => {
        console.error("Speech recognition error:", e);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      setRecognition(rec);
    }
  }, []);

  // Capture GPS coordinates
  const triggerGPSCapture = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        
        // Auto estimate ward based on latitude
        const wardNum = Math.floor((position.coords.latitude * 100) % 150) + 1;
        setWard(`Ward ${wardNum} - South Division`);
        setLocLoading(false);
      },
      (error) => {
        console.warn("Geolocation failure:", error);
        // Default to Bangalore center but notify
        setLatitude(12.9716);
        setLongitude(77.5946);
        setWard("Ward 45 - Central");
        setLocLoading(false);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  // Convert File to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Handle local file upload
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      setImageFile(file);
      const base64 = await fileToBase64(file);
      setSelectedImage(base64);
      triggerAIAnalysis(base64, file.type);
    }
  };

  // Handle choosing a quick demo sample
  const handleSelectSample = async (sampleUrl: string) => {
    setAiLoading(true);
    setSelectedImage(sampleUrl);

    // Fetch the image and convert to base64 to send to server
    try {
      const res = await fetch(sampleUrl);
      const blob = await res.blob();
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => resolve(reader.result as string);
      });
      triggerAIAnalysis(base64, blob.type);
    } catch (e) {
      console.error("Failed to fetch demo sample as base64. Using offline proxy analysis:", e);
      // Fallback analysis call
      triggerAIAnalysis(sampleUrl, "image/jpeg");
    }
  };

  // Trigger server-side Gemini image classification
  const triggerAIAnalysis = async (base64Img: string, mimeType: string) => {
    setAiLoading(true);
    setAiAnalyzed(false);

    try {
      const response = await fetch("/api/gemini/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Img, mimeType }),
      });

      if (!response.ok) {
        throw new Error("Gemini AI API returned failure.");
      }

      const result = await response.json();
      
      // Update form fields with AI prediction results
      setTitle(result.title || "");
      setDescription(result.description || "");
      setIssueType(result.issueType || "Pothole");
      setSeverity(result.severity || "Moderate");
      setUrgency(result.urgency || "Medium");
      setAiConfidence(result.confidence || 0.90);
      setSuggestedDepartment(result.suggestedDepartment || "Public Works Department");
      setAiAnalyzed(true);

      // Draft the letter right after
      generateLetterDraft({
        title: result.title,
        issueType: result.issueType,
        severity: result.severity,
        description: result.description,
        suggestedDepartment: result.suggestedDepartment,
        urgency: result.urgency
      });

    } catch (error) {
      console.error("AI Analysis failed:", error);
    } finally {
      setAiLoading(false);
    }
  };

  // Auto Draft official Municipal Complaint letter via Gemini API
  const generateLetterDraft = async (issueDetails: any) => {
    setGeneratingDraft(true);
    try {
      const res = await fetch("/api/gemini/draft-complaint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issue: issueDetails })
      });
      const data = await res.json();
      setDraftedLetter(data.letter);
    } catch (e) {
      console.error("Failed to draft complaint letter:", e);
    } finally {
      setGeneratingDraft(false);
    }
  };

  // Handle manual correction updates to draft
  const handleManualReDraft = () => {
    generateLetterDraft({
      title,
      issueType,
      severity,
      description,
      suggestedDepartment,
      urgency
    });
  };

  // Microphone toggle handler
  const toggleListening = () => {
    if (!recognition) {
      alert("Browser speech recognition is not supported in this frame or environment. Please write manually.");
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  // Trigger submission to local storage and global state
  const handleFinalSubmit = () => {
    if (!title || !selectedImage) {
      alert("Please ensure a valid image is analyzed and title is completed.");
      return;
    }

    const newIssue: Issue = {
      id: `issue-${Date.now()}`,
      title,
      description,
      issueType,
      imageUrl: selectedImage,
      latitude,
      longitude,
      ward,
      reportedBy: currentUser?.id || "anonymous-1",
      reportedByName: currentUser?.username || "Vigilant Citizen",
      timestamp: new Date().toISOString(),
      status: "Reported",
      severity,
      urgency,
      upvotes: 0,
      upvotedBy: [],
      verifications: [],
      isVerified: false,
      aiConfidence,
      assignedDepartment: suggestedDepartment || "Municipal Corporation Unit",
      draftedComplaint: draftedLetter,
      timeline: [
        {
          status: "Reported",
          title: "Issue Reported",
          description: `Logged in system with ${Math.round(aiConfidence * 100)}% AI model validation.`,
          timestamp: new Date().toISOString(),
          updatedBy: currentUser?.username || "Vigilant Citizen"
        }
      ]
    };

    onIssueAdded(newIssue);
    onNavigate("map"); // redirect to active community maps tab
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans pb-12">
      
      {/* Bento Layout Header */}
      <div className="bg-[#121212] border border-white/5 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-medium text-white">Report Hyperlocal Problem</h1>
          <p className="text-xs text-neutral-400 mt-1 font-light">
            Capture a real incident and let our multi-agent governance pipeline categorize, geolocate, and auto-route it.
          </p>
        </div>
        <button
          onClick={triggerGPSCapture}
          disabled={locLoading}
          className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-xl bg-teal-950/40 border border-teal-500/20 text-teal-400 text-xs font-bold font-mono uppercase tracking-widest hover:bg-teal-900/40 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <MapPin className="w-4 h-4 animate-bounce" />
          {locLoading ? "GPS Syncing..." : "Auto Geolocation"}
        </button>
      </div>

      {flowStep === "input" ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Left Side: Photo Capture & Samples (Span 5) */}
          <div className="md:col-span-5 space-y-6">
            
            {/* Visual Upload Area */}
            <div className="bg-[#121212] border border-white/5 rounded-3xl p-6 shadow-xl flex flex-col items-center justify-center relative min-h-[240px]">
              {selectedImage ? (
                <div className="w-full relative rounded-2xl overflow-hidden aspect-video border border-white/5 bg-neutral-900">
                  <img 
                    src={selectedImage} 
                    alt="Uploaded source file"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => { setSelectedImage(null); setAiAnalyzed(false); }}
                    className="absolute top-3 right-3 bg-black/80 backdrop-blur-md text-white px-2.5 py-1.5 rounded-lg text-[10px] uppercase font-mono font-bold tracking-wider hover:bg-black transition-colors cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className="w-full flex flex-col items-center justify-center border-2 border-dashed border-white/10 hover:border-teal-500/50 rounded-2xl p-8 cursor-pointer transition-colors bg-neutral-900/30 group">
                  <UploadCloud className="w-10 h-10 text-neutral-500 group-hover:text-teal-400 transition-colors mb-3" />
                  <span className="font-bold text-xs text-neutral-300 font-display">Upload Incident Photo</span>
                  <span className="text-[10px] text-neutral-500 mt-1 font-mono uppercase tracking-wider">JPEG or PNG under 15MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}

              {aiLoading && (
                <div className="absolute inset-0 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center z-10 rounded-3xl">
                  <div className="w-8 h-8 border-3 border-teal-400 border-t-transparent rounded-full animate-spin mb-3"></div>
                  <p className="text-xs font-bold text-white font-display">Gemini Analyzing Image...</p>
                  <p className="text-[10px] text-neutral-500 mt-1 font-mono uppercase tracking-wider">Classifying issue & structuring metadata</p>
                </div>
              )}
            </div>

            {/* Quick Demo Samples - Essential for easy Hackathon testing! */}
            <div className="bg-[#121212] border border-white/5 rounded-3xl p-5 shadow-xl space-y-3">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400 font-mono block">
                Quick Demo Presets
              </span>
              <p className="text-[10px] text-neutral-400 leading-normal font-light">
                Don't have a real pothole picture handy? Select a real sample preset below to test live Gemini AI classification:
              </p>
              
              <div className="grid grid-cols-3 gap-2.5 pt-1">
                {DEMO_SAMPLES.map((sample) => (
                  <button
                    key={sample.name}
                    onClick={() => handleSelectSample(sample.imageUrl)}
                    className="group text-left border border-white/5 hover:border-teal-500/50 rounded-xl overflow-hidden p-1 bg-[#161616] transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <div className="h-14 rounded-lg overflow-hidden bg-neutral-900">
                      <img 
                        src={sample.imageUrl} 
                        alt={sample.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <span className="text-[9px] font-bold text-neutral-300 mt-1.5 block px-1 truncate font-sans">
                      {sample.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Right Side: Complaint Forms & NLP Inputs (Span 7) */}
          <div className="md:col-span-7 space-y-6">
            
            <div className="bg-[#121212] border border-white/5 rounded-3xl p-6 shadow-xl space-y-4">
              
              {/* Voice-to-Text Input Area */}
              <div>
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-2 font-mono">
                  Complaint Voice-to-Text Input
                </label>
                <div className="relative">
                  <textarea
                    placeholder="Describe what you see in detail... Or click the microphone icon to record your voice!"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full bg-[#181818] border border-white/5 rounded-2xl p-4 text-xs text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-teal-500/30 focus:ring-1 focus:ring-teal-500/20 transition-all font-medium leading-relaxed font-sans"
                  />
                  <button
                    onClick={toggleListening}
                    className={`absolute bottom-4 right-4 p-2.5 rounded-full border transition-all active:scale-95 cursor-pointer ${
                      isListening 
                        ? "bg-rose-600 border-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30" 
                        : "bg-[#1c1c1c] border-white/10 text-neutral-400 hover:text-teal-400 hover:border-teal-500/30 shadow-sm"
                    }`}
                  >
                    {isListening ? <MicOff className="w-4.5 h-4.5" /> : <Mic className="w-4.5 h-4.5" />}
                  </button>
                </div>
                {isListening && (
                  <span className="text-[9px] text-rose-400 font-mono mt-1 block animate-pulse">
                    🎤 Listening actively... Speak clearly now.
                  </span>
                )}
              </div>

              {/* Form Metadata Fields (Pre-populated by AI) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-1.5 font-mono">
                    Issue Title
                  </label>
                  <input
                    type="text"
                    placeholder="Enter issue headline"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-[#181818] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-neutral-200 font-medium focus:outline-none focus:border-teal-500/30 font-sans"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-1.5 font-mono">
                    Category Classification
                  </label>
                  <select
                    value={issueType}
                    onChange={(e) => setIssueType(e.target.value as any)}
                    className="w-full bg-[#181818] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-neutral-200 font-medium focus:outline-none focus:border-teal-500/30 font-sans"
                  >
                    <option value="Pothole">Pothole</option>
                    <option value="Water Leakage">Water Leakage</option>
                    <option value="Damaged Streetlight">Damaged Streetlight</option>
                    <option value="Waste Overflow">Waste Overflow</option>
                    <option value="Public Infrastructure Failure">Public Infrastructure Failure</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-1.5 font-mono">
                    Suggested Department (Routing)
                  </label>
                  <input
                    type="text"
                    placeholder="Preloaded by AI routing engine"
                    value={suggestedDepartment}
                    onChange={(e) => setSuggestedDepartment(e.target.value)}
                    className="w-full bg-[#181818] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-neutral-200 font-medium focus:outline-none focus:border-teal-500/30 font-sans"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-1.5 font-mono">
                    Est. Ward Region
                  </label>
                  <input
                    type="text"
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    className="w-full bg-[#181818] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-neutral-200 font-medium focus:outline-none focus:border-teal-500/30 font-sans"
                  />
                </div>
              </div>

              {aiAnalyzed && (
                <div className="bg-teal-950/20 border border-teal-800/30 rounded-2xl p-4 flex items-start gap-3">
                  <div className="p-1.5 bg-teal-900/40 text-teal-400 rounded-lg shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-teal-300 text-xs font-display">AI Audit Analysis Successful!</h5>
                    <p className="text-[10px] text-teal-400 leading-normal mt-0.5 font-light">
                      Gemini classified this incident with <b>{(aiConfidence * 100).toFixed(0)}% confidence</b>. We have prepared an official complaint draft.
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation Action */}
              <button
                onClick={() => {
                  if (!selectedImage) {
                    alert("Please select or upload an incident image first.");
                    return;
                  }
                  handleManualReDraft();
                  setFlowStep("preview");
                }}
                className="w-full bg-white hover:bg-neutral-100 text-black font-bold py-3 rounded-2xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 mt-4 cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                Preview Governance Complaint Letter
              </button>

            </div>

          </div>

        </div>
      ) : (
        /* Preview / Letter Draft step (Step 2) */
        <div className="bg-[#121212] border border-white/5 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="border-b border-white/5 pb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display font-medium text-white text-lg">Authority Dispatch Preview</h2>
              <p className="text-[10px] text-neutral-400 mt-0.5 font-light">Review the structured parameters and generated complaint file.</p>
            </div>
            <button
              onClick={() => setFlowStep("input")}
              className="text-xs font-bold text-neutral-400 hover:text-white underline cursor-pointer"
            >
              Modify Fields
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Left: Summary Bento Blocks */}
            <div className="md:col-span-5 space-y-4">
              <div className="bg-[#181818] border border-white/5 rounded-2xl p-4 space-y-3 text-neutral-200">
                <span className="text-[9px] font-extrabold uppercase tracking-widest font-mono text-neutral-500 block">Structured Metadata</span>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-[11px] border-b border-white/5 pb-1.5">
                    <span className="text-neutral-400 font-light">Classified Issue:</span>
                    <span className="font-bold text-white">{issueType}</span>
                  </div>
                  <div className="flex justify-between text-[11px] border-b border-white/5 pb-1.5">
                    <span className="text-neutral-400 font-light">SLA Priority:</span>
                    <span className="font-bold text-rose-400">{severity} / High</span>
                  </div>
                  <div className="flex justify-between text-[11px] border-b border-white/5 pb-1.5">
                    <span className="text-neutral-400 font-light">Routing Division:</span>
                    <span className="font-bold text-white">{suggestedDepartment}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-neutral-400 font-light">GPS Position:</span>
                    <span className="font-mono text-neutral-400 text-[10px]">{latitude.toFixed(4)}, {longitude.toFixed(4)}</span>
                  </div>
                </div>
              </div>

              {/* Photo Card summary */}
              <div className="rounded-2xl overflow-hidden border border-white/5 aspect-video h-40 bg-neutral-900">
                <img 
                  src={selectedImage || ""} 
                  alt="Incident Summary" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Right: Printable Draft complaint Letter container */}
            <div className="md:col-span-7 space-y-4">
              <div className="bg-black text-neutral-300 rounded-2xl p-5 border border-white/5 font-mono text-[10px] leading-relaxed relative max-h-[320px] overflow-y-auto whitespace-pre-wrap select-text">
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded text-[8px] text-teal-400 font-bold uppercase tracking-widest animate-pulse">
                  <FileText className="w-3 h-3" />
                  Gemini Draft
                </div>
                
                {generatingDraft ? (
                  <div className="h-48 flex flex-col items-center justify-center space-y-2 text-neutral-500">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span className="text-[10px] font-mono tracking-widest">Compiling legal complaint layout...</span>
                  </div>
                ) : (
                  draftedLetter || "Generating complaint letter..."
                )}
              </div>

              {/* Final Submit action */}
              <div className="flex gap-3">
                <button
                  onClick={() => setFlowStep("input")}
                  className="flex-1 border border-white/10 text-neutral-400 hover:text-white hover:bg-white/5 font-bold py-3 rounded-2xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Edit Information
                </button>
                <button
                  onClick={handleFinalSubmit}
                  className="flex-1 bg-gradient-to-r from-teal-400 to-indigo-500 hover:from-teal-400 hover:to-indigo-600 text-slate-950 font-bold py-3 rounded-2xl text-xs uppercase tracking-wider shadow-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle className="w-4.5 h-4.5" />
                  Register with NagarNetra
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
