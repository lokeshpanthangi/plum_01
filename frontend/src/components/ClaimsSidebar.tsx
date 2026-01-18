import { Plus, History, Trash2, FileText, PanelLeftClose, PanelLeft, ShieldCheck } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ClaimHistoryItem } from "@/hooks/useClaimsHistory";
import { cn } from "@/lib/utils";

interface ClaimsSidebarProps {
  claims: ClaimHistoryItem[];
  selectedClaimId: string | null;
  onSelectClaim: (id: string) => void;
  onNewClaim: () => void;
  onDeleteClaim: (id: string) => void;
  onClearHistory: () => void;
}

export const ClaimsSidebar = ({
  claims,
  selectedClaimId,
  onSelectClaim,
  onNewClaim,
  onDeleteClaim,
  onClearHistory,
}: ClaimsSidebarProps) => {
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50">
      <SidebarHeader className="p-4 space-y-4">
        {/* Project Name and Toggle Button */}
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2"
            >
              <ShieldCheck className="h-6 w-6 text-primary" />
              <div>
                <h2 className="text-lg font-bold text-foreground">ClaimFlow AI</h2>
                <p className="text-xs text-muted-foreground">Insurance Claims</p>
              </div>
            </motion.div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-8 w-8 hover:bg-sidebar-accent"
            aria-label="Toggle sidebar"
          >
            {isCollapsed ? (
              <PanelLeft className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* New Claim Button */}
        <Button
          onClick={onNewClaim}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          size={isCollapsed ? "icon" : "default"}
        >
          <Plus className="h-4 w-4" />
          {!isCollapsed && <span className="ml-2">New Claim</span>}
        </Button>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel className="flex items-center gap-2 text-muted-foreground">
              <History className="h-4 w-4" />
              Claim History
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <ScrollArea className="h-[calc(100vh-200px)]">
              <SidebarMenu>
                <AnimatePresence mode="popLayout">
                  {claims.map((claim) => (
                    <motion.div
                      key={claim.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          isActive={selectedClaimId === claim.id}
                          onClick={() => onSelectClaim(claim.id)}
                          tooltip={claim.summary}
                          className={cn(
                            "group relative h-auto py-4",
                            selectedClaimId === claim.id && "bg-sidebar-accent"
                          )}
                        >
                          <FileText className="h-5 w-5 shrink-0" />
                          {!isCollapsed && (
                            <div className="flex-1 min-w-0">
                              <p className="text-base font-medium truncate leading-tight mb-1">
                                {claim.summary}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {format(claim.timestamp, "MMM d, h:mm a")}
                              </p>
                            </div>
                          )}
                          {!isCollapsed && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity absolute right-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteClaim(claim.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                            </Button>
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {claims.length === 0 && !isCollapsed && (
                  <div className="px-4 py-8 text-center text-muted-foreground text-sm">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No claims yet</p>
                    <p className="text-xs mt-1">Process your first claim to see it here</p>
                  </div>
                )}
              </SidebarMenu>
            </ScrollArea>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {!isCollapsed && claims.length > 0 && (
        <SidebarFooter className="p-4 border-t border-border/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearHistory}
            className="w-full text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear History
          </Button>
        </SidebarFooter>
      )}
    </Sidebar>
  );
};
