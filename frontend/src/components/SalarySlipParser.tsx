"use client";

import { useState } from "react";
import { FileUp, Loader2, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

interface SalarySlipParserProps {
  onParsed: (deductions: any) => void;
}

export default function SalarySlipParser({ onParsed }: SalarySlipParserProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setStatus("error");
      setError("Please upload a PDF file.");
      return;
    }

    setIsUploading(true);
    setStatus("idle");
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const data = await apiFetch("/api/tax-parser", {
        method: "POST",
        body: formData,
      });

      setStatus("success");
      onParsed(data.extracted_deductions);
    } catch (err: any) {
      setStatus("error");
      setError(err.message || "Failed to parse PDF.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mb-8">
      <div className={`relative border-2 border-dashed rounded-2xl p-6 transition-all ${
        status === "success" ? "border-accent-emerald bg-accent-emerald/5" : 
        status === "error" ? "border-red-500/50 bg-red-500/5" :
        "border-border group-hover:border-accent-blue/50 bg-bg-secondary"
      } group`}>
        <input 
          type="file" 
          accept=".pdf"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          disabled={isUploading}
        />
        
        <div className="flex flex-col items-center justify-center text-center">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
            status === "success" ? "bg-accent-emerald text-white" :
            status === "error" ? "bg-red-500 text-white" :
            "bg-bg-primary text-text-muted group-hover:text-accent-blue"
          }`}>
            {isUploading ? <Loader2 className="w-6 h-6 animate-spin" /> : 
             status === "success" ? <CheckCircle className="w-6 h-6" /> :
             status === "error" ? <AlertCircle className="w-6 h-6" /> :
             <FileUp className="w-6 h-6" />}
          </div>
          
          <h4 className="text-sm font-bold text-text-primary mb-1">
            {isUploading ? "Extracting Data..." : 
             status === "success" ? "Data Extracted!" :
             "Auto-fill from PDF"}
          </h4>
          <p className="text-xs text-text-muted max-w-[200px]">
            Upload your Form 16 or Salary Slip to automatically extract 80C, 80D, and HRA.
          </p>
        </div>
      </div>

      <AnimatePresence>
        {status === "error" && (
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] text-red-400 mt-2 font-medium"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
