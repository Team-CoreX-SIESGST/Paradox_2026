'use client';
import { useState, useRef, useEffect } from "react";
import { Send, Flame } from "lucide-react";
import { AppSidebar } from "@/components/SIdebar";

const suggestedPrompts = [
  "What are my KYC obligations for digital lending?",
  "Show me all circulars about cybersecurity",
  "What changed in the 2024 Digital Lending update?",
  "Am I compliant with the latest NBFC regulations?",
];

const mockResponses = {
  default: {
    content:
      "Based on the latest RBI circulars, here's what you need to know:\n\nThe Reserve Bank of India has issued several key updates relevant to your query. The most recent circular¹ outlines enhanced requirements for regulated entities, with specific obligations around documentation, reporting timelines, and compliance verification.\n\nKey requirements include:\n• Updated KYC verification for all digital lending partners\n• Mandatory disclosure of Annual Percentage Rate (APR)\n• Grievance redressal mechanism within 30 days\n• Data localization requirements for all lending platforms\n\nI recommend reviewing the full circular for department-specific obligations. Would you like me to generate compliance tasks from these requirements?",
    citations: [
      { ref: "RBI/2024-25/48", title: "Guidelines on Digital Lending by Commercial Banks" },
    ],
  },
};

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (text) => {
    if (!text.trim()) return;
    const userMsg = { id: Date.now(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsStreaming(true);

    setTimeout(() => {
      const resp = mockResponses.default;
      const aiMsg = {
        id: Date.now() + 1,
        role: "ai",
        content: resp.content,
        citations: resp.citations,
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsStreaming(false);
    }, 1500);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Sidebar */}
      <AppSidebar />

      {/* Main content — flex column to stack header / messages / input */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-border-subtle px-6 py-4 flex-shrink-0">
          <h1 className="text-lg font-semibold text-foreground">Compliance Chat</h1>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-3xl mx-auto">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[60vh]">
                <Flame className="h-8 w-8 text-crail mb-4" />
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Ask anything about RBI compliance
                </h2>
                <p className="text-sm text-cloudy mb-8">
                  Get instant, cited answers from regulatory documents
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-xl">
                  {suggestedPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => sendMessage(prompt)}
                      className="border border-border-subtle rounded-xl px-4 py-3 text-sm text-foreground bg-background hover:bg-pampas transition-colors duration-150 text-left"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((msg) => (
                  <div key={msg.id}>
                    {msg.role === "user" ? (
                      <div className="flex justify-end">
                        <div className="bg-pampas rounded-2xl px-4 py-3 max-w-xl text-sm text-foreground">
                          {msg.content}
                        </div>
                      </div>
                    ) : (
                      <div className="max-w-2xl">
                        <div className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                          {msg.content}
                        </div>
                        {msg.citations && msg.citations.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {msg.citations.map((cit, i) => (
                              <div
                                key={i}
                                className="bg-pampas border border-border-subtle rounded-lg p-3 text-xs text-cloudy"
                              >
                                <span className="font-medium text-crail mr-2">
                                  [{i + 1}]
                                </span>
                                {cit.ref} — {cit.title}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {isStreaming && (
                  <div className="flex items-center gap-1 max-w-2xl">
                    <span className="h-2 w-2 rounded-full bg-crail animate-pulse" />
                    <span className="h-2 w-2 rounded-full bg-crail animate-pulse [animation-delay:0.2s]" />
                    <span className="h-2 w-2 rounded-full bg-crail animate-pulse [animation-delay:0.4s]" />
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            )}
          </div>
        </div>

        {/* Input — pinned to bottom */}
        <div className="border-t border-border-subtle px-6 py-4 bg-background flex-shrink-0">
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                placeholder="Ask about RBI regulations..."
                className="w-full bg-pampas border border-border-subtle rounded-xl px-4 py-3 pr-12 text-sm text-foreground placeholder:text-cloudy focus:outline-none focus:ring-1 focus:ring-crail"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim()}
                className={
                  "absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 transition-colors duration-150 " +
                  (input.trim()
                    ? "bg-crail text-white hover:bg-[#A8502F]"
                    : "bg-border-subtle text-cloudy cursor-not-allowed")
                }
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-cloudy text-center mt-2">
              RegIntel may make mistakes. Always verify with source circulars.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}