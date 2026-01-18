import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { StreamResult } from "@/hooks/useClaimProcessor";
import { IntakeCard } from "@/components/results/IntakeCard";
import { RiskCard } from "@/components/results/RiskCard";
import { RoutingCard } from "@/components/results/RoutingCard";
import { PolicyCard } from "@/components/results/PolicyCard";

interface ResultsPanelProps {
  results: StreamResult[];
}

export function ResultsPanel({ results }: ResultsPanelProps) {
  if (results.length === 0) {
    return null;
  }

  const renderResultCard = (result: StreamResult, index: number) => {
    switch (result.node) {
      case "Intake Node":
        return <IntakeCard key={`intake-${index}`} data={result.data} />;
      case "Policy Node":
        return <PolicyCard key={`policy-${index}`} data={result.data} />;
      case "Risk Analyze Node":
        return <RiskCard key={`risk-${index}`} data={result.data} />;
      case "Routing Node":
        return <RoutingCard key={`routing-${index}`} data={result.data} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Processing Results</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {results.map((result, index) => renderResultCard(result, index))}
      </div>
    </div>
  );
}
