import { j as jsxRuntimeExports, M as Markdown } from "./vendor-markdown-Dof7IDnT.js";
import { a as reactExports } from "./vendor-helmet-DS8WrVva.js";
import { c as createLucideIcon, X, M as MessageSquare, A as AnimatePresence, m as motion, U as User, r as remarkBreaks, F as FIT_CALL_URL, L as LoaderCircle, a as ArrowRight, S as Send } from "../entry-static.js";
import "node:process";
import "node:path";
import "node:url";
import "./vendor-react-CrxkMkwo.js";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "./vendor-motion-CR0Dl-z6.js";
import "./guidesData-sCapSEqy.js";
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M12 8V4H8", key: "hb8ula" }],
  ["rect", { width: "16", height: "12", x: "4", y: "8", rx: "2", key: "enze0r" }],
  ["path", { d: "M2 14h2", key: "vft8re" }],
  ["path", { d: "M20 14h2", key: "4cs60a" }],
  ["path", { d: "M15 13v2", key: "1xurst" }],
  ["path", { d: "M9 13v2", key: "rq6x2g" }]
];
const Bot = createLucideIcon("bot", __iconNode);
function ChatAssistant() {
  const [isOpen, setIsOpen] = reactExports.useState(false);
  const [messages, setMessages] = reactExports.useState([
    {
      role: "assistant",
      content: "Hi! I'm Anjani's AI assistant.\n\nAsk me about his work in operations and business structure, what he's writing about, or how MetMov helps founder-led businesses scale.",
      suggestions: ["What does Anjani write about?", "What is MetMov?", "How does the Operating Spine work?"]
    }
  ]);
  const [input, setInput] = reactExports.useState("");
  const [isLoading, setIsLoading] = reactExports.useState(false);
  const [userTurnCount, setUserTurnCount] = reactExports.useState(0);
  const [leadEmail, setLeadEmail] = reactExports.useState("");
  const [leadCaptured, setLeadCaptured] = reactExports.useState(false);
  const [showLeadGate, setShowLeadGate] = reactExports.useState(false);
  const [pendingMessage, setPendingMessage] = reactExports.useState("");
  const messagesEndRef = reactExports.useRef(null);
  const scrollToBottom = () => {
    var _a;
    (_a = messagesEndRef.current) == null ? void 0 : _a.scrollIntoView({ behavior: "smooth" });
  };
  reactExports.useEffect(() => {
    scrollToBottom();
  }, [messages]);
  const handleSend = async (e, overrideMessage) => {
    var _a;
    if (e) e.preventDefault();
    const messageToSend = overrideMessage || input;
    if (!messageToSend.trim() || isLoading) return;
    const userMessage = messageToSend.trim();
    if (!overrideMessage) setInput("");
    const newTurnCount = userTurnCount + 1;
    setUserTurnCount(newTurnCount);
    if (newTurnCount >= 3 && !leadCaptured) {
      setPendingMessage(userMessage);
      setShowLeadGate(true);
      return;
    }
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          history: messages.map((m) => ({ role: m.role, content: m.content }))
        })
      });
      if (!response.ok) {
        throw new Error("Failed to connect to the assistant");
      }
      const reader = (_a = response.body) == null ? void 0 : _a.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No reader available");
      let assistantContent = "";
      let suggestions = [];
      setMessages((prev) => [...prev, { role: "assistant", content: "", suggestions: [] }]);
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.slice(6).trim();
            if (dataStr === "[DONE]") continue;
            try {
              const data = JSON.parse(dataStr);
              if (data.error) throw new Error(data.error);
              if (data.text) {
                assistantContent += data.text;
                setMessages((prev) => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  let displayContent = assistantContent;
                  const suggestionMatch = displayContent.match(/\[SUGGESTIONS:\s*(.*?)\]/);
                  if (suggestionMatch) {
                    suggestions = suggestionMatch[1].split(",").map((s) => s.trim());
                    displayContent = displayContent.replace(/\[SUGGESTIONS:\s*.*?\]/, "").trim();
                  }
                  lastMessage.content = displayContent;
                  lastMessage.suggestions = suggestions;
                  return newMessages;
                });
              }
            } catch (e2) {
              console.warn("Error parsing stream chunk:", e2);
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: `Error: ${error.message || "I encountered an unexpected issue. Please try again."}`
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  const handleLeadSubmit = async (skip = false) => {
    var _a;
    if (!skip && leadEmail.trim()) {
      try {
        await fetch("/api/chatbot-lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: leadEmail.trim(), query: pendingMessage })
        });
      } catch (err) {
        console.warn("Lead capture failed:", err);
      }
    }
    setLeadCaptured(true);
    setShowLeadGate(false);
    if (pendingMessage) {
      setMessages((prev) => [...prev, { role: "user", content: pendingMessage }]);
      setIsLoading(true);
      setPendingMessage("");
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: pendingMessage,
            history: messages.map((m) => ({ role: m.role, content: m.content }))
          })
        });
        if (!response.ok) throw new Error("Failed to connect");
        const reader = (_a = response.body) == null ? void 0 : _a.getReader();
        const decoder = new TextDecoder();
        if (!reader) throw new Error("No reader");
        let assistantContent = "";
        let suggestions = [];
        setMessages((prev) => [...prev, { role: "assistant", content: "", suggestions: [] }]);
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const dataStr = line.slice(6).trim();
              if (dataStr === "[DONE]") continue;
              try {
                const data = JSON.parse(dataStr);
                if (data.error) throw new Error(data.error);
                if (data.text) {
                  assistantContent += data.text;
                  setMessages((prev) => {
                    const newMessages = [...prev];
                    const lastMessage = newMessages[newMessages.length - 1];
                    let displayContent = assistantContent;
                    const suggestionMatch = displayContent.match(/\[SUGGESTIONS:\s*(.*?)\]/);
                    if (suggestionMatch) {
                      suggestions = suggestionMatch[1].split(",").map((s) => s.trim());
                      displayContent = displayContent.replace(/\[SUGGESTIONS:\s*.*?\]/, "").trim();
                    }
                    lastMessage.content = displayContent;
                    lastMessage.suggestions = suggestions;
                    return newMessages;
                  });
                }
              } catch (e) {
                console.warn("Stream parse error:", e);
              }
            }
          }
        }
      } catch (error) {
        setMessages((prev) => [...prev, { role: "assistant", content: `Error: ${error.message || "Something went wrong."}` }]);
      } finally {
        setIsLoading(false);
      }
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: () => setIsOpen(!isOpen),
        className: "fixed bottom-8 right-8 w-14 h-14 bg-accent text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all z-50",
        title: "Chat with Anjani's AI Assistant",
        children: isOpen ? /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 24 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { size: 24 })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: isOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: 20, scale: 0.95 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 20, scale: 0.95 },
        className: "fixed bottom-24 right-4 w-[92vw] md:w-[480px] h-[600px] bg-white rounded-3xl shadow-2xl border border-border flex flex-col z-50 overflow-hidden",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-accent px-5 py-4 text-white", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center font-bold", children: "AP" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-lg leading-none mb-1", children: "Anjani's Assistant" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-white/60", children: "Ask about my work, writing & MetMov" })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-grow overflow-y-auto px-4 py-4 space-y-4 bg-slate-50/50", children: [
            messages.map((m, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `flex ${m.role === "user" ? "justify-end" : "justify-start"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex gap-2.5 max-w-full ${m.role === "user" ? "flex-row-reverse ml-4" : "flex-row mr-4"}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${m.role === "user" ? "bg-accent text-white" : "bg-white border border-border text-accent"}`, children: m.role === "user" ? /* @__PURE__ */ jsxRuntimeExports.jsx(User, { size: 16 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Bot, { size: 16 }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `p-4 rounded-2xl text-sm leading-relaxed ${m.role === "user" ? "bg-accent text-white rounded-tr-none chat-user-message" : "bg-white border border-border text-accent-light rounded-tl-none shadow-sm"}`, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `max-w-none markdown-body ${m.role === "user" ? "!text-white" : ""}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Markdown,
                  {
                    remarkPlugins: [remarkBreaks],
                    components: {
                      p: ({ children }) => /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-2.5 last:mb-0", children }),
                      ul: ({ children }) => /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "list-none p-0 m-0 mb-2.5 last:mb-0 space-y-1.5", children }),
                      li: ({ children }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex gap-2 items-start mb-2 last:mb-0", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-shrink-0 font-bold text-accent", children: "-" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-grow", children })
                      ] })
                    },
                    children: m.content
                  }
                ) }),
                m.suggestions && m.suggestions.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 pt-4 border-t border-border/50 flex flex-wrap gap-2", children: m.suggestions.map((s, si) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => {
                      if (s.toLowerCase().includes("book a call")) {
                        window.open(FIT_CALL_URL, "_blank");
                      } else if (s.toLowerCase().includes("read his writing") || s.toLowerCase().includes("read writing")) {
                        window.location.href = "/writing";
                      } else {
                        handleSend(void 0, s);
                      }
                    },
                    className: "text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 bg-accent/5 border border-accent/10 rounded-full text-accent hover:bg-accent hover:text-white transition-all",
                    children: s
                  },
                  si
                )) })
              ] })
            ] }) }, i)),
            isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-start", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-full bg-white border border-border text-accent flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Bot, { size: 16 }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white border border-border p-4 rounded-2xl rounded-tl-none shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 16, className: "animate-spin text-accent/40" }) })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: messagesEndRef })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-3 border-t border-border bg-white flex gap-2 overflow-x-auto custom-scrollbar pb-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => handleSend(void 0, "What does Anjani write about?"),
                className: "whitespace-nowrap px-4 py-2 bg-muted rounded-full text-[10px] font-bold uppercase tracking-widest text-accent/60 hover:bg-accent hover:text-white transition-all border border-transparent hover:border-accent/20",
                children: "What does Anjani write about?"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => handleSend(void 0, "What is MetMov and the Operating Spine?"),
                className: "whitespace-nowrap px-4 py-2 bg-muted rounded-full text-[10px] font-bold uppercase tracking-widest text-accent/60 hover:bg-accent hover:text-white transition-all border border-transparent hover:border-accent/20",
                children: "What is MetMov?"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => handleSend(void 0, "Tell me about Anjani's background"),
                className: "whitespace-nowrap px-4 py-2 bg-muted rounded-full text-[10px] font-bold uppercase tracking-widest text-accent/60 hover:bg-accent hover:text-white transition-all border border-transparent hover:border-accent/20",
                children: "Anjani's Background"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => window.location.href = "/writing",
                className: "whitespace-nowrap px-4 py-2 bg-accent/10 border border-accent/20 rounded-full text-[10px] font-bold uppercase tracking-widest text-accent hover:bg-accent hover:text-white transition-all flex items-center gap-1",
                children: [
                  "Read Writing ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { size: 10 })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: FIT_CALL_URL, target: "_blank", rel: "noopener noreferrer", className: "whitespace-nowrap px-4 py-2 bg-accent/10 border border-accent/20 rounded-full text-[10px] font-bold uppercase tracking-widest text-accent hover:bg-accent hover:text-white transition-all flex items-center gap-1", children: [
              "Book a Call ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { size: 10 })
            ] })
          ] }),
          showLeadGate && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-white/95 backdrop-blur-sm z-10 flex items-center justify-center p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center max-w-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { size: 20, className: "text-accent" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-bold text-lg mb-2", children: "You're asking great questions." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-accent-light mb-6", children: "Drop your email to continue the conversation and stay in the loop on Anjani's writing and work." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: (e) => {
              e.preventDefault();
              handleLeadSubmit();
            }, className: "space-y-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "email",
                  value: leadEmail,
                  onChange: (e) => setLeadEmail(e.target.value),
                  placeholder: "your@email.com",
                  className: "w-full px-4 py-3 bg-muted border border-border rounded-xl outline-none focus:border-accent transition-all text-sm text-center",
                  autoFocus: true
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "submit",
                  disabled: !leadEmail.trim(),
                  className: "w-full py-3 bg-accent text-white rounded-xl font-bold text-sm hover:bg-accent/90 transition-all disabled:opacity-40",
                  children: "Continue Conversation"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: () => handleLeadSubmit(true),
                  className: "text-xs text-accent/40 hover:text-accent/60 transition-colors",
                  children: "Skip for now"
                }
              )
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("form", { onSubmit: handleSend, className: "px-4 py-3 bg-white border-t border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                value: input,
                onChange: (e) => setInput(e.target.value),
                placeholder: "Ask me anything...",
                className: "w-full pl-4 pr-12 py-3 bg-muted border border-border rounded-xl outline-none focus:border-accent transition-all text-sm",
                disabled: isLoading || showLeadGate
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "submit",
                disabled: !input.trim() || isLoading || showLeadGate,
                className: "absolute right-2 top-1/2 -translate-y-1/2 p-2 text-accent hover:text-accent-light disabled:opacity-30 transition-all",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { size: 20 })
              }
            )
          ] }) })
        ]
      }
    ) })
  ] });
}
export {
  ChatAssistant as default
};
