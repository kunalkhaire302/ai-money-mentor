"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, Loader2, Volume2, ShieldAlert } from "lucide-react";

export default function VoiceMentor() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [response, setResponse] = useState<any>(null);
  
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      
      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = sendAudioToBackend;
      
      audioChunks.current = [];
      mediaRecorder.current.start();
      setIsRecording(true);
      setResponse(null);
    } catch (err) {
      alert("Microphone access denied or unavailable.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === "recording") {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      setIsProcessing(true);
    }
  };

  const sendAudioToBackend = async () => {
    const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });
    const formData = new FormData();
    formData.append("audio", audioBlob, "voice_query.webm");

    try {
      const res = await fetch("https://ai-money-mentor-n5kt.onrender.com/api/voice-chat", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setResponse(data);
    } catch (error) {
      console.error("Voice processing failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="glass-card p-6 border border-border mt-8 flex flex-col items-center">
      <h3 className="text-lg font-bold text-text-primary mb-2">Speak to your AI Mentor</h3>
      <p className="text-sm text-text-muted mb-6 text-center max-w-md">
        Hold the mic to ask questions about your portfolio, SIPs, or tax planning. Our agent will analyze your tone and respond accordingly.
      </p>

      {/* Mic Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isProcessing}
        className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-colors ${
          isRecording 
            ? "bg-red-500 hover:bg-red-600 animate-pulse" 
            : "bg-accent-emerald hover:bg-emerald-600"
        } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {isProcessing ? (
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        ) : isRecording ? (
          <Square className="w-8 h-8 text-white fill-current" />
        ) : (
          <Mic className="w-8 h-8 text-white" />
        )}
      </motion.button>

      <span className="text-xs font-semibold mt-3 text-text-secondary uppercase tracking-widest">
        {isRecording ? "Recording..." : isProcessing ? "Analyzing Emotion & Intent..." : "Tap to Speak"}
      </span>

      {/* Response Display */}
      <AnimatePresence>
        {response && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-8 w-full max-w-2xl bg-bg-secondary p-5 rounded-xl border border-border"
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/50">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-accent-gold" />
                <span className="text-sm font-semibold capitalize text-text-primary">
                  Voice Emotion Trigger: {response.emotion_detected}
                </span>
              </div>
              
              {response.langgraph_routing_flag === "empathetic_support" && (
                <span className="flex items-center gap-1 text-xs font-bold text-red-400 bg-red-400/10 px-2 py-1 rounded">
                  <ShieldAlert className="w-3 h-3" />
                  Empathetic Mode Active
                </span>
              )}
            </div>

            <p className="text-sm text-text-secondary italic mb-4">
              "{response.transcription}"
            </p>

            <div className="bg-bg-primary p-4 rounded-lg border border-border/30">
              <p className="text-sm leading-relaxed text-text-primary">
                <span className="font-bold text-accent-emerald mr-2">Mentor:</span>
                {response.ai_response}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
