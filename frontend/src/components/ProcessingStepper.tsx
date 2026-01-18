import { motion, AnimatePresence } from "framer-motion";
import { ClipboardList, ShieldAlert, Route, Check, Loader2, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProcessingStep {
  id: string;
  label: string;
  icon: React.ElementType;
  status: "pending" | "active" | "completed";
}

interface ProcessingStepperProps {
  completedNodes: string[];
  isProcessing: boolean;
}

const steps: ProcessingStep[] = [
  { id: "Intake Node", label: "Data Extraction", icon: ClipboardList, status: "pending" },
  { id: "Policy Node", label: "Policy Check", icon: Shield, status: "pending" },
  { id: "Risk Analyze Node", label: "Risk Analysis", icon: ShieldAlert, status: "pending" },
  { id: "Routing Node", label: "Final Routing", icon: Route, status: "pending" },
];

export function ProcessingStepper({ completedNodes, isProcessing }: ProcessingStepperProps) {
  const getStepStatus = (stepId: string, index: number): "pending" | "active" | "completed" => {
    if (completedNodes.includes(stepId)) return "completed";
    
    // Check if this is the next step to be processed
    const completedCount = steps.filter(s => completedNodes.includes(s.id)).length;
    if (isProcessing && index === completedCount) return "active";
    
    return "pending";
  };

  return (
    <div className="flex flex-col gap-0">
      {steps.map((step, index) => {
        const status = getStepStatus(step.id, index);
        const Icon = step.icon;
        
        return (
          <div key={step.id} className="flex items-start gap-4">
            {/* Icon & Line */}
            <div className="flex flex-col items-center">
              <motion.div
                className={cn(
                  "relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                  status === "completed" && "bg-status-safe text-white",
                  status === "active" && "bg-primary text-primary-foreground",
                  status === "pending" && "bg-muted text-muted-foreground"
                )}
              >
                <AnimatePresence mode="wait">
                  {status === "completed" ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Check className="w-5 h-5" />
                    </motion.div>
                  ) : status === "active" ? (
                    <motion.div
                      key="loader"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <Loader2 className="w-5 h-5 animate-spin" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="icon"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <Icon className="w-5 h-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
              
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="relative w-0.5 h-16 bg-muted overflow-hidden">
                  <motion.div
                    className="absolute top-0 left-0 w-full bg-status-safe"
                    initial={{ height: 0 }}
                    animate={{ height: status === "completed" ? "100%" : "0%" }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              )}
            </div>

            {/* Label */}
            <div className="pt-2">
              <p className={cn(
                "font-medium transition-colors duration-300",
                status === "completed" && "text-status-safe",
                status === "active" && "text-primary",
                status === "pending" && "text-muted-foreground"
              )}>
                {step.label}
              </p>
              <p className="text-sm text-muted-foreground">
                {status === "completed" && "Completed"}
                {status === "active" && "In progress..."}
                {status === "pending" && "Waiting"}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
