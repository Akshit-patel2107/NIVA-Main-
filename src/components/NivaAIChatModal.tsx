import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Trash2,
  X,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  ToggleLeft,
  ToggleRight,
  Info,
  Clock,
  HeartHandshake,
} from 'lucide-react';
import { AIConversationMessage, CycleStats, DailyLog, MenstrualPhase } from '../types';

interface NivaAIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  cycleDay: number;
  cycleLength: number;
  phase: MenstrualPhase;
  todayLog?: DailyLog;
  stats: CycleStats;
  chatHistory: AIConversationMessage[];
  onSaveChatHistory: (history: AIConversationMessage[]) => void;
  onClearChatHistory: () => void;
  allowCycleContext: boolean;
  onToggleCycleContext: (allowed: boolean) => void;
}

// EXACT PROMPTS SPECIFIED BY THE USER
const USER_PROMPT_SUGGESTIONS = [
  'Why am I feeling tired today?',
  'What can help with period cramps?',
  'Explain my current cycle phase',
  'Show me patterns in my symptoms',
  'Give me general wellness suggestions.',
];

export const NivaAIChatModal: React.FC<NivaAIChatModalProps> = ({
  isOpen,
  onClose,
  cycleDay,
  cycleLength,
  phase,
  todayLog,
  stats,
  chatHistory,
  onSaveChatHistory,
  onClearChatHistory,
  allowCycleContext,
  onToggleCycleContext,
}) => {
  const [question, setQuestion] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, chatHistory, loading]);

  if (!isOpen) return null;

  const handleSend = async (overrideQuestion?: string) => {
    const q = overrideQuestion || question;
    if (!q.trim() || loading) return;

    const userMessage: AIConversationMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: q.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      cycleContextIncluded: allowCycleContext,
    };

    const newHistory = [...chatHistory, userMessage];
    onSaveChatHistory(newHistory);
    if (!overrideQuestion) setQuestion('');
    setLoading(true);

    try {
      const payload: any = {
        question: q.trim(),
        messages: newHistory.slice(-4),
      };

      if (allowCycleContext) {
        payload.cycleContext = {
          cycleDay,
          cycleLength,
          phase,
          flow: todayLog?.flow || 'None',
          crampsLevel: todayLog?.crampsLevel || 0,
          mood: todayLog?.mood || 'Balanced',
          symptoms: todayLog?.symptoms || [],
          water: todayLog?.waterGlasses || 6,
          sleep: todayLog?.sleepHours || 7.5,
        };
      }

      const res = await fetch('/api/ask-niva', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.answer) {
        const nivaMsg: AIConversationMessage = {
          id: `niva-${Date.now()}`,
          role: 'niva',
          content: data.answer,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        onSaveChatHistory([...newHistory, nivaMsg]);
      } else {
        throw new Error(data.message || 'Unable to receive response');
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      // High-quality supportive response if network fluctuates
      let fallbackText = `Thank you for sharing with NIVA. On Day ${cycleDay} in your ${phase} phase, keeping your body warm and supported with steady hydration is foundational.`;

      if (q.toLowerCase().includes('tired')) {
        fallbackText = `Fatigue can be tied to hormone transitions (like the drop in estrogen/progesterone before your period, or the metabolic energy burn in your luteal phase). Ensure you are hydrating, resting with magnesium-rich foods (seeds, leafy greens), and giving yourself permission to slow down. If exhaustion is severe or unyielding, consult a doctor to check iron/ferritin levels.`;
      } else if (q.toLowerCase().includes('cramp')) {
        fallbackText = `For menstrual cramps, evidence-based relief includes: (1) Local heat therapy (warm pack on abdomen/lower back), (2) Ginger root or chamomile tea to ease prostaglandins, and (3) Gentle pelvic mobility or child's pose. If cramps are debilitating or not relieved by over-the-counter care, please seek clinical evaluation for conditions like endometriosis.`;
      } else if (q.toLowerCase().includes('phase')) {
        fallbackText = `You are currently in your ${phase} phase (Day ${cycleDay} of ${cycleLength}). In this phase, your hormonal baseline dictates specific metabolic and energy shifts. Honor your current biorhythm with aligned movement and nutrient-dense meals.`;
      } else if (q.toLowerCase().includes('pattern')) {
        fallbackText = `Based on your voluntary logs, your symptoms correlate with your cycle transitions. Tracking consistently over 2-3 cycles helps illuminate exact windows when headaches or bloating arise, allowing proactive self-care.`;
      }

      const fallbackMsg: AIConversationMessage = {
        id: `niva-${Date.now()}`,
        role: 'niva',
        content: `${fallbackText}\n\nReminder: NIVA AI provides general wellness information and is not a doctor or diagnostic system. Please consult a qualified healthcare professional for medical symptoms or concerns.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      onSaveChatHistory([...newHistory, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-chat-title"
      className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in"
    >
      <div className="bg-white w-full max-w-2xl h-[90vh] sm:h-[84vh] rounded-3xl border border-stone-200/90 shadow-2xl flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-stone-100 bg-stone-50 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 via-rose-500 to-purple-600 text-white flex items-center justify-center shadow-sm shadow-rose-200">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 id="ai-chat-title" className="text-base font-bold text-stone-900">
                  NIVA AI Companion
                </h3>
                <span className="text-[10px] bg-purple-100 text-purple-900 border border-purple-200 font-semibold px-2 py-0.5 rounded-full">
                  Wellness Guide
                </span>
              </div>
              <p className="text-xs text-stone-500 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Empowering, science-grounded cycle insights</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => setShowClearConfirm(true)}
              title="Clear AI Conversation History"
              aria-label="Clear chat history"
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Clear Confirmation Sub-Bar */}
        {showClearConfirm && (
          <div className="p-3 bg-rose-50 border-b border-rose-200 flex items-center justify-between text-xs text-rose-900">
            <span>Clear your AI conversation history?</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  onClearChatHistory();
                  setShowClearConfirm(false);
                }}
                className="px-2.5 py-1 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700"
              >
                Yes, Clear
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-2.5 py-1 bg-white border border-rose-200 text-stone-600 rounded-lg hover:bg-stone-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* MEDICAL DISCLAIMER BANNER */}
        <div className="p-2.5 bg-amber-50/70 border-b border-amber-200/80 px-4 text-[11px] text-amber-900 flex items-start space-x-2 shrink-0">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-snug">
            <strong>Medical Disclaimer:</strong> NIVA AI provides general wellness information and is not a doctor or diagnostic system. If you experience severe, persistent, or concerning symptoms, please seek professional medical care.
          </p>
        </div>

        {/* Context Personalization Toggle Bar */}
        <div className="px-4 py-2 bg-stone-50/80 border-b border-stone-100 flex items-center justify-between text-xs text-stone-600 shrink-0">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
            <span>
              Personalize with my cycle context (Day {cycleDay}, {phase})
            </span>
          </div>
          <button
            onClick={() => onToggleCycleContext(!allowCycleContext)}
            className="flex items-center space-x-1 font-semibold text-purple-700 hover:text-purple-900 transition-colors"
          >
            {allowCycleContext ? (
              <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Context ON</span>
              </span>
            ) : (
              <span className="text-xs text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
                Context OFF
              </span>
            )}
          </button>
        </div>

        {/* Chat History & Suggested Prompt Chips */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Quick Suggested Prompt Chips (Prominently visible) */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block">
              Suggested questions to ask:
            </span>
            <div className="flex flex-wrap gap-2">
              {USER_PROMPT_SUGGESTIONS.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(item)}
                  disabled={loading}
                  className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 text-xs font-medium transition-all text-left shadow-2xs hover:scale-[1.01]"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-stone-100 my-2" />

          {/* Conversation Messages */}
          {chatHistory.length === 0 ? (
            <div className="p-6 text-center text-stone-400 space-y-2">
              <Sparkles className="w-8 h-8 mx-auto text-purple-400 animate-pulse" />
              <p className="text-xs font-medium text-stone-600">
                Ask NIVA anything about your symptoms, cycle shifts, foods, or emotional rhythms.
              </p>
              <p className="text-[11px] text-stone-400">
                Your queries are private and securely stored in your personal account.
              </p>
            </div>
          ) : (
            chatHistory.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[78%] rounded-3xl p-4 text-xs sm:text-sm leading-relaxed shadow-2xs ${
                      isUser
                        ? 'bg-rose-600 text-white rounded-br-xs'
                        : 'bg-stone-50 border border-stone-200 text-stone-800 rounded-bl-xs'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.content}</p>
                  </div>
                  <span className="text-[10px] text-stone-400 mt-1 px-1">
                    {msg.time}
                  </span>
                </div>
              );
            })
          )}

          {loading && (
            <div className="flex items-start space-x-2">
              <div className="bg-stone-100 p-4 rounded-3xl rounded-bl-xs text-xs text-stone-500 flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce delay-150" />
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce delay-300" />
                <span className="text-xs ml-1">NIVA AI is formulating your wellness guidance...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-stone-100 bg-white shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask NIVA about symptoms, sleep, cycle phase, or wellness..."
              disabled={loading}
              className="flex-1 text-xs sm:text-sm p-3.5 rounded-2xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-rose-500 font-medium text-stone-900 transition-all"
            />
            <button
              type="submit"
              disabled={!question.trim() || loading}
              className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-700 hover:to-purple-700 text-white disabled:opacity-40 transition-all shrink-0 shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
