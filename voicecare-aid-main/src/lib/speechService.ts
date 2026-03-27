export type Language = "en" | "hi" | "ta" | "te" | "bn" | "kn" | "ml" | "mr" | "gu" | "pa";

export const languageLabels: Record<Language, string> = {
  en: "English",
  hi: "हिंदी",
  ta: "தமிழ்",
  te: "తెలుగు",
  bn: "বাংলা",
  kn: "ಕನ್ನಡ",
  ml: "മലയാളം",
  mr: "मराठी",
  gu: "ગુજરાતી",
  pa: "ਪੰਜਾਬੀ",
};

const langCodes: Record<Language, string> = {
  en: "en-US",
  hi: "hi-IN",
  ta: "ta-IN",
  te: "te-IN",
  bn: "bn-IN",
  kn: "kn-IN",
  ml: "ml-IN",
  mr: "mr-IN",
  gu: "gu-IN",
  pa: "pa-IN",
};

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

export function startListening(
  language: Language,
  onResult: (text: string) => void,
  onEnd: () => void,
  onError: (error: string) => void
): (() => void) | null {
  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    onError("Speech recognition is not supported in your browser. Please use Chrome.");
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = langCodes[language];
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.continuous = false;

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    const transcript = event.results[0][0].transcript;
    onResult(transcript);
  };

  recognition.onerror = (event: any) => {
    onError(event.error === "no-speech" ? "No speech detected. Please try again." : `Error: ${event.error}`);
    onEnd();
  };

  recognition.onend = () => {
    onEnd();
  };

  recognition.start();

  return () => {
    recognition.stop();
  };
}

export function isSpeechSupported(): boolean {
  return !!(
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  );
}
