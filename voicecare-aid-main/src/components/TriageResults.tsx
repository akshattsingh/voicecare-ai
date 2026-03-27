import { motion } from "framer-motion";
import { AlertTriangle, Clock, Activity, Stethoscope, Shield } from "lucide-react";
import type { RiskLevel } from "@/lib/triageEngine";
import type { Language } from "@/lib/speechService";
import { cn } from "@/lib/utils";

interface ExtractionResult {
  symptoms: string[];
  duration: string;
  severity: string;
  category: string;
}

interface TriageResultsProps {
  extraction: ExtractionResult;
  riskLevel: RiskLevel;
  recommendation: string;
  localRecommendation: string;
  language: Language;
}

const riskLabels: Record<RiskLevel, Record<string, string>> = {
  HIGH: { en: "High Risk", hi: "उच्च जोखिम", ta: "அதிக ஆபத்து", te: "అధిక ప్రమాదం", bn: "উচ্চ ঝুঁকি", kn: "ಹೆಚ್ಚಿನ ಅಪಾಯ", ml: "ഉയർന്ന അപകടം", mr: "उच्च धोका", gu: "ઉચ્ચ જોખમ", pa: "ਉੱਚ ਖ਼ਤਰਾ" },
  MEDIUM: { en: "Medium Risk", hi: "मध्यम जोखिम", ta: "நடுத்தர ஆபத்து", te: "మధ్యస్థ ప్రమాదం", bn: "মাঝারি ঝুঁকি", kn: "ಮಧ್ಯಮ ಅಪಾಯ", ml: "മധ്യ അപകടം", mr: "मध्यम धोका", gu: "મધ્યમ જોખમ", pa: "ਮੱਧਮ ਖ਼ਤਰਾ" },
  LOW: { en: "Low Risk", hi: "कम जोखिम", ta: "குறைந்த ஆபத்து", te: "తక్కువ ప్రమాదం", bn: "কম ঝুঁকি", kn: "ಕಡಿಮೆ ಅಪಾಯ", ml: "കുറഞ്ഞ അപകടം", mr: "कमी धोका", gu: "ઓછું જોખમ", pa: "ਘੱਟ ਖ਼ਤਰਾ" },
};

const uiLabels: Record<string, Record<string, string>> = {
  symptoms: { en: "Symptoms", hi: "लक्षण", ta: "அறிகுறிகள்", te: "లక్షణాలు", bn: "লক্ষণ", kn: "ರೋಗಲಕ್ಷಣಗಳು", ml: "ലക്ഷണങ്ങൾ", mr: "लक्षणे", gu: "લક્ષણો", pa: "ਲੱਛਣ" },
  duration: { en: "Duration", hi: "अवधि", ta: "கால அளவு", te: "వ్యవధి", bn: "সময়কাল", kn: "ಅವಧಿ", ml: "കാലാവധി", mr: "कालावधी", gu: "સમયગાળો", pa: "ਸਮਾਂ" },
  category: { en: "Category", hi: "श्रेणी", ta: "வகை", te: "వర్గం", bn: "বিভাগ", kn: "ವರ್ಗ", ml: "വിഭാഗം", mr: "श्रेणी", gu: "શ્રેણી", pa: "ਸ਼੍ਰੇਣੀ" },
};

const riskIcons: Record<RiskLevel, typeof AlertTriangle> = {
  HIGH: AlertTriangle,
  MEDIUM: Shield,
  LOW: Activity,
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

function t(key: string, lang: Language) {
  return uiLabels[key]?.[lang] || uiLabels[key]?.en || key;
}

export function TriageResults({ extraction, riskLevel, recommendation, localRecommendation, language }: TriageResultsProps) {
  const RiskIcon = riskIcons[riskLevel];
  const label = riskLabels[riskLevel][language] || riskLabels[riskLevel].en;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="w-full max-w-lg space-y-4">
      <motion.div variants={item} className={cn("rounded-xl p-5 border-2", {
        "border-risk-high bg-risk-high-bg": riskLevel === "HIGH",
        "border-risk-medium bg-risk-medium-bg": riskLevel === "MEDIUM",
        "border-risk-low bg-risk-low-bg": riskLevel === "LOW",
      })}>
        <div className="flex items-center gap-3 mb-3">
          <RiskIcon className={cn("w-6 h-6", {
            "text-risk-high": riskLevel === "HIGH",
            "text-risk-medium": riskLevel === "MEDIUM",
            "text-risk-low": riskLevel === "LOW",
          })} />
          <span className={cn("text-lg font-bold", {
            "text-risk-high": riskLevel === "HIGH",
            "text-risk-medium": riskLevel === "MEDIUM",
            "text-risk-low": riskLevel === "LOW",
          })}>{label}</span>
        </div>
        <p className="text-foreground/80 font-body text-sm leading-relaxed">
          {language === "en" ? recommendation : localRecommendation}
        </p>
      </motion.div>

      <motion.div variants={item} className="bg-card rounded-xl p-5 shadow-sm border border-border">
        <div className="flex items-center gap-2 mb-3">
          <Stethoscope className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">{t("symptoms", language)}</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {extraction.symptoms.map((s, i) => (
            <span key={i} className="bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-medium">{s}</span>
          ))}
        </div>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-2 gap-3">
        <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground font-medium">{t("duration", language)}</span>
          </div>
          <p className="text-sm font-semibold text-foreground">{extraction.duration || "N/A"}</p>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground font-medium">{t("category", language)}</span>
          </div>
          <p className="text-sm font-semibold text-foreground capitalize">{extraction.category || "General"}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
