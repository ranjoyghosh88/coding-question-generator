import { useEffect, useState } from 'react';

type Lang = 'javascript'|'typescript'|'python'|'java';

type Solution = {
  id: string;
  title: string;
  code: string;
  approach: string;
  timeComplexity: string;
  spaceComplexity: string;
  runnable?: boolean;
  runnerInput?: any;
};

type Item = {
  id: string;
  language: Lang;
  title: string;
  prompt: string;
  solutions: Solution[];
  tags: string[];
  createdAt: string;
};

const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4010';

export default function Home(){
  const [language, setLanguage] = useState<Lang>('javascript');
  const [count, setCount] = useState<number>(1);
  const [current, setCurrent] = useState<Item|null>(null);
  const [batch, setBatch] = useState<Item[]|null>(null);
  const [history, setHistory] = useState<Item[]>(() => {
    if (typeof window === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem('history') || '[]'); } catch { return []; }
  });
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState<string|null>(null);
  const [runOutputs, setRunOutputs] = useState<Record<string,string>>({});

  useEffect(() => {
    localStorage.setItem('history', JSON.stringify(history));
  }, [history]);

  async function generate(){
    setLoading(true);
    try {
      const r = await fetch(`${API}/generate`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ language, count })
      });
      const data = await r.json();

      if (Array.isArray(data.items)) {
        setBatch(data.items);
        setCurrent(data.items[0]);
        setHistory(prev => [...data.items, ...prev].slice(0, 200));
      } else {
        setBatch(null);
        setCurrent(data);
        setHistory(prev => [data, ...prev].slice(0, 200));
      }
    } finally {
      setLoading(false);
    }
  }

  async function runSolution(sol: Solution){
    if (!sol.runnable) return;
    setRunning(sol.id);
    try {
      const r = await fetch(`${API}/run`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ code: sol.code, language, runnerInput: sol.runnerInput })
      });
      const out = await r.json();
      setRunOutputs(prev => ({ ...prev, [sol.id]: JSON.stringify(out, null, 2) }));
    } catch (e){
      setRunOutputs(prev => ({ ...prev, [sol.id]: String(e) }));
    } finally {
      setRunning(null);
    }
  }

  const langs: Lang[] = ['javascript','typescript','python','java'];

  return (
    <main style={{maxWidth: 1200, margin:'24px auto', fontFamily:'Inter, system-ui, sans-serif'}}>
      <h1>Coding Sample Generator</h1>
      <p>Pick a language, set how many to generate, then run JavaScript or TypeScript answers.</p>

      <div style={{display:'flex', gap:12, alignItems:'center', margin:'12px 0'}}>
        <label>Language:
          <select value={language} onChange={e => setLanguage(e.target.value as Lang)} style={{ marginLeft: 8 }}>
            {langs.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </label>
        <label>Count:
          <input
            type="number"
            min={1}
            max={20}
            value={count}
            onChange={e => setCount(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
            style={{ width: 70, marginLeft: 8 }}
          />
        </label>
        <button onClick={generate} disabled={loading}>{loading ? 'Generating…' : 'Generate'}</button>
        <button onClick={generate} disabled={loading}>Refresh</button>
      </div>

      {current && (
        <section style={{marginTop: 16}}>
          <h2 style={{marginBottom: 4}}>{current.title}</h2>
          <div style={{color:'#555'}}>{current.prompt}</div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginTop: 12}}>
            {current.solutions.map(s => (
              <article key={s.id} style={{border:'1px solid #ddd', borderRadius: 8, padding: 12}}>
                <h3 style={{margin:'0 0 6px'}}>{s.title}</h3>
                <div><strong>Approach:</strong> {s.approach}</div>
                <div><strong>Time Complexity:</strong> {s.timeComplexity} | <strong>Space Complexity:</strong> {s.spaceComplexity}</div>
                <pre style={{background:'#f7f7f7', padding:12, overflowX:'auto', marginTop: 8}}><code>{s.code}</code></pre>
                {s.runnable && (language === 'javascript' || language === 'typescript') && (
                  <div style={{display:'flex', gap: 8}}>
                    <button onClick={() => runSolution(s)} disabled={running===s.id}>{running===s.id ? 'Running…' : 'Run'}</button>
                    <small>Input: {JSON.stringify(s.runnerInput)}</small>
                  </div>
                )}
                {runOutputs[s.id] && (
                  <pre style={{background:'#eef9ee', padding:12, marginTop:8, whiteSpace:'pre-wrap'}}>{runOutputs[s.id]}</pre>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {batch && batch.length > 1 && (
        <section style={{marginTop: 16}}>
          <h2>Generated items</h2>
          <div style={{display:'grid', gap:8}}>
            {batch.map(it => (
              <div
                key={it.id}
                style={{border:'1px solid #eee', borderRadius:6, padding:8, cursor:'pointer'}}
                onClick={() => setCurrent(it)}
              >
                <strong>{it.title}</strong> <em>({it.language})</em>
                <div style={{color:'#666'}}>{it.prompt}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section style={{marginTop: 24}}>
        <h2>History</h2>
        <div style={{display:'grid', gap: 8}}>
          {history.map(h => (
            <div key={h.id} style={{border:'1px solid #eee', borderRadius: 6, padding: 8}}>
              <div style={{display:'flex', justifyContent:'space-between'}}>
                <div>
                  <strong>{h.title}</strong> <em>({h.language})</em>
                </div>
                <button onClick={() => setCurrent(h)}>View</button>
              </div>
              <small>{new Date(h.createdAt).toLocaleString()}</small>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
