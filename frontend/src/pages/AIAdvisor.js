import { useState, useRef, useEffect } from 'react';
import API from '../services/api';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import toast from 'react-hot-toast';

const QUICK_PROMPTS = [
  { label: '📊 Analyze my performance', msg: 'Analyze my academic performance and tell me where I stand.' },
  { label: '📚 Study plan suggestion', msg: 'Create a personalized study plan for me based on my weak subjects.' },
  { label: '⚠️ At-risk alert check', msg: 'Am I at risk academically? What should I focus on to improve?' },
  { label: '🎯 CGPA improvement tips', msg: 'Give me specific tips to improve my CGPA this semester.' },
  { label: '📅 Attendance impact', msg: 'How does my attendance affect my academic performance and what should I do?' },
];

export default function AIAdvisor() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "👋 Hi! I'm your **AI Study Advisor**, powered by Claude AI.\n\nI can analyze your academic data, suggest study strategies, predict risk, and give you personalized guidance.\n\nYou can ask me anything about your studies, or use one of the quick prompts below to get started!" }
  ]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState(null);
  const bottomRef = useRef(null);

  // Load student context
  useEffect(() => {
    const role = localStorage.getItem('role');
    const name = localStorage.getItem('userName');
    Promise.all([
      API.get('/results/my-results').catch(() => ({ data: { data: [] } })),
      API.get('/attendance/my-analytics').catch(() => ({ data: { data: {} } })),
    ]).then(([resultsRes, attRes]) => {
      setContext({
        name,
        role,
        results: resultsRes.data.data || [],
        attendance: attRes.data.data || {},
      });
    });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const buildSystemPrompt = () => {
    const role = localStorage.getItem('role');
    const name = localStorage.getItem('userName') || 'User';
    if (!context) return `You are an AI Study Advisor for ${name} in an academic management system called CampusIQ. Be helpful, encouraging, and data-driven.`;

    const results = context.results || [];
    const att     = context.attendance || {};

    const cgpaScore = results.length > 0
      ? (results.reduce((sum, r) => {
          const pct = ((r.marksObtained||0)/(r.maxMarks||100))*100;
          return sum + (pct>=90?10:pct>=80?9:pct>=70?8:pct>=60?7:pct>=50?6:pct>=40?5:0);
        }, 0) / results.length).toFixed(2)
      : '0';

    const weakSubjects = results.filter(r => ((r.marksObtained||0)/(r.maxMarks||100))*100 < 50).map(r => r.subjectName);
    const strongSubjects = results.filter(r => ((r.marksObtained||0)/(r.maxMarks||100))*100 >= 80).map(r => r.subjectName);

    return `You are an intelligent, empathetic AI Study Advisor for CampusIQ - a Student Grade Management System.

STUDENT PROFILE:
- Name: ${name}
- Role: ${role}
- CGPA: ${cgpaScore}
- Total Subjects: ${results.length}
- Attendance: ${att.percentage || 0}% (${att.presentClasses || 0} present / ${att.totalClasses || 0} total)
- Weak subjects (below 50%): ${weakSubjects.join(', ') || 'None'}
- Strong subjects (above 80%): ${strongSubjects.join(', ') || 'None'}
- Recent results: ${results.slice(0,5).map(r => `${r.subjectName}: ${r.marksObtained}/${r.maxMarks} (${r.grade})`).join('; ')}

INSTRUCTIONS:
1. Be warm, encouraging, and personalized - always use the student's name
2. Give specific, actionable advice based on their actual data
3. Highlight strengths before discussing weaknesses
4. If attendance is below 75%, flag this as urgent
5. If CGPA is below 5, provide serious academic intervention advice
6. Suggest realistic, week-by-week study plans when asked
7. Use emojis appropriately to make responses engaging
8. Keep responses concise but comprehensive
9. Never make up data - only use the data provided above
10. Be motivating and positive while being honest about challenges`;
  };

  const sendMessage = async (userMsg) => {
    if (!userMsg.trim() || loading) return;
    const userContent = userMsg.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userContent }]);
    setLoading(true);

    try {
      // Build conversation history for API
      const history = [...messages, { role: 'user', content: userContent }]
        .filter(m => m.role !== 'assistant' || messages.indexOf(m) > 0)
        .map(m => ({ role: m.role, content: m.content }));

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          system: buildSystemPrompt(),
          messages: history,
        }),
      });

      const data = await response.json();
      const reply = data.content?.[0]?.text || "I couldn't process that. Please try again.";
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      console.error('AI Advisor error:', err);
      toast.error('AI Advisor is temporarily unavailable');
      setMessages(prev => [...prev, { role: 'assistant', content: "⚠️ I'm having trouble connecting right now. Please try again in a moment." }]);
    } finally {
      setLoading(false);
    }
  };

  const formatMessage = (text) => {
    // Convert **bold** and line breaks to React elements
    return text.split('\n').map((line, i) => {
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <span key={i}>
          {parts.map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part)}
          {i < text.split('\n').length - 1 && <br />}
        </span>
      );
    });
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <Topbar />
        <div className="page-body" style={{ display:'flex', flexDirection:'column', height:'calc(100vh - 64px)', padding:0 }}>

          {/* Header */}
          <div style={{ padding:'24px 28px 16px', borderBottom:'1px solid var(--border-subtle)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:14 }}>
              <div style={{ width:46, height:46, borderRadius:12, background:'linear-gradient(135deg,#7c3aed,#3b82f6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem', boxShadow:'0 0 20px rgba(124,58,237,0.4)' }}>🤖</div>
              <div>
                <h1 style={{ margin:0, fontSize:'1.3rem', fontWeight:700 }}>AI Study Advisor</h1>
                <p style={{ margin:0, fontSize:'0.82rem', color:'var(--text-secondary)' }}>Powered by Claude AI • Personalized academic guidance</p>
              </div>
              <div style={{ marginLeft:'auto', padding:'5px 12px', borderRadius:20, background:'rgba(16,185,129,0.15)', border:'1px solid rgba(16,185,129,0.3)', fontSize:'0.75rem', color:'#10b981', fontWeight:600 }}>● Online</div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex:1, overflowY:'auto', padding:'20px 28px' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display:'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                marginBottom:16, gap:10, alignItems:'flex-start'
              }}>
                {msg.role === 'assistant' && (
                  <div style={{ width:34, height:34, borderRadius:10, background:'linear-gradient(135deg,#7c3aed,#3b82f6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem', flexShrink:0, boxShadow:'0 0 12px rgba(124,58,237,0.3)' }}>🤖</div>
                )}
                <div style={{
                  maxWidth:'72%', padding:'14px 18px', borderRadius: msg.role==='user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                  background: msg.role === 'user'
                    ? 'linear-gradient(135deg,rgba(59,130,246,0.35),rgba(37,99,235,0.25))'
                    : 'rgba(17,29,53,0.9)',
                  border: msg.role === 'user' ? '1px solid rgba(59,130,246,0.4)' : '1px solid rgba(255,255,255,0.07)',
                  fontSize:'0.9rem', lineHeight:1.65, color:'var(--text-primary)',
                  boxShadow: msg.role === 'assistant' ? '0 2px 12px rgba(0,0,0,0.3)' : 'none',
                }}>
                  {formatMessage(msg.content)}
                </div>
                {msg.role === 'user' && (
                  <div style={{ width:34, height:34, borderRadius:10, background:'linear-gradient(135deg,#3b82f6,#2563eb)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.85rem', fontWeight:700, flexShrink:0 }}>
                    {(localStorage.getItem('userName')||'U').slice(0,1).toUpperCase()}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div style={{ display:'flex', gap:10, alignItems:'flex-start', marginBottom:16 }}>
                <div style={{ width:34, height:34, borderRadius:10, background:'linear-gradient(135deg,#7c3aed,#3b82f6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem' }}>🤖</div>
                <div style={{ padding:'14px 18px', borderRadius:'4px 16px 16px 16px', background:'rgba(17,29,53,0.9)', border:'1px solid rgba(255,255,255,0.07)' }}>
                  <div style={{ display:'flex', gap:5, alignItems:'center' }}>
                    {[0,1,2].map(d => (
                      <div key={d} style={{ width:7, height:7, borderRadius:'50%', background:'var(--brand-400)', animation:`pulse 1.2s ease ${d*0.3}s infinite` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick Prompts */}
          <div style={{ padding:'12px 28px 0', display:'flex', gap:8, flexWrap:'wrap', borderTop:'1px solid var(--border-subtle)' }}>
            {QUICK_PROMPTS.map((p, i) => (
              <button key={i} onClick={() => sendMessage(p.msg)} disabled={loading}
                style={{ padding:'6px 14px', borderRadius:20, border:'1px solid var(--border-default)', background:'var(--bg-glass)',
                  color:'var(--text-secondary)', fontSize:'0.78rem', cursor:loading?'default':'pointer',
                  whiteSpace:'nowrap', transition:'all 0.15s', opacity:loading?0.5:1 }}
                onMouseEnter={e => { if(!loading) e.target.style.borderColor = 'rgba(59,130,246,0.5)'; e.target.style.color='white'; }}
                onMouseLeave={e => { e.target.style.borderColor='var(--border-default)'; e.target.style.color='var(--text-secondary)'; }}>
                {p.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <div style={{ padding:'14px 28px 20px', display:'flex', gap:10 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
              placeholder="Ask me anything about your studies, grades, attendance..."
              disabled={loading}
              style={{
                flex:1, padding:'13px 18px', borderRadius:12,
                border:'1px solid var(--border-default)', background:'var(--bg-elevated)',
                color:'var(--text-primary)', fontSize:'0.9rem', outline:'none',
                transition:'border-color 0.15s',
              }}
            />
            <button onClick={() => sendMessage(input)} disabled={loading || !input.trim()}
              style={{
                padding:'13px 22px', borderRadius:12, border:'none',
                background: loading || !input.trim() ? 'rgba(59,130,246,0.3)' : 'linear-gradient(135deg,#3b82f6,#2563eb)',
                color:'white', fontWeight:700, cursor: loading || !input.trim() ? 'default' : 'pointer',
                fontSize:'0.9rem', transition:'all 0.15s', flexShrink:0
              }}>
              {loading ? '…' : '➤ Send'}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100% { opacity:0.3; transform:scale(0.8); } 50% { opacity:1; transform:scale(1); } }
      `}</style>
    </div>
  );
}
