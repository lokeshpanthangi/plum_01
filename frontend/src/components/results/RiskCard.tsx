import { motion } from "framer-motion";
import { ShieldAlert, AlertTriangle, CheckCircle, XCircle, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface RiskData {
  risk_score?: number;
  category?: string;
  confidence_score?: number;
  confidence_reasons?: string[];
  reasons?: string[];
  [key: string]: unknown;
}

interface RiskCardProps {
  data: RiskData;
}

export function RiskCard({ data }: RiskCardProps) {
  const score = data.risk_score ?? 0;
  const category = data.category ?? "Low";
  const confidenceScore = data.confidence_score ?? 75;
  const confidenceReasons = data.confidence_reasons ?? [];
  
  const getRiskLevel = (category: string) => {
    if (category === "Low") return { level: "Low", color: "status-safe", Icon: CheckCircle };
    if (category === "Medium") return { level: "Medium", color: "status-warning", Icon: AlertTriangle };
    return { level: "High", color: "status-danger", Icon: XCircle };
  };

  const { level, color, Icon } = getRiskLevel(category);

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
        "glass-card border-l-4 overflow-hidden h-full flex flex-col",
        color === "status-safe" && "border-l-status-safe",
        color === "status-warning" && "border-l-status-warning",
        color === "status-danger" && "border-l-status-danger"
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg",
              color === "status-safe" && "bg-status-safe/10",
              color === "status-warning" && "bg-status-warning/10",
              color === "status-danger" && "bg-status-danger/10"
            )}>
              <ShieldAlert className={cn(
                "w-5 h-5",
                color === "status-safe" && "text-status-safe",
                color === "status-warning" && "text-status-warning",
                color === "status-danger" && "text-status-danger"
              )} />
            </div>
            <CardTitle className="text-lg">Risk Assessment</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 flex-1 overflow-y-auto">
          {/* Confidence Score - Main Display */}
          <div className="p-4 bg-background/50 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">Confidence Score</span>
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

          {/* Risk Category Badge */}
          <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
            <span className="text-sm text-muted-foreground">Risk Level</span>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.3 }}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium",
                color === "status-safe" && "bg-status-safe/15 text-status-safe",
                color === "status-warning" && "bg-status-warning/15 text-status-warning",
                color === "status-danger" && "bg-status-danger/15 text-status-danger"
              )}
            >
              <Icon className="w-4 h-4" />
              {level} Risk
            </motion.div>
          </div>

          {/* Confidence Reasons */}
          {confidenceReasons.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Why this confidence?</p>
              <ul className="space-y-1.5">
                {confidenceReasons.map((reason, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="flex items-start gap-2 text-sm"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-status-safe mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{reason}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
