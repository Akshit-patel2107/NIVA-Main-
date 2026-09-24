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

const SAMPLE_QUESTIONS = [
  'Why do I feel more fatigued 3 days before my period?',
  'What foods naturally reduce prostaglandins and cramps?',
  'How do estrogen and progesterone affect my sleep quality?',
  'Is spotting between cycles something I should discuss with a doctor?',
  'What types of workouts harmonize best with my current phase?',
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
      const fallbackMsg: AIConversationMessage = {
        id: `niva-${Date.now()}`,
        role: 'niva',
        content: `I am currently drawing upon evidence-based clinical cycle knowledge. For ${q.toLowerCase().includes('cramp') ? 'menstrual cramps' : 'general cycle wellness'}, staying warm, hydrating with electrolyte-rich water, applying local heat therapy, and tracking symptom onset in your NIVA calendar are effective first steps. If symptoms ever escalate suddenly or interfere severely with daily activities, consult a qualified healthcare provider.\n\nReminder: NIVA AI provides general wellness information and does not replace professional medical advice.`,
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
      aria-labelledby="niva-ai-title"
      className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in"
    >
      <div className="bg-white w-full max-w-2xl h-[90vh] max-h-[780px] rounded-3xl border border-rose-100 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-300">
              <Sparkles className="w-5 h-5 text-rose-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 id="niva-ai-title" className="font-bold text-base sm:text-lg">
                  NIVA AI Companion
                </h3>
                <span className="text-[10px] bg-rose-500/30 text-rose-200 border border-rose-400/30 px-2 py-0.5 rounded-full font-medium">
                  Private & Supportive
                </span>
              </div>
              <p className="text-xs text-stone-300">
                Empathetic menstrual guidance & cycle science
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowClearConfirm(true)}
              title="Delete conversation history"
              aria-label="Clear chat history"
              className="p-2 rounded-xl text-stone-400 hover:text-rose-300 hover:bg-stone-800 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Medical & Privacy Banner */}
        <div className="bg-rose-50/90 border-b border-rose-100 px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs shrink-0">
          <div className="flex items-center space-x-2 text-rose-900">
            <ShieldCheck className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="leading-tight">
              Educational companion only. Not a medical diagnostic tool.
            </span>
          </div>

          {/* Privacy Toggle: Share Cycle Info with AI */}
          <button
            onClick={() => onToggleCycleContext(!allowCycleContext)}
            className="flex items-center space-x-1.5 text-stone-600 hover:text-stone-900 transition-colors self-start sm:self-auto"
            title="When active, NIVA AI considers your current cycle day and logged symptoms to personalize guidance."
          >
            <span className="text-[11px] font-medium">
              Cycle Context ({allowCycleContext ? 'On: Day ' + cycleDay : 'Off'}):
            </span>
            {allowCycleContext ? (
              <ToggleRight className="w-5 h-5 text-rose-600" />
            ) : (
              <ToggleLeft className="w-5 h-5 text-stone-400" />
            )}
          </button>
        </div>

        {/* Clear History Confirmation Banner */}
        {showClearConfirm && (
          <div className="bg-amber-50 border-b border-amber-200 p-3 flex items-center justify-between text-xs text-amber-900 shrink-0 animate-fade-in">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Are you sure you want to permanently delete your AI chat history?</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  onClearChatHistory();
                  setShowClearConfirm(false);
                }}
                className="px-2.5 py-1 bg-rose-600 text-white font-semibold rounded-lg hover:bg-rose-700 transition-colors"
              >
                Yes, delete
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-2.5 py-1 bg-white border border-stone-200 text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {chatHistory.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-stone-800 text-sm">
                How can NIVA AI support you today?
              </h4>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Ask about hormonal changes, cramp easing, foods for your phase, or when to seek professional care.
              </p>
            </div>
          ) : (
            chatHistory.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-rose-600 text-white rounded-br-xs shadow-xs'
                      : 'bg-stone-50 border border-stone-200/80 text-stone-800 rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
                <span className="text-[10px] text-stone-400 mt-1 px-1">
                  {msg.role === 'user' ? 'You' : 'NIVA AI'} • {msg.time}
                </span>
              </div>
            ))
          )}

          {loading && (
            <div className="flex items-start space-x-2">
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3.5 text-xs text-stone-500 flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span>NIVA AI is analyzing evidence-based wellness guidelines...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Recommended Sample Questions */}
        <div className="px-4 py-2 border-t border-stone-100 bg-stone-50/50 flex items-center space-x-2 overflow-x-auto no-scrollbar shrink-0">
          <span className="text-[11px] font-semibold text-stone-400 shrink-0">
            Suggested:
          </span>
          {SAMPLE_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-[11px] bg-white border border-stone-200 hover:border-rose-300 text-stone-600 px-3 py-1 rounded-full whitespace-nowrap transition-colors shadow-2xs hover:text-rose-700"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-stone-200 bg-white shrink-0">
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
              placeholder="Ask NIVA AI about symptoms, cycle phases, nutrition, sleep..."
              className="flex-1 text-xs sm:text-sm px-4 py-3 rounded-2xl border border-stone-200 bg-stone-50 text-stone-900 placeholder:text-stone-400 focus:outline-rose-500 transition-all"
            />
            <button
              type="submit"
              disabled={!question.trim() || loading}
              aria-label="Send message"
              className="p-3 rounded-2xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white font-semibold shadow-xs transition-colors shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
