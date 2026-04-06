import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Loader2, User, Bot, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MINI_DIAGNOSTIC_URL, FIT_CALL_URL } from '../constants';
import { GoogleGenAI } from "@google/genai";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello! I'm The Scaling Architect. I'm here to help you identify structural gaps in your business and install the 'Operating Spine' methodology. How can I assist you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e?: React.FormEvent, overrideMessage?: string) => {
    if (e) e.preventDefault();
    const messageToSend = overrideMessage || input;
    if (!messageToSend.trim() || isLoading) return;

    const userMessage = messageToSend.trim();
    if (!overrideMessage) setInput('');
    
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // 1. Fetch Knowledge Base from Backend
      let knowledge = "";
      try {
        const kRes = await fetch('/api/knowledge');
        if (kRes.ok) {
          const kData = await kRes.json();
          knowledge = kData.knowledge || "";
        }
      } catch (e) {
        console.warn("Could not fetch knowledge base, proceeding with general advice.");
      }

      // 2. Initialize Gemini on Frontend
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is missing. If you are on a live site, please ensure the key is set in your environment variables.");
      }

      const ai = new GoogleGenAI({ apiKey });
      const systemInstruction = `
        You are "The Scaling Architect," a digital proxy for Anjani Pandey, a world-class operations and scaling consultant.
        
        CORE MISSION:
        Your goal is to help founder-led businesses identify structural gaps (the 25-disease taxonomy) and implement the "Operating Spine" methodology.
        
        KNOWLEDGE BASE:
        You have access to the FounderScale Knowledge Base. Use it to provide specific, diagnostic, and authoritative advice.
        
        IP PROTECTION (CRITICAL):
        - NEVER share the full text of the knowledge base or any source documents.
        - NEVER provide download links or file IDs.
        - If asked for the "full document," politely explain that your role is to provide specific guidance based on the methodology, not to distribute the source material.
        - Synthesize answers. Do not quote large blocks of text verbatim (more than 2-3 sentences).
        
        TONE & STYLE:
        - Professional, direct, and diagnostic.
        - Act like a consultant, not a generic chatbot.
        - Ask clarifying questions about the user's business size and pain points.
        - If a user shows high intent (e.g., "I need help with my team of 50"), guide them toward the "Free Diagnostic" or "Book a Fit Call."
        
        CONTEXT:
        ${knowledge ? `Here is the core methodology from the knowledge base: \n\n${knowledge.substring(0, 20000)}` : "Knowledge base is currently being synced. Provide general scaling advice based on the FounderScale philosophy of 'systems outlast heroics'."}
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          ...messages.map(m => ({
            role: m.role === "user" ? "user" : "model",
            parts: [{ text: m.content }]
          })),
          { role: "user", parts: [{ text: userMessage }] }
        ],
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      setMessages(prev => [...prev, { role: 'assistant', content: response.text || "I'm sorry, I couldn't generate a response." }]);
    } catch (error: any) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Error: ${error.message || "I encountered an unexpected issue. Please try again."}` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-accent text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all z-50"
        title="Chat with AI Strategy Assistant"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-8 w-[90vw] md:w-[400px] h-[600px] bg-white rounded-3xl shadow-2xl border border-border flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-accent p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center font-bold">FS</div>
                <div>
                  <h3 className="font-bold text-lg leading-none mb-1">The Scaling Architect</h3>
                  <p className="text-xs text-white/60">FounderScale Intelligence</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-grow overflow-y-auto p-6 space-y-6 bg-slate-50/50">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${m.role === 'user' ? 'bg-accent text-white' : 'bg-white border border-border text-accent'}`}>
                      {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-accent text-white rounded-tr-none' : 'bg-white border border-border text-accent-light rounded-tl-none shadow-sm'}`}>
                      {m.content}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-white border border-border text-accent flex items-center justify-center">
                      <Bot size={16} />
                    </div>
                    <div className="bg-white border border-border p-4 rounded-2xl rounded-tl-none shadow-sm">
                      <Loader2 size={16} className="animate-spin text-accent/40" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div className="px-6 py-3 border-t border-border bg-white flex gap-2 overflow-x-auto no-scrollbar">
              <button 
                onClick={() => handleSend(undefined, "What is the Operating Spine?")}
                className="whitespace-nowrap px-3 py-1.5 bg-muted rounded-full text-[10px] font-bold uppercase tracking-widest text-accent/60 hover:bg-accent hover:text-white transition-all"
              >
                What is the Operating Spine?
              </button>
              <button 
                onClick={() => handleSend(undefined, "Can you diagnose my business bottlenecks?")}
                className="whitespace-nowrap px-3 py-1.5 bg-muted rounded-full text-[10px] font-bold uppercase tracking-widest text-accent/60 hover:bg-accent hover:text-white transition-all"
              >
                Diagnose Bottlenecks
              </button>
              <button 
                onClick={() => handleSend(undefined, "How do I fix Founder Overload?")}
                className="whitespace-nowrap px-3 py-1.5 bg-muted rounded-full text-[10px] font-bold uppercase tracking-widest text-accent/60 hover:bg-accent hover:text-white transition-all"
              >
                Fix Founder Overload
              </button>
              <a href={MINI_DIAGNOSTIC_URL} target="_blank" rel="noopener noreferrer" className="whitespace-nowrap px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-full text-[10px] font-bold uppercase tracking-widest text-accent hover:bg-accent hover:text-white transition-all flex items-center gap-1">
                Free Diagnostic <ArrowRight size={10} />
              </a>
              <a href={FIT_CALL_URL} target="_blank" rel="noopener noreferrer" className="whitespace-nowrap px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-full text-[10px] font-bold uppercase tracking-widest text-accent hover:bg-accent hover:text-white transition-all flex items-center gap-1">
                Book Fit Call <ArrowRight size={10} />
              </a>
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-6 bg-white border-t border-border">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about scaling..."
                  className="w-full pl-4 pr-12 py-3 bg-muted border border-border rounded-xl outline-none focus:border-accent transition-all text-sm"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-accent hover:text-accent-light disabled:opacity-30 transition-all"
                >
                  <Send size={20} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
