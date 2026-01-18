import { ShieldCheck, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="text-center mb-8 relative"
    >
      <div className="absolute right-0 top-0">
        <ThemeToggle />
      </div>
      <div className="inline-flex items-center gap-3 mb-3">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
          <ShieldCheck className="relative w-10 h-10 text-primary" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
          ClaimFlow{" "}
          <span className="gradient-text">AI</span>
        </h1>
        <Sparkles className="w-5 h-5 text-primary animate-pulse" />
      </div>
      <p className="text-muted-foreground text-lg">
        Automated Intake, Risk Assessment & Routing
      </p>
    </motion.header>
  );
}
