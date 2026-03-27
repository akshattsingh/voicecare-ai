import type { Language } from "./speechService";

export type RiskLevel = "HIGH" | "MEDIUM" | "LOW";

export interface TriageResult {
  riskLevel: RiskLevel;
  recommendation: string;
  localRecommendation: string;
  matchedRule: string;
}

interface TriageRule {
  name: string;
  condition: (symptoms: string[], severity?: string) => boolean;
  riskLevel: RiskLevel;
}

const rules: TriageRule[] = [
  {
    name: "Chest pain or breathing difficulty",
    condition: (symptoms) =>
      symptoms.some((s) =>
        /(chest\s*pain|breathing\s*difficulty|breathless|shortness\s*of\s*breath|heart\s*attack|cardiac)/i.test(s)
      ),
    riskLevel: "HIGH",
  },
  {
    name: "High fever with severe symptoms",
    condition: (symptoms, severity) =>
      symptoms.some((s) => /fever/i.test(s)) && severity === "severe",
    riskLevel: "HIGH",
  },
  {
    name: "Stroke symptoms",
    condition: (symptoms) =>
      symptoms.some((s) =>
        /(stroke|paralysis|numbness|slurred\s*speech|facial\s*droop)/i.test(s)
      ),
    riskLevel: "HIGH",
  },
  {
    name: "Fever with cough or cold",
    condition: (symptoms) =>
      symptoms.some((s) => /fever/i.test(s)) &&
      symptoms.some((s) => /(cough|cold|sore\s*throat|runny\s*nose)/i.test(s)),
    riskLevel: "MEDIUM",
  },
  {
    name: "Moderate pain or discomfort",
    condition: (_, severity) => severity === "moderate",
    riskLevel: "MEDIUM",
  },
];

const recommendations: Record<RiskLevel, Record<string, string>> = {
  HIGH: {
    en: "🚨 Seek immediate medical attention. Visit the nearest hospital or call emergency services.",
    hi: "🚨 तुरंत चिकित्सा सहायता लें। निकटतम अस्पताल जाएं या आपातकालीन सेवाओं को कॉल करें।",
    ta: "🚨 உடனடி மருத்துவ உதவியை நாடுங்கள். அருகிலுள்ள மருத்துவமனைக்குச் செல்லுங்கள்.",
    te: "🚨 వెంటనే వైద్య సహాయం పొందండి. సమీపంలోని ఆసుపత్రికి వెళ్ళండి.",
    bn: "🚨 অবিলম্বে চিকিৎসা সহায়তা নিন। নিকটতম হাসপাতালে যান।",
    kn: "🚨 ತಕ್ಷಣ ವೈದ್ಯಕೀಯ ಸಹಾಯ ಪಡೆಯಿರಿ. ಹತ್ತಿರದ ಆಸ್ಪತ್ರೆಗೆ ಹೋಗಿ.",
    ml: "🚨 ഉടൻ വൈദ്യ സഹായം തേടുക. അടുത്തുള്ള ആശുപത്രിയിൽ പോകുക.",
    mr: "🚨 तात्काळ वैद्यकीय मदत घ्या. जवळच्या रुग्णालयात जा.",
    gu: "🚨 તાત્કાલિક તબીબી સહાય મેળવો. નજીકની હોસ્પિટલમાં જાઓ.",
    pa: "🚨 ਤੁਰੰਤ ਡਾਕਟਰੀ ਮਦਦ ਲਓ। ਨਜ਼ਦੀਕੀ ਹਸਪਤਾਲ ਜਾਓ।",
  },
  MEDIUM: {
    en: "⚠️ Consult a doctor soon. Book an appointment within 24 hours.",
    hi: "⚠️ जल्द ही डॉक्टर से मिलें। 24 घंटे के भीतर अपॉइंटमेंट बुक करें।",
    ta: "⚠️ விரைவில் மருத்துவரை அணுகுங்கள். 24 மணி நேரத்திற்குள் சந்திப்பு பதிவு செய்யுங்கள்.",
    te: "⚠️ త్వరలో వైద్యుడిని సంప్రదించండి. 24 గంటల్లో అపాయింట్‌మెంట్ బుక్ చేయండి.",
    bn: "⚠️ শীঘ্রই একজন ডাক্তারের সাথে পরামর্শ করুন।",
    kn: "⚠️ ಶೀಘ್ರದಲ್ಲೇ ವೈದ್ಯರನ್ನು ಭೇಟಿ ಮಾಡಿ.",
    ml: "⚠️ ഉടൻ ഒരു ഡോക്ടറെ കാണുക.",
    mr: "⚠️ लवकरच डॉक्टरांशी संपर्क साधा.",
    gu: "⚠️ જલ્દીથી ડૉક્ટરનો સંપર્ક કરો.",
    pa: "⚠️ ਜਲਦੀ ਡਾਕਟਰ ਨੂੰ ਮਿਲੋ।",
  },
  LOW: {
    en: "✅ Monitor your symptoms. Rest, stay hydrated, and seek help if symptoms worsen.",
    hi: "✅ अपने लक्षणों पर नज़र रखें। आराम करें, पानी पिएं, और अगर लक्षण बिगड़ें तो मदद लें।",
    ta: "✅ உங்கள் அறிகுறிகளைக் கவனியுங்கள். ஓய்வெடுங்கள்.",
    te: "✅ మీ లక్షణాలను గమనించండి. విశ్రాంతి తీసుకోండి.",
    bn: "✅ আপনার লক্ষণগুলি পর্যবেক্ষণ করুন। বিশ্রাম নিন।",
    kn: "✅ ನಿಮ್ಮ ರೋಗಲಕ್ಷಣಗಳನ್ನು ಗಮನಿಸಿ. ವಿಶ್ರಾಂತಿ ಪಡೆಯಿರಿ.",
    ml: "✅ നിങ്ങളുടെ ലക്ഷണങ്ങൾ നിരീക്ഷിക്കുക. വിശ്രമിക്കുക.",
    mr: "✅ तुमच्या लक्षणांवर लक्ष ठेवा. विश्रांती घ्या.",
    gu: "✅ તમારા લક્ષણોનું નિરીક્ષણ કરો. આરામ કરો.",
    pa: "✅ ਆਪਣੇ ਲੱਛਣਾਂ 'ਤੇ ਨਜ਼ਰ ਰੱਖੋ। ਆਰਾਮ ਕਰੋ।",
  },
};

export function runTriage(symptoms: string[], severity?: string, language: Language = "en"): TriageResult {
  for (const rule of rules) {
    if (rule.condition(symptoms, severity)) {
      return {
        riskLevel: rule.riskLevel,
        recommendation: recommendations[rule.riskLevel].en,
        localRecommendation: recommendations[rule.riskLevel][language] || recommendations[rule.riskLevel].en,
        matchedRule: rule.name,
      };
    }
  }

  return {
    riskLevel: "LOW",
    recommendation: recommendations.LOW.en,
    localRecommendation: recommendations.LOW[language] || recommendations.LOW.en,
    matchedRule: "Default - no high-risk patterns detected",
  };
}
