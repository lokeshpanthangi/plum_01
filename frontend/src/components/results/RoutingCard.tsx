import { motion } from "framer-motion";
import { Route, Building2, ArrowRight, CheckCircle2, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface RoutingData {
  processing_path?: string;
  priority?: string;
  adjuster_tier?: string;
  rationale?: string;
  confidence_score?: number;
  confidence_reasons?: string[];
  [key: string]: unknown;
}

interface RoutingCardProps {
  data: RoutingData;
}

export function RoutingCard({ data }: RoutingCardProps) {
  const department = data.processing_path || "Standard Processing";
  const confidenceScore = data.confidence_score ?? 75;
  const confidenceReasons = data.confidence_reasons ?? [];
  const isSpecialUnit = department.toLowerCase().includes("manual") || 
                        department.toLowerCase().includes("review");
  const isFastTrack = department.toLowerCase().includes("fast");
  
  const getConfidenceColor = (score: number) => {
    if (score >= 80) return "text-status-safe";
    if (score >= 60) return "text-status-warning";
    return "text-status-danger";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="h-full"
    >
      <Card className={cn(
        "glass-card-elevated border-l-4 overflow-hidden h-full flex flex-col",
        isFastTrack ? "border-l-status-safe" : isSpecialUnit ? "border-l-status-warning" : "border-l-primary"
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Route className="w-5 h-5 text-primary" />
            </div>
            <CardTitle className="text-lg">Final Decision</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 flex-1 overflow-y-auto">
          {/* Confidence Score */}
          <div className="p-4 bg-background/50 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">Decision Confidence</span>
              </div>
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className={cn("text-2xl font-bold", getConfidenceColor(confidenceScore))}
              >
                {confidenceScore}%
              </motion.span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${confidenceScore}%` }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                className={cn(
                  "h-full rounded-full",
                  confidenceScore >= 80 && "bg-status-safe",
                  confidenceScore >= 60 && confidenceScore < 80 && "bg-status-warning",
                  confidenceScore < 60 && "bg-status-danger"
                )}
              />
            </div>
          </div>

          {/* Department Routing */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="p-3 bg-background/50 rounded-xl"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="text-sm">Claim</span>
                <ArrowRight className="w-4 h-4" />
              </div>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-sm",
                  isFastTrack 
                    ? "bg-status-safe/15 text-status-safe" 
                    : isSpecialUnit
                    ? "bg-status-warning/15 text-status-warning"
                    : "bg-primary/15 text-primary"
                )}
              >
                <Building2 className="w-4 h-4" />
                {department}
              </motion.div>
            </div>
          </motion.div>

          {/* Confidence Reasons */}
          {confidenceReasons.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Decision Factors</p>
              <ul className="space-y-1.5">
                {confidenceReasons.map((reason, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-start gap-2 text-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-status-safe mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{reason}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          )}

          {/* Success Banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
            className="flex items-center gap-3 p-3 bg-status-safe/10 rounded-lg border border-status-safe/20"
          >
            <CheckCircle2 className="w-5 h-5 text-status-safe" />
            <p className="text-sm font-medium text-status-safe">Claim processed successfully</p>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
