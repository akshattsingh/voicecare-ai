import { Mic, MicOff, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MicButtonProps {
  isListening: boolean;
  isProcessing: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export function MicButton({ isListening, isProcessing, onClick, disabled }: MicButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || isProcessing}
      whileTap={{ scale: 0.92 }}
      className={cn(
        "relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-ring",
        isListening
          ? "bg-destructive mic-pulse"
          : "bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl",
        isProcessing && "opacity-70 cursor-not-allowed"
      )}
      aria-label={isListening ? "Stop recording" : "Start recording"}
    >
      {isProcessing ? (
        <Loader2 className="w-10 h-10 text-primary-foreground animate-spin" />
      ) : isListening ? (
        <MicOff className="w-10 h-10 text-primary-foreground" />
      ) : (
        <Mic className="w-10 h-10 text-primary-foreground" />
      )}

      {isListening && (
        <motion.span
          className="absolute inset-0 rounded-full border-2 border-destructive"
          initial={{ scale: 1, opacity: 0.6 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
      )}
    </motion.button>
  );
}
