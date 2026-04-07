import { useState } from "react";
import { Bot, Send, X as CloseIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../../components/ui/utils";

export const AIChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Xin chào! Tôi là trợ lý ảo MediCare+. Tôi có thể giúp gì cho bạn?' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { role: 'user', text: input }]);
    setInput('');
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', text: 'Cảm ơn bạn đã liên hệ. Chuyên viên của chúng tôi sẽ phản hồi trong giây lát!' }]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-24 left-4 md:bottom-8 md:left-8 z-[60] flex flex-col items-start gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-[calc(100vw-2rem)] md:w-80 h-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col origin-bottom-left"
          >
            <div className="bg-teal-600 p-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Bot size={20} />
                <span className="font-bold">Trợ lý MediCare+</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded">
                <CloseIcon size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {messages.map((m, i) => (
                <div key={i} className={cn("flex", m.role === 'user' ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[85%] p-3 rounded-2xl text-sm",
                    m.role === 'user' ? "bg-teal-600 text-white rounded-tr-none" : "bg-white text-slate-800 shadow-sm rounded-tl-none border border-slate-100"
                  )}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 bg-white border-t border-slate-200 flex gap-2">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Nhập tin nhắn..." 
                className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button onClick={handleSend} className="bg-teal-600 text-white p-2 rounded-full hover:bg-teal-700 transition-colors">
                <Send size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-teal-600 text-white rounded-full flex items-center justify-center shadow-xl cursor-pointer relative"
        aria-label="Chat with us"
      >
        <Bot size={28} />
        {!isOpen && (
          <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
        )}
      </motion.button>
    </div>
  );
};
