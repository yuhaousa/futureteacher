import { useState, useEffect, useRef } from 'react';
import { BookOpen, Lightbulb, Search, Send, Bot, User } from 'lucide-react';
import api from '../api/client';
import ReactMarkdown from 'react-markdown';

const suggestions = [
  { icon: BookOpen, text: 'Suggest courses to improve my formative assessment skills' },
  { icon: Lightbulb, text: 'What are best practices for differentiated instruction?' },
  { icon: Search, text: 'Find resources about inquiry-based learning in Science' },
];

export default function AIAssistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg) return;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setLoading(true);
    try {
      const res = await api.post('/ai/chat', { message: userMsg });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1a2035', margin: 0 }}>AI Assistant</h1>
        <p style={{ color: '#7a8294', marginTop: 6 }}>Your intelligent learning companion for professional development</p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', marginBottom: 16 }}>
        {messages.length === 0 ? (
          <div>
            <div style={{ textAlign: 'center', padding: '20px 0 32px' }}>
              <div style={{ width: 64, height: 64, background: '#f0eeff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Bot size={32} color="#6c63ff" />
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1a2035', margin: '0 0 8px' }}>How can I help you today?</h2>
              <p style={{ color: '#7a8294', fontSize: 14 }}>Ask me anything about teaching, courses, or professional development</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {suggestions.map(({ icon: Icon, text }) => (
                <button key={text} onClick={() => sendMessage(text)}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', background: '#f8f9fc', border: '1px solid #e8eaf0', borderRadius: 12, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f0eeff'}
                  onMouseLeave={e => e.currentTarget.style.background = '#f8f9fc'}
                >
                  <Icon size={18} color="#6c63ff" />
                  <span style={{ fontSize: 14, color: '#3a4260' }}>{text}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: m.role === 'user' ? '#6c63ff' : '#f0eeff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {m.role === 'user' ? <User size={18} color="#fff" /> : <Bot size={18} color="#6c63ff" />}
                </div>
                <div style={{ maxWidth: '75%', background: m.role === 'user' ? '#6c63ff' : '#f8f9fc', color: m.role === 'user' ? '#fff' : '#1a2035', padding: '12px 16px', borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px', fontSize: 14, lineHeight: 1.6 }}>
                  {m.role === 'assistant' ? <ReactMarkdown>{m.content}</ReactMarkdown> : m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#f0eeff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot size={18} color="#6c63ff" />
                </div>
                <div style={{ background: '#f8f9fc', padding: '12px 16px', borderRadius: '16px 16px 16px 4px', display: 'flex', gap: 4, alignItems: 'center' }}>
                  {[0, 0.15, 0.3].map((d, i) => <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: '#9aa2b4', animation: `bounce 0.8s ${d}s infinite` }} />)}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <div style={{ background: '#fff', borderRadius: 12, padding: '12px 16px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', display: 'flex', gap: 12, alignItems: 'center' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="Ask a question or explore learning resources..."
          style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, color: '#1a2035' }}
        />
        <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
          style={{ background: '#6c63ff', color: '#fff', border: 'none', borderRadius: 8, width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: !input.trim() || loading ? 0.5 : 1 }}>
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
