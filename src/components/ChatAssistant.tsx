import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Loader2, User, Bot, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import { FIT_CALL_URL } from '../constants';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  suggestions?: string[];
}

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant',
      content: "Hi! I'm Anjani's AI assistant.\n\nAsk me about his work in operations and business structure, what he's writing about, or how MetMov helps founder-led businesses scale.",
      suggestions: ["What does Anjani write about?", "What is MetMov?", "How does the Operating Spine work?"]
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userTurnCount, setUserTurnCount] = useState(0);
  const [leadEmail, setLeadEmail] = useState('');
  const [leadCaptured, setLeadCaptured] = useState(false);
  const [showLeadGate, setShowLeadGate] = useState(false);
  const [pendingMessage, setPendingMessage] = useState('');
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

    const newTurnCount = userTurnCount + 1;
    setUserTurnCount(newTurnCount);

    // Show lead gate after 3 user turns (if not already captured)
    if (newTurnCount >= 3 && !leadCaptured) {
      setPendingMessage(userMessage);
      setShowLeadGate(true);
      return;
    }

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

      if (!response.ok) {
        throw new Error('Failed to connect to the assistant');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) throw new Error('No reader available');

      let assistantContent = "";
      let suggestions: string[] = [];
      
      // Add initial empty assistant message
      setMessages(prev => [...prev, { role: 'assistant', content: '', suggestions: [] }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (dataStr === '[DONE]') continue;
            
            try {
              const data = JSON.parse(dataStr);
              if (data.error) throw new Error(data.error);
              if (data.text) {
                assistantContent += data.text;
                
                // Update the last message in the list
                setMessages(prev => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  
                  // Parse suggestions if they appear in the content
                  let displayContent = assistantContent;
                  const suggestionMatch = displayContent.match(/\[SUGGESTIONS:\s*(.*?)\]/);
                  if (suggestionMatch) {
                    suggestions = suggestionMatch[1].split(',').map((s: string) => s.trim());
                    displayContent = displayContent.replace(/\[SUGGESTIONS:\s*.*?\]/, '').trim();
                  }

                  lastMessage.content = displayContent;
                  lastMessage.suggestions = suggestions;
                  return newMessages;
                });
              }
            } catch (e) {
              console.warn("Error parsing stream chunk:", e);
            }
          }
        }
      }
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

  const handleLeadSubmit = async (skip = false) => {
    if (!skip && leadEmail.trim()) {
      // Send lead to backend
      try {
        await fetch('/api/chatbot-lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: leadEmail.trim(), query: pendingMessage })
        });
      } catch (err) {
        console.warn('Lead capture failed:', err);
      }
    }
    setLeadCaptured(true);
    setShowLeadGate(false);

    // Continue with the pending message
    if (pendingMessage) {
      setMessages(prev => [...prev, { role: 'user', content: pendingMessage }]);
      setIsLoading(true);
      setPendingMessage('');

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: pendingMessage,
            history: messages.map(m => ({ role: m.role, content: m.content }))
          })
        });

        if (!response.ok) throw new Error('Failed to connect');

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        if (!reader) throw new Error('No reader');

        let assistantContent = "";
        let suggestions: string[] = [];
        setMessages(prev => [...prev, { role: 'assistant', content: '', suggestions: [] }]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6).trim();
              if (dataStr === '[DONE]') continue;
              try {
                const data = JSON.parse(dataStr);
                if (data.error) throw new Error(data.error);
                if (data.text) {
                  assistantContent += data.text;
                  setMessages(prev => {
                    const newMessages = [...prev];
                    const lastMessage = newMessages[newMessages.length - 1];
                    let displayContent = assistantContent;
                    const suggestionMatch = displayContent.match(/\[SUGGESTIONS:\s*(.*?)\]/);
                    if (suggestionMatch) {
                      suggestions = suggestionMatch[1].split(',').map((s: string) => s.trim());
                      displayContent = displayContent.replace(/\[SUGGESTIONS:\s*.*?\]/, '').trim();
                    }
                    lastMessage.content = displayContent;
                    lastMessage.suggestions = suggestions;
                    return newMessages;
                  });
                }
              } catch (e) { console.warn("Stream parse error:", e); }
            }
          }
        }
      } catch (error: any) {
        setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${error.message || "Something went wrong."}` }]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-accent text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all z-50"
        title="Chat with Anjani's AI Assistant"
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
            className="fixed bottom-24 right-4 w-[92vw] md:w-[480px] h-[600px] bg-white rounded-3xl shadow-2xl border border-border flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-accent px-5 py-4 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center font-bold">AP</div>
                <div>
                  <h3 className="font-bold text-lg leading-none mb-1">Anjani's Assistant</h3>
                  <p className="text-xs text-white/60">Ask about my work, writing & MetMov</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-grow overflow-y-auto px-4 py-4 space-y-4 bg-slate-50/50">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-2.5 max-w-full ${m.role === 'user' ? 'flex-row-reverse ml-4' : 'flex-row mr-4'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${m.role === 'user' ? 'bg-accent text-white' : 'bg-white border border-border text-accent'}`}>
                      {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-accent text-white rounded-tr-none chat-user-message' : 'bg-white border border-border text-accent-light rounded-tl-none shadow-sm'}`}>
                      <div className={`max-w-none markdown-body ${m.role === 'user' ? '!text-white' : ''}`}>
                        <Markdown 
                          remarkPlugins={[remarkBreaks]}
                          components={{
                            p: ({ children }) => <p className="mb-2.5 last:mb-0">{children}</p>,
                            ul: ({ children }) => <ul className="list-none p-0 m-0 mb-2.5 last:mb-0 space-y-1.5">{children}</ul>,
                            li: ({ children }) => (
                              <li className="flex gap-2 items-start mb-2 last:mb-0">
                                <span className="flex-shrink-0 font-bold text-accent">-</span>
                                <div className="flex-grow">{children}</div>
                              </li>
                            )
                          }}
                        >
                          {m.content}
                        </Markdown>
                      </div>
                      
                      {m.suggestions && m.suggestions.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-border/50 flex flex-wrap gap-2">
                          {m.suggestions.map((s, si) => (
                            <button
                              key={si}
                              onClick={() => {
                                if (s.toLowerCase().includes('book a call')) {
                                  window.open(FIT_CALL_URL, '_blank');
                                } else if (s.toLowerCase().includes('read his writing') || s.toLowerCase().includes('read writing')) {
                                  window.location.href = '/writing';
                                } else {
                                  handleSend(undefined, s);
                                }
                              }}
                              className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 bg-accent/5 border border-accent/10 rounded-full text-accent hover:bg-accent hover:text-white transition-all"
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      )}
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
            <div className="px-4 py-3 border-t border-border bg-white flex gap-2 overflow-x-auto custom-scrollbar pb-4">
              <button
                onClick={() => handleSend(undefined, "What does Anjani write about?")}
                className="whitespace-nowrap px-4 py-2 bg-muted rounded-full text-[10px] font-bold uppercase tracking-widest text-accent/60 hover:bg-accent hover:text-white transition-all border border-transparent hover:border-accent/20"
              >
                What does Anjani write about?
              </button>
              <button
                onClick={() => handleSend(undefined, "What is MetMov and the Operating Spine?")}
                className="whitespace-nowrap px-4 py-2 bg-muted rounded-full text-[10px] font-bold uppercase tracking-widest text-accent/60 hover:bg-accent hover:text-white transition-all border border-transparent hover:border-accent/20"
              >
                What is MetMov?
              </button>
              <button
                onClick={() => handleSend(undefined, "Tell me about Anjani's background")}
                className="whitespace-nowrap px-4 py-2 bg-muted rounded-full text-[10px] font-bold uppercase tracking-widest text-accent/60 hover:bg-accent hover:text-white transition-all border border-transparent hover:border-accent/20"
              >
                Anjani's Background
              </button>
              <button
                onClick={() => window.location.href = '/writing'}
                className="whitespace-nowrap px-4 py-2 bg-accent/10 border border-accent/20 rounded-full text-[10px] font-bold uppercase tracking-widest text-accent hover:bg-accent hover:text-white transition-all flex items-center gap-1"
              >
                Read Writing <ArrowRight size={10} />
              </button>
              <a href={FIT_CALL_URL} target="_blank" rel="noopener noreferrer" className="whitespace-nowrap px-4 py-2 bg-accent/10 border border-accent/20 rounded-full text-[10px] font-bold uppercase tracking-widest text-accent hover:bg-accent hover:text-white transition-all flex items-center gap-1">
                Book a Call <ArrowRight size={10} />
              </a>
            </div>

            {/* Lead Capture Gate */}
            {showLeadGate && (
              <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 flex items-center justify-center p-6">
                <div className="text-center max-w-xs">
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare size={20} className="text-accent" />
                  </div>
                  <h4 className="font-bold text-lg mb-2">You're asking great questions.</h4>
                  <p className="text-sm text-accent-light mb-6">Drop your email to continue the conversation and stay in the loop on Anjani's writing and work.</p>
                  <form onSubmit={(e) => { e.preventDefault(); handleLeadSubmit(); }} className="space-y-3">
                    <input
                      type="email"
                      value={leadEmail}
                      onChange={(e) => setLeadEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 bg-muted border border-border rounded-xl outline-none focus:border-accent transition-all text-sm text-center"
                      autoFocus
                    />
                    <button
                      type="submit"
                      disabled={!leadEmail.trim()}
                      className="w-full py-3 bg-accent text-white rounded-xl font-bold text-sm hover:bg-accent/90 transition-all disabled:opacity-40"
                    >
                      Continue Conversation
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLeadSubmit(true)}
                      className="text-xs text-accent/40 hover:text-accent/60 transition-colors"
                    >
                      Skip for now
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Input */}
            <form onSubmit={handleSend} className="px-4 py-3 bg-white border-t border-border">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  className="w-full pl-4 pr-12 py-3 bg-muted border border-border rounded-xl outline-none focus:border-accent transition-all text-sm"
                  disabled={isLoading || showLeadGate}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading || showLeadGate}
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
