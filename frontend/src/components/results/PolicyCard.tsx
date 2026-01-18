import { motion } from "framer-motion";
import { Shield, CheckCircle, XCircle, AlertTriangle, DollarSign, FileText, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PolicyCardProps {
  data: Record<string, unknown>;
}

export function PolicyCard({ data }: PolicyCardProps) {
  const decision = (data.decision as string) || "PENDING";
  const approvedAmount = data.approved_amount as number | null;
  const reasoning = (data.reasoning as string[]) || [];
  const policyReferences = (data.policy_references as string[]) || [];
  const confidenceScore = (data.confidence_score as number) || 75;

  const getDecisionConfig = (decision: string) => {
    switch (decision.toUpperCase()) {
      case "APPROVED":
        return {
          icon: CheckCircle,
          color: "text-status-safe",
          bgColor: "bg-status-safe/10",
          borderColor: "border-l-status-safe",
          badgeClass: "bg-status-safe hover:bg-status-safe/90"
        };
      case "REJECTED":
        return {
          icon: XCircle,
          color: "text-status-danger",
          bgColor: "bg-status-danger/10",
          borderColor: "border-l-status-danger",
          badgeClass: "bg-status-danger hover:bg-status-danger/90"
        };
      case "PARTIAL":
        return {
          icon: AlertTriangle,
          color: "text-status-warning",
          bgColor: "bg-status-warning/10",
          borderColor: "border-l-status-warning",
          badgeClass: "bg-status-warning hover:bg-status-warning/90 text-white"
        };
      default:
        return {
          icon: Shield,
          color: "text-primary",
          bgColor: "bg-primary/10",
          borderColor: "border-l-primary",
          badgeClass: "bg-primary/80"
        };
    }
  };

  const config = getDecisionConfig(decision);
  const DecisionIcon = config.icon;

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
      <Card className={cn("glass-card border-l-4 overflow-hidden h-full flex flex-col", config.borderColor)}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", config.bgColor)}>
              <Shield className={cn("w-5 h-5", config.color)} />
            </div>
            <CardTitle className="text-lg">Policy Decision</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 flex-1 overflow-y-auto">
          {/* Confidence Score */}
          <div className="p-4 bg-background/50 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">Confidence</span>
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

          {/* Decision Badge */}
          <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
            <span className="text-sm text-muted-foreground">Decision</span>
            <Badge className={config.badgeClass}>
              <DecisionIcon className="w-3 h-3 mr-1" />
              {decision}
            </Badge>
          </div>

          {/* Approved Amount */}
          {approvedAmount !== null && approvedAmount !== undefined && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20"
            >
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                Approved Amount
              </span>
              <span className="font-bold text-lg text-primary">
                ${approvedAmount.toLocaleString()}
              </span>
            </motion.div>
          )}

          {/* Reasoning */}
          {reasoning.length > 0 && (
            <div className="space-y-2">
              <span className="text-sm font-medium text-foreground flex items-center gap-1">
                <FileText className="w-4 h-4 text-muted-foreground" />
                Reasoning
              </span>
              <ul className="space-y-1.5">
                {reasoning.slice(0, 3).map((reason, index) => (
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

          {/* Policy References */}
          {policyReferences.length > 0 && policyReferences[0] !== "No specific references" && (
            <div className="space-y-2">
              <span className="text-sm text-muted-foreground">Policy References</span>
              <div className="flex flex-wrap gap-1">
                {policyReferences.map((ref, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {ref}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
