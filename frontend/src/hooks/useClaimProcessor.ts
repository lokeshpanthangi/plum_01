import { useState, useCallback } from "react";
import { toast } from "sonner";

export interface StreamResult {
  node: string;
  data: Record<string, unknown>;
}

interface UseClaimProcessorReturn {
  isProcessing: boolean;
  results: StreamResult[];
  completedNodes: string[];
  processClaim: (claimText: string) => Promise<void>;
  processFile: (file: File) => Promise<void>;
  reset: () => void;
}

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
const API_ENDPOINT = `${API_BASE_URL}/process-claim-stream/`;
const API_FILE_ENDPOINT = `${API_BASE_URL}/process-claim-file-stream/`;

export function useClaimProcessor(): UseClaimProcessorReturn {
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<StreamResult[]>([]);
  const [completedNodes, setCompletedNodes] = useState<string[]>([]);

  const reset = useCallback(() => {
    setResults([]);
    setCompletedNodes([]);
    setIsProcessing(false);
  }, []);

  const processStream = useCallback(async (response: Response) => {
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("No response body reader available");
    }

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;

        try {
          const parsed = JSON.parse(trimmedLine) as StreamResult;
          setResults((prev) => [...prev, parsed]);
          setCompletedNodes((prev) => 
            prev.includes(parsed.node) ? prev : [...prev, parsed.node]
          );
        } catch (parseError) {
          console.warn("Failed to parse line:", trimmedLine, parseError);
        }
      }
    }

    if (buffer.trim()) {
      try {
        const parsed = JSON.parse(buffer.trim()) as StreamResult;
        setResults((prev) => [...prev, parsed]);
        setCompletedNodes((prev) => 
          prev.includes(parsed.node) ? prev : [...prev, parsed.node]
        );
      } catch (parseError) {
        console.warn("Failed to parse remaining buffer:", buffer, parseError);
      }
    }
  }, []);

  const processClaim = useCallback(async (claimText: string) => {
    reset();
    setIsProcessing(true);

    try {
      const requestBody = {
        claim_description: claimText
      };

      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Backend error response:", errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      await processStream(response);
      toast.success("Claim processed successfully!");
    } catch (error) {
      console.error("Error processing claim:", error);
      toast.error(
        error instanceof Error 
          ? `Connection Error: ${error.message}` 
          : "Failed to connect to the processing server"
      );
    } finally {
      setIsProcessing(false);
    }
  }, [reset, processStream]);

  const processFile = useCallback(async (file: File) => {
    reset();
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(API_FILE_ENDPOINT, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Backend error response:", errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      await processStream(response);
      toast.success("File processed successfully!");
    } catch (error) {
      console.error("Error processing file:", error);
      toast.error(
        error instanceof Error 
          ? `Connection Error: ${error.message}` 
          : "Failed to process the file"
      );
    } finally {
      setIsProcessing(false);
    }
  }, [reset, processStream]);

  return {
    isProcessing,
    results,
    completedNodes,
    processClaim,
    processFile,
    reset,
  };
}
