import { motion } from "framer-motion";
import { ClipboardList, User, Calendar, Hash, FileText, Stethoscope, Building2, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface IntakeData {
  member_id?: string;
  member_name?: string;
  policy_number?: string;
  treatment_date?: string;
  claim_amount?: number;
  diagnosis?: string;
  doctor_name?: string;
  hospital_name?: string;
  claim_type?: string;
  summary?: string;
  claim_description?: string;
  input_type?: string;
  [key: string]: unknown;
}

interface IntakeCardProps {
  data: IntakeData;
}

export function IntakeCard({ data }: IntakeCardProps) {
  const primaryFields = [
    { icon: User, label: "Member Name", value: data.member_name },
    { icon: Hash, label: "Member ID", value: data.member_id },
    { icon: FileText, label: "Policy Number", value: data.policy_number },
    { icon: Calendar, label: "Treatment Date", value: data.treatment_date },
  ];

  const secondaryFields = [
    { icon: Stethoscope, label: "Diagnosis", value: data.diagnosis },
    { icon: User, label: "Doctor", value: data.doctor_name },
    { icon: Building2, label: "Hospital", value: data.hospital_name },
  ];

  const hasData = primaryFields.some(f => f.value) || secondaryFields.some(f => f.value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="h-full"
    >
      <Card className="glass-card border-l-4 border-l-primary overflow-hidden h-full flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <ClipboardList className="w-5 h-5 text-primary" />
              </div>
              <CardTitle className="text-lg">Claim Summary</CardTitle>
            </div>
            {data.claim_type && (
              <Badge variant="secondary" className="capitalize">
                {data.claim_type}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto space-y-4">
          {/* Primary Fields */}
          <div className="grid grid-cols-2 gap-3">
            {primaryFields.map((field, index) => (
              <motion.div
                key={field.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-2 p-2.5 bg-background/50 rounded-lg"
              >
                <field.icon className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">{field.label}</p>
                  <p className="font-medium text-foreground text-sm truncate">
                    {field.value || <span className="text-muted-foreground">N/A</span>}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Claim Amount */}
          {data.claim_amount !== undefined && data.claim_amount !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="p-3 bg-primary/5 rounded-lg border border-primary/20"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Claim Amount</span>
                </div>
                <span className="text-lg font-bold text-primary">
                  ${data.claim_amount.toLocaleString()}
                </span>
              </div>
            </motion.div>
          )}

          {/* Secondary Fields */}
          {secondaryFields.some(f => f.value) && (
            <div className="space-y-2">
              {secondaryFields.filter(f => f.value).map((field, index) => (
                <motion.div
                  key={field.label}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center gap-2 text-sm"
                >
                  <field.icon className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">{field.label}:</span>
                  <span className="text-foreground font-medium">{field.value}</span>
                </motion.div>
              ))}
            </div>
          )}

          {/* Summary */}
          {data.summary && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="p-3 bg-background/50 rounded-lg"
            >
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Summary</p>
              <p className="text-sm text-foreground line-clamp-3">{data.summary}</p>
            </motion.div>
          )}

          {/* Fallback if no structured data */}
          {!hasData && data.claim_description && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-3 bg-background/50 rounded-lg"
            >
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Claim Description</p>
              <p className="text-sm text-foreground line-clamp-4">{data.claim_description}</p>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
