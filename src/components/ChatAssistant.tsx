import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Sparkles, ChevronRight, User, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  actionUrl?: string;
  actionLabel?: string;
  timestamp: string;
}

export const ChatAssistant: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      sender: 'bot',
      text: '🌱 Hey traveler of good causes! Every meal counts. Would you like to donate food, find food, or learn about ShareBite?',
      timestamp: 'Now'
    }
  ]);

  const quickTopics = [
    { title: 'How ShareBite works', query: 'how it works' },
    { title: 'How to donate food', query: 'donate food' },
    { title: 'How to find food', query: 'find food' },
    { title: 'How to register as NGO', query: 'register ngo' },
    { title: 'How to become a volunteer', query: 'volunteer' },
    { title: 'Food safety guidelines', query: 'safety guidelines' },
    { title: 'See latest listings', query: 'view listings' },
    { title: 'Impact & statistics', query: 'impact' },
    { title: 'Contact information', query: 'contact' },
    { title: 'Account & login help', query: 'login help' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const generateBotResponse = (userQuery: string): { text: string; actionUrl?: string; actionLabel?: string } => {
    const q = userQuery.toLowerCase();

    if (q.includes('how it works') || q.includes('how sharebite works') || q.includes('process')) {
      return {
        text: 'ShareBite connects surplus food donors directly to verified NGOs and on-demand volunteers. 1) Donors post surplus food with shelf-life specs. 2) Our Smart Matching Engine pairs compatible shelters. 3) Couriers accept the mission, verify temperature/packaging, and deliver within the safe rescue window!',
        actionUrl: '/how-it-works',
        actionLabel: 'Learn More'
      };
    }

    if (q.includes('donate') || q.includes('how to donate')) {
      return {
        text: 'To donate surplus food: Sign in as a Food Donor (or click "+ Donate Surplus Food"), fill in batch quantity, category, temperature condition, and verify the 5-point food safety checklist. Our Rescue Priority Engine immediately flags matches for local shelters!',
        actionUrl: '/donor/donate',
        actionLabel: 'Donate Food Now'
      };
    }

    if (q.includes('find food') || q.includes('receive') || q.includes('ngo')) {
      return {
        text: 'Verified shelters, community kitchens, and NGOs can browse live listings or check recommendations in the NGO Dashboard. You can accept complete batches or request partial portions through multi-receiver splitting!',
        actionUrl: '/listings',
        actionLabel: 'Browse Food Listings'
      };
    }

    if (q.includes('register ngo') || q.includes('ngo register')) {
      return {
        text: 'Nonprofits and community organizations can register with organization details, daily meal distribution capacity, food category preferences, and service radius. We immediately route surplus matched to your capacity.',
        actionUrl: '/ngo-register',
        actionLabel: 'Register NGO'
      };
    }

    if (q.includes('volunteer') || q.includes('courier')) {
      return {
        text: 'Volunteer couriers are the heartbeat of ShareBite! Register with your vehicle type (bicycle, car, van) and availability. You can view nearby missions, track live pickup routes, and record digital proof of safe delivery.',
        actionUrl: '/volunteer-register',
        actionLabel: 'Sign Up as Volunteer'
      };
    }

    if (q.includes('safety') || q.includes('guidelines') || q.includes('hygiene')) {
      return {
        text: 'Food safety is paramount: 1) Food must be prepared hygienically within safe commercial standards. 2) Hot food maintained >60°C or rapid chill <4°C. 3) Clear allergen disclosures (gluten, dairy, nuts). 4) Clean, tamper-evident food containers. 5) Mandatory pre-transport condition check by volunteer.',
        actionUrl: '/about',
        actionLabel: 'Safety Details'
      };
    }

    if (q.includes('listing') || q.includes('surplus') || q.includes('available')) {
      return {
        text: 'Check our live Food Listings page to see all active donations with remaining countdown timers, servings, temperature conditions, and distance.',
        actionUrl: '/listings',
        actionLabel: 'View Active Listings'
      };
    }

    if (q.includes('impact') || q.includes('stats') || q.includes('metric')) {
      return {
        text: 'To date, our network has rescued over 1,280 meals, diverted 940 kg of food waste, and prevented 2,350 kg of CO2e emissions across 26 verified shelters. Check the live analytics breakdown!',
        actionUrl: '/impact',
        actionLabel: 'View Impact Dashboard'
      };
    }

    if (q.includes('contact') || q.includes('support') || q.includes('phone')) {
      return {
        text: 'Need assistance or have partnerships in mind? Visit our Contact page to reach the ShareBite coordination team directly.',
        actionUrl: '/contact',
        actionLabel: 'Contact Team'
      };
    }

    if (q.includes('login') || q.includes('account') || q.includes('demo')) {
      return {
        text: 'You can test any role instantly using our 1-click Demo Accounts: Donor (Green Leaf), NGO (Hope Foundation), Volunteer (Arjun Patel), or Admin. Or use the "Launch Demo" button on top!',
        actionUrl: '/login',
        actionLabel: 'Go to Login'
      };
    }

    return {
      text: `Thanks for your question regarding "${userQuery}". ShareBite connects surplus food donors with shelters and volunteer couriers in real time. Would you like to donate surplus food, explore listings, or check the interactive map?`,
      actionUrl: '/listings',
      actionLabel: 'Explore Listings'
    };
  };

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: 'Just now'
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');

    // Simulate smart bot typing response
    setTimeout(() => {
      const resp = generateBotResponse(query);
      const botMsg: ChatMessage = {
        id: 'bot-' + Date.now(),
        sender: 'bot',
        text: resp.text,
        actionUrl: resp.actionUrl,
        actionLabel: resp.actionLabel,
        timestamp: 'Just now'
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 450);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 right-5 z-40 flex items-center justify-center w-13 h-13 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl hover:shadow-2xl transition-all duration-200 group focus:outline-hidden cursor-pointer"
        aria-label="Open ShareBite Assistant"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <div className="relative flex items-center justify-center">
            <MessageSquare className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-emerald-700 animate-pulse" />
          </div>
        )}
      </button>

      {/* Chat Drawer Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-96 max-h-[560px] h-[520px] z-50 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="p-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-sm font-bold leading-tight font-display">ShareBite Assistant</h4>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-100">
                  <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                  <span>Always ready to help</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Help Topics Bar */}
          <div className="p-2 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-100 dark:border-slate-800 overflow-x-auto whitespace-nowrap text-xs flex gap-1.5 scrollbar-none">
            {quickTopics.slice(0, 4).map((topic) => (
              <button
                key={topic.title}
                onClick={() => handleSendMessage(topic.query)}
                className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-700 shrink-0 font-medium transition-colors"
              >
                {topic.title}
              </button>
            ))}
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[82%] p-3 rounded-2xl ${
                    msg.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-xs leading-relaxed shadow-xs'
                  }`}
                >
                  <p>{msg.text}</p>
                  {msg.actionUrl && (
                    <button
                      onClick={() => {
                        navigate(msg.actionUrl!);
                        setIsOpen(false);
                      }}
                      className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 text-white rounded-md font-semibold text-[11px] hover:bg-emerald-500 transition-colors shadow-xs cursor-pointer"
                    >
                      <span>{msg.actionLabel || 'View'}</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick FAQ Expandable Grid */}
          <div className="px-3 py-2 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-100 dark:border-slate-800">
            <details className="text-[11px] text-slate-500 group">
              <summary className="cursor-pointer font-semibold hover:text-emerald-600 list-none flex items-center justify-between">
                <span>Browse more quick topics</span>
                <ChevronRight className="w-3.5 h-3.5 group-open:rotate-90 transition-transform" />
              </summary>
              <div className="grid grid-cols-2 gap-1 mt-2 max-h-24 overflow-y-auto">
                {quickTopics.slice(4).map((topic) => (
                  <button
                    key={topic.title}
                    onClick={() => handleSendMessage(topic.query)}
                    className="text-left px-2 py-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-emerald-600 text-[10px] truncate"
                  >
                    {topic.title}
                  </button>
                ))}
              </div>
            </details>
          </div>

          {/* Input Area */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-2.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about donating, finding food, safety..."
              className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 focus:outline-hidden transition-all"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
