import { Globe } from "lucide-react";
import type { Language } from "@/lib/speechService";
import { languageLabels } from "@/lib/speechService";

interface LanguageSelectorProps {
  language: Language;
  onChange: (lang: Language) => void;
}

const languages: Language[] = ["en", "hi", "ta", "te", "bn", "kn", "ml", "mr", "gu", "pa"];

export function LanguageSelector({ language, onChange }: LanguageSelectorProps) {
  return (
    <div className="flex items-center gap-2 bg-card rounded-2xl px-3 py-2 shadow-sm border border-border flex-wrap justify-center">
      <Globe className="w-4 h-4 text-muted-foreground" />
      {languages.map((lang) => (
        <button
          key={lang}
          onClick={() => onChange(lang)}
          className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
            language === lang
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          {languageLabels[lang]}
        </button>
      ))}
    </div>
  );
}
