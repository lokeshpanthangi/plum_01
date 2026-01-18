import { useState } from "react";
import { motion } from "framer-motion";
import { RotateCcw, MessageSquare } from "lucide-react";
import { Header } from "@/components/Header";
import { ClaimInput } from "@/components/ClaimInput";
import { ProcessingStepper } from "@/components/ProcessingStepper";
import { ResultsPanel } from "@/components/ResultsPanel";
import { ClaimsSidebar } from "@/components/ClaimsSidebar";
import { ClaimChatBox } from "@/components/ClaimChatBox";
import { useClaimProcessor } from "@/hooks/useClaimProcessor";
import { useClaimsHistory } from "@/hooks/useClaimsHistory";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

const Index = () => {
  const { isProcessing, results, completedNodes, processClaim, processFile, reset } = useClaimProcessor();
  const { 
    claims, 
    selectedClaimId, 
    setSelectedClaimId,
    saveClaim, 
    updateClaimStatus, 
    deleteClaim, 
    clearHistory 
  } = useClaimsHistory();
  const [hasStarted, setHasStarted] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const hasResults = results.length > 0;
  const allNodesCompleted = hasResults && !isProcessing;

  const handleSubmit = async (claimText: string) => {
    setHasStarted(true);
    const claimId = saveClaim(claimText);
    
    try {
      await processClaim(claimText);
      updateClaimStatus(claimId, "completed");
    } catch {
      updateClaimStatus(claimId, "failed");
    }
  };

  const handleFileSubmit = async (file: File) => {
    setHasStarted(true);
    const claimId = saveClaim(`[File Upload] ${file.name}`);
    
    try {
      await processFile(file);
      updateClaimStatus(claimId, "completed");
    } catch {
      updateClaimStatus(claimId, "failed");
    }
  };

  const handleReset = () => {
    setHasStarted(false);
    setSelectedClaimId(null);
    reset();
  };

  const handleSelectClaim = (id: string) => {
    const claim = claims.find(c => c.id === id);
    if (claim) {
      setSelectedClaimId(id);
      setHasStarted(true);
      // For now, just show that a claim was selected
      // In a real app, you'd load the claim's results from storage
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <ClaimsSidebar
          claims={claims}
          selectedClaimId={selectedClaimId}
          onSelectClaim={handleSelectClaim}
          onNewClaim={handleReset}
          onDeleteClaim={deleteClaim}
          onClearHistory={clearHistory}
        />

        <main className="flex-1 relative">
          <div className="container max-w-7xl mx-auto px-4 py-8 md:py-12">
            {/* Mobile Sidebar Trigger */}
            <div className="md:hidden mb-4">
              <SidebarTrigger />
            </div>

            <Header />

            {/* Initial Full-Width View */}
            {!hasStarted && (
              <div className="max-w-3xl mx-auto">
                <ClaimInput onSubmit={handleSubmit} onFileSubmit={handleFileSubmit} isProcessing={isProcessing} />
              </div>
            )}

            {/* Compact View After Starting */}
            {hasStarted && (
              <div className="space-y-8">
                {/* Input Row */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-5">
                    <ClaimInput onSubmit={handleSubmit} onFileSubmit={handleFileSubmit} isProcessing={isProcessing} />
                    
                    {hasResults && !isProcessing && (
                      <div className="mt-4 flex gap-2">
                        <Button
                          variant="outline"
                          onClick={handleReset}
                          className="flex-1"
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Process New Claim
                        </Button>
                        <Button
                          onClick={() => setIsChatOpen(true)}
                          className="flex-1 gap-2"
                        >
                          <MessageSquare className="w-4 h-4" />
                          Chat with Claim
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Processing Stepper */}
                  <div className="lg:col-span-7">
                    {(isProcessing || hasResults) && (
                      <div className="glass-card p-6">
                        <h3 className="text-lg font-semibold text-foreground mb-5">Processing Pipeline</h3>
                        <ProcessingStepper 
                          completedNodes={completedNodes} 
                          isProcessing={isProcessing} 
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Full-Width Results */}
                {hasResults && (
                  <div className="w-full space-y-6 relative">
                    <ResultsPanel results={results} />
                    
                    {/* Chat Box Overlay - Only over results */}
                    <ClaimChatBox
                      isOpen={isChatOpen}
                      onClose={() => setIsChatOpen(false)}
                      claimData={results}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            <footer className="mt-12 text-center text-sm text-muted-foreground">
              <p>ClaimFlow AI — Powered by intelligent document processing</p>
            </footer>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
