import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Stethoscope, LayoutDashboard, Loader2 } from "lucide-react";
import { MicButton } from "@/components/MicButton";
import { LanguageSelector } from "@/components/LanguageSelector";
import { TriageResults } from "@/components/TriageResults";
import { DoctorDashboard } from "@/components/DoctorDashboard";
import { startListening, isSpeechSupported, type Language } from "@/lib/speechService";
import { runTriage, type RiskLevel } from "@/lib/triageEngine";
import { saveRecord, type TriageRecord } from "@/lib/analyticsStore";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ExtractionResult {
  symptoms: string[];
  duration: string;
  severity: string;
  category: string;
}

const uiStrings: Record<string, Record<string, string>> = {
  describeSymptoms: {
    en: "Describe Your Symptoms", hi: "अपने लक्षण बताएं", ta: "உங்கள் அறிகுறிகளை விவரியுங்கள்",
    te: "మీ లక్షణాలను వివరించండి", bn: "আপনার লক্ষণ বর্ণনা করুন", kn: "ನಿಮ್ಮ ರೋಗಲಕ್ಷಣಗಳನ್ನು ವಿವರಿಸಿ",
    ml: "നിങ്ങളുടെ ലക്ഷണങ്ങൾ വിവരിക്കുക", mr: "तुमची लक्षणे सांगा", gu: "તમારા લક્ષણો જણાવો", pa: "ਆਪਣੇ ਲੱਛਣ ਦੱਸੋ",
  },
  tapMic: {
    en: "Tap the mic and speak, or type below", hi: "माइक बटन दबाएं और बोलें, या नीचे टाइप करें",
    ta: "மைக்கைத் தட்டி பேசுங்கள், அல்லது கீழே தட்டச்சு செய்யுங்கள்",
    te: "మైక్ నొక్కి మాట్లాడండి, లేదా కింద టైప్ చేయండి", bn: "মাইক ট্যাপ করুন এবং বলুন, বা নিচে টাইপ করুন",
    kn: "ಮೈಕ್ ಒತ್ತಿ ಮಾತನಾಡಿ, ಅಥವಾ ಕೆಳಗೆ ಟೈಪ್ ಮಾಡಿ", ml: "മൈക്ക് ടാപ്പ് ചെയ്ത് സംസാരിക്കുക",
    mr: "माइक दाबा आणि बोला, किंवा खाली टाइप करा", gu: "માઇક દબાવો અને બોલો, અથવા નીચે ટાઇપ કરો", pa: "ਮਾਈਕ ਦਬਾਓ ਅਤੇ ਬੋਲੋ",
  },
  listening: {
    en: "Listening...", hi: "सुन रहा है...", ta: "கேட்கிறது...", te: "వింటోంది...", bn: "শুনছে...",
    kn: "ಕೇಳುತ್ತಿದೆ...", ml: "കേൾക്കുന്നു...", mr: "ऐकत आहे...", gu: "સાંભળે છે...", pa: "ਸੁਣ ਰਿਹਾ ਹੈ...",
  },
  analyzing: {
    en: "Analyzing...", hi: "विश्लेषण कर रहा है...", ta: "பகுப்பாய்வு...", te: "విశ్లేషిస్తోంది...", bn: "বিশ্লেষণ...",
    kn: "ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...", ml: "വിശകലനം...", mr: "विश्लेषण...", gu: "વિશ્લેષણ...", pa: "ਵਿਸ਼ਲੇਸ਼ਣ...",
  },
  placeholder: {
    en: "Type your symptoms here...", hi: "यहाँ अपने लक्षण टाइप करें...", ta: "இங்கே உங்கள் அறிகுறிகளைத் தட்டச்சு செய்யுங்கள்...",
    te: "ఇక్కడ మీ లక్షణాలను టైప్ చేయండి...", bn: "এখানে আপনার লক্ষণ টাইপ করুন...",
    kn: "ಇಲ್ಲಿ ನಿಮ್ಮ ರೋಗಲಕ್ಷಣಗಳನ್ನು ಟೈಪ್ ಮಾಡಿ...", ml: "ഇവിടെ ലക്ഷണങ്ങൾ ടൈപ്പ് ചെയ്യുക...",
    mr: "इथे तुमची लक्षणे टाइप करा...", gu: "અહીં તમારા લક્ષણો ટાઇપ કરો...", pa: "ਇੱਥੇ ਆਪਣੇ ਲੱਛਣ ਟਾਈਪ ਕਰੋ...",
  },
  youSaid: {
    en: "You said:", hi: "आपने कहा:", ta: "நீங்கள் சொன்னீர்கள்:", te: "మీరు చెప్పారు:", bn: "আপনি বললেন:",
    kn: "ನೀವು ಹೇಳಿದ್ದು:", ml: "നിങ്ങൾ പറഞ്ഞത്:", mr: "तुम्ही म्हणालात:", gu: "તમે કહ્યું:", pa: "ਤੁਸੀਂ ਕਿਹਾ:",
  },
};

function t(key: string, lang: Language) {
  return uiStrings[key]?.[lang] || uiStrings[key]?.en || key;
}

type View = "triage" | "dashboard";

export default function Index() {
  const [view, setView] = useState<View>("triage");
  const [language, setLanguage] = useState<Language>("en");
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [transcript, setTranscript] = useState("");
  const [extraction, setExtraction] = useState<ExtractionResult | null>(null);
  const [riskLevel, setRiskLevel] = useState<RiskLevel | null>(null);
  const [recommendation, setRecommendation] = useState("");
  const [localRecommendation, setLocalRecommendation] = useState("");
  const [stopFn, setStopFn] = useState<(() => void) | null>(null);
  const { toast } = useToast();

  const processText = useCallback(async (text: string) => {
    if (!text.trim()) {
      toast({ title: t("tapMic", language), variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    setTranscript(text);
    setExtraction(null);
    setRiskLevel(null);

    try {
      const { data, error } = await supabase.functions.invoke("extract-symptoms", {
        body: { text, language },
      });

      if (error) throw error;

      const result: ExtractionResult = data;
      setExtraction(result);

      const triage = runTriage(result.symptoms, result.severity, language);
      setRiskLevel(triage.riskLevel);
      setRecommendation(triage.recommendation);
      setLocalRecommendation(triage.localRecommendation);

      const record: TriageRecord = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        transcript: text,
        language,
        symptoms: result.symptoms,
        duration: result.duration,
        severity: result.severity,
        category: result.category,
        riskLevel: triage.riskLevel,
        recommendation: triage.recommendation,
      };
      saveRecord(record);
    } catch (err: any) {
      console.error("Processing error:", err);
      toast({ title: "Processing Error", description: err.message || "Failed to analyze symptoms.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  }, [language, toast]);

  const handleMicClick = useCallback(() => {
    if (isListening && stopFn) {
      stopFn();
      setIsListening(false);
      setStopFn(null);
      return;
    }

    if (!isSpeechSupported()) {
      toast({ title: "Speech not supported", description: "Use Chrome for voice input, or type your symptoms below.", variant: "destructive" });
      return;
    }

    const stop = startListening(
      language,
      (text) => { setTextInput(text); processText(text); },
      () => { setIsListening(false); setStopFn(null); },
      (error) => { toast({ title: "Voice Error", description: error, variant: "destructive" }); }
    );

    if (stop) {
      setIsListening(true);
      setStopFn(() => stop);
    }
  }, [isListening, stopFn, language, processText, toast]);

  const handleTextSubmit = () => processText(textInput);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container max-w-4xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-primary" />
            <h1 className="text-lg font-bold text-foreground">VoiceCare AI</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setView("triage")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${view === "triage" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
              <Stethoscope className="w-4 h-4" /><span className="hidden sm:inline">Triage</span>
            </button>
            <button onClick={() => setView("dashboard")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${view === "dashboard" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
              <LayoutDashboard className="w-4 h-4" /><span className="hidden sm:inline">Dashboard</span>
            </button>
          </div>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {view === "triage" ? (
            <motion.div key="triage" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex flex-col items-center gap-6">
              <LanguageSelector language={language} onChange={setLanguage} />
              <div className="text-center space-y-2">
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">{t("describeSymptoms", language)}</h2>
                <p className="text-muted-foreground font-body text-sm max-w-md">{t("tapMic", language)}</p>
              </div>
              <MicButton isListening={isListening} isProcessing={isProcessing} onClick={handleMicClick} />
              {isListening && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-destructive font-medium">{t("listening", language)}</motion.p>}
              {isProcessing && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-primary"><Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm font-medium">{t("analyzing", language)}</span></motion.div>}
              <div className="w-full max-w-lg flex gap-2">
                <input type="text" value={textInput} onChange={(e) => setTextInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleTextSubmit()} placeholder={t("placeholder", language)} className="flex-1 rounded-xl border border-input bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" disabled={isProcessing} />
                <button onClick={handleTextSubmit} disabled={isProcessing || !textInput.trim()} className="bg-primary text-primary-foreground rounded-xl px-4 py-3 hover:bg-primary/90 disabled:opacity-50 transition-colors"><Send className="w-5 h-5" /></button>
              </div>
              {transcript && !isProcessing && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg bg-muted rounded-xl p-4">
                  <p className="text-xs text-muted-foreground mb-1">{t("youSaid", language)}</p>
                  <p className="text-sm text-foreground font-body">"{transcript}"</p>
                </motion.div>
              )}
              {extraction && riskLevel && (
                <TriageResults extraction={extraction} riskLevel={riskLevel} recommendation={recommendation} localRecommendation={localRecommendation} language={language} />
              )}
            </motion.div>
          ) : (
            <motion.div key="dashboard" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <DoctorDashboard />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
