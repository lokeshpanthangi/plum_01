import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, FileText, ImageIcon, FileUp, X, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface ClaimInputProps {
  onSubmit: (claimText: string) => void;
  onFileSubmit: (file: File) => void;
  isProcessing: boolean;
}

type InputMode = "text" | "file";

export function ClaimInput({ onSubmit, onFileSubmit, isProcessing }: ClaimInputProps) {
  const [claimText, setClaimText] = useState("");
  const [error, setError] = useState("");
  const [inputMode, setInputMode] = useState<InputMode>("text");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (inputMode === "text") {
      if (!claimText.trim()) {
        setError("Please enter claim details before processing.");
        return;
      }
      setError("");
      onSubmit(claimText);
    } else {
      if (!selectedFile) {
        setError("Please select a file before processing.");
        return;
      }
      setError("");
      onFileSubmit(selectedFile);
    }
  };

  const handleFileSelect = (file: File) => {
    const allowedTypes = [
      "image/jpeg", "image/png", "image/gif", "image/webp", "image/bmp",
      "application/pdf"
    ];
    
    if (!allowedTypes.includes(file.type)) {
      setError("Please select an image (JPG, PNG, GIF, WebP) or PDF file.");
      return;
    }
    
    setError("");
    setSelectedFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type === "application/pdf") {
      return <FileText className="w-8 h-8 text-red-500" />;
    }
    return <ImageIcon className="w-8 h-8 text-blue-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="glass-card p-6 md:p-8"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 bg-primary/10 rounded-lg">
          <FileText className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">New Claim Intake</h2>
          <p className="text-sm text-muted-foreground">Enter text or upload an image/PDF</p>
        </div>
      </div>

      {/* Input Mode Tabs */}
      <div className="flex gap-2 mb-4 p-1 bg-muted/50 rounded-lg">
        <button
          onClick={() => setInputMode("text")}
          disabled={isProcessing}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium transition-all",
            inputMode === "text"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <FileText className="w-4 h-4" />
          Text Input
        </button>
        <button
          onClick={() => setInputMode("file")}
          disabled={isProcessing}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium transition-all",
            inputMode === "file"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <FileUp className="w-4 h-4" />
          Upload File
        </button>
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="wait">
          {inputMode === "text" ? (
            <motion.div
              key="text-input"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="space-y-2"
            >
              <Label htmlFor="claim-details" className="text-sm font-medium text-foreground">
                Claim Details
              </Label>
              <Textarea
                id="claim-details"
                placeholder="Type or paste the claim description here..."
                className="min-h-[160px] resize-none bg-background/50 border-border focus:border-primary focus:ring-primary/20 transition-all duration-200"
                value={claimText}
                onChange={(e) => {
                  setClaimText(e.target.value);
                  if (error) setError("");
                }}
                disabled={isProcessing}
              />
            </motion.div>
          ) : (
            <motion.div
              key="file-input"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-2"
            >
              <Label className="text-sm font-medium text-foreground">
                Upload Image or PDF
              </Label>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp,image/bmp,application/pdf"
                onChange={handleFileChange}
                className="hidden"
                disabled={isProcessing}
              />

              {!selectedFile ? (
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "min-h-[160px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200",
                    dragActive
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-muted/30",
                    isProcessing && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className="flex gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-lg">
                      <ImageIcon className="w-6 h-6 text-blue-500" />
                    </div>
                    <div className="p-3 bg-red-500/10 rounded-lg">
                      <FileText className="w-6 h-6 text-red-500" />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-foreground">
                      Drop your file here or click to browse
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Supports: JPG, PNG, GIF, WebP, PDF
                    </p>
                  </div>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="min-h-[160px] border border-border rounded-xl p-4 bg-muted/20"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-background rounded-lg border">
                      {getFileIcon(selectedFile)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatFileSize(selectedFile.size)} • {selectedFile.type.split("/")[1].toUpperCase()}
                      </p>
                      <div className="flex gap-2 mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isProcessing}
                        >
                          Change File
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearFile}
                          disabled={isProcessing}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Preview for images */}
                  {selectedFile.type.startsWith("image/") && (
                    <div className="mt-4 rounded-lg overflow-hidden border bg-background">
                      <img
                        src={URL.createObjectURL(selectedFile)}
                        alt="Preview"
                        className="max-h-[200px] w-full object-contain"
                      />
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-destructive flex items-center gap-1"
          >
            {error}
          </motion.p>
        )}

        <Button
          onClick={handleSubmit}
          disabled={isProcessing}
          className="w-full h-12 text-base font-semibold transition-all duration-300 hover:shadow-lg disabled:opacity-70"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Processing Claim...
            </>
          ) : (
            <>
              <Send className="w-5 h-5 mr-2" />
              Process Claim
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}
