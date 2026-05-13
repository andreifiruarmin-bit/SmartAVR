import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, Bot, User, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Salut! Sunt asistentul tău financiar SmartAVR. Cum te pot ajuta astăzi cu portofoliul tău?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch('/.netlify/functions/gemini-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, { role: 'user', content: userMessage }] }),
      });

      if (!response.ok) throw new Error('Talk to API failed');
      const data = await response.json();
      
      setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Ne pare rău, a apărut o problemă în comunicarea cu inteligența artificială. Te rugăm să încerci mai târziu.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        whileHover={typeof window !== 'undefined' && window.innerWidth > 768 ? { scale: 1.05 } : undefined}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 md:bottom-8 right-6 z-50 w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-slate-900/40 md:hover:bg-slate-800 transition-all border border-slate-700"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Sparkles className="w-6 h-6 text-primary" />}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-40 md:bottom-28 right-6 z-50 w-full max-w-[380px] h-[500px] bg-white rounded-[2.5rem] shadow-2xl shadow-slate-900/20 border border-slate-100 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest leading-none">Smart AI</h3>
                  <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">Asistent Financiar Activ</p>
                </div>
              </div>
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
              {messages.map((m, i) => (
                <div key={i} className={cn("flex items-start gap-2", m.role === 'user' ? "flex-row-reverse" : "")}>
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                    m.role === 'assistant' ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-400"
                  )}>
                    {m.role === 'assistant' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  <div className={cn(
                    "max-w-[80%] p-3 rounded-2xl text-xs font-medium leading-relaxed",
                    m.role === 'assistant' ? "bg-slate-50 text-slate-700 rounded-tl-none border border-slate-100" : "bg-primary text-white rounded-tr-none shadow-md shadow-primary/20"
                  )}>
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl text-xs font-bold text-slate-400 animate-pulse uppercase tracking-widest">
                    Gândesc...
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-slate-100">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Întreabă-mă ceva despre economii..."
                  className="w-full bg-slate-50 border-none rounded-2xl pl-4 pr-12 py-3 text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center hover:bg-slate-800 transition-all shadow-lg"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
