import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Loader2, User, Bot, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MINI_DIAGNOSTIC_URL, FIT_CALL_URL } from '../constants';

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
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: messages.map(m => ({ role: m.role, content: m.content }))
        })
      });

      const data = await response.json();
      
      if (data.status === 'error') {
        const errorMsg = data.details ? `${data.error}: ${data.details}` : (data.error || "Failed to get response from AI");
        throw new Error(errorMsg);
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.text || "I'm sorry, I couldn't generate a response." }]);
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
