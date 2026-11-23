import React, { useState } from 'react';
import { api } from '../services/api';
import { X, Send, MessageSquareQuote, Sparkles, BookOpen, Bot, User } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  sender: 'user' | 'assistant';
  text: string;
  sourceLabs?: string[];
  relevantTopics?: string[];
}

export const AskLabLinkDrawer: React.FC<Props> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'assistant',
      text: 'Hi there! I am **Ask LabLink**, your campus laboratory knowledge guide.\n\nAsk me anything about laboratory locations, available equipment (like 3D printers or oscilloscopes), eligibility, permissions, or how our 10-minute queue rules work.'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const suggestedQueries = [
    'Which lab has a 3D printer?',
    'Where is the Robotics lab located?',
    'Can a first-year student use the Electronics lab?',
    'Where do I find my college registration number?',
    'How does the 10-minute token rule work?'
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = { sender: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.askAssistant(textToSend);
      const botMsg: Message = {
        sender: 'assistant',
        text: response.answer,
        sourceLabs: response.sourceLabs,
        relevantTopics: response.relevantTopics
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { sender: 'assistant', text: 'Error connecting to the assistant service. Please check your connection.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-xs transition-opacity">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between bg-emerald-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-gray-900 text-sm flex items-center">
                <span>Ask LabLink</span>
                <span className="ml-1.5 px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] font-semibold rounded-md">
                  Grounded AI
                </span>
              </div>
              <p className="text-[11px] text-gray-500">Instant answers backed by official lab configurations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-start space-x-2 ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}
              <div
                className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-gray-100 text-gray-800 rounded-tl-none border border-gray-200'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>
                {msg.relevantTopics && (
                  <div className="mt-2 pt-2 border-t border-gray-200/50 flex flex-wrap gap-1">
                    {msg.relevantTopics.map((topic, i) => (
                      <span key={i} className="px-1.5 py-0.5 bg-white/80 rounded text-[10px] font-medium text-gray-600">
                        #{topic}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {msg.sender === 'user' && (
                <div className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-2 text-gray-400 text-xs italic p-2">
              <Bot className="w-4 h-4 text-emerald-600 animate-pulse" />
              <span>Checking laboratory database...</span>
            </div>
          )}
        </div>

        {/* Suggested Queries Chips */}
        <div className="px-4 py-2 bg-gray-50/80 border-t border-gray-100">
          <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5 flex items-center">
            <Sparkles className="w-3 h-3 mr-1 text-emerald-600" /> Suggested Queries
          </div>
          <div className="flex flex-wrap gap-1">
            {suggestedQueries.map((q, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSend(q)}
                className="px-2 py-1 bg-white border border-gray-200 hover:border-emerald-400 rounded-md text-[11px] text-gray-700 hover:text-emerald-700 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-gray-200 bg-white">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              placeholder="Ask about labs, equipment, eligibility..."
              value={input}
              onChange={e => setInput(e.target.value)}
              className="flex-1 p-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-40 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
