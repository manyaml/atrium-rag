// Shared bits: Sidebar, Topbar, PipelinePanel, RetrievalPanel, Message, Composer

const { useState: useS1, useEffect: useE1, useRef: useR1 } = React;

function Sidebar({ active, onNavigate, domain, domains, onSwitchDomain }) {
  const items = [
    { id: 'playground', label: 'Playground', icon: Icon.Chat },
    { id: 'query',      label: 'Query',      icon: Icon.Send },
    { id: 'search',     label: 'Search',     icon: Icon.Search },
    { id: 'compare',    label: 'Compare',    icon: Icon.Split },
    { id: 'config',     label: 'Pipeline',   icon: Icon.Settings },
    { id: 'history',    label: 'History',    icon: Icon.History },
    { id: 'indexes',    label: 'Indexes',    icon: Icon.Book },
  ];
  const d = domains.find(x => x.id === domain);
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark" />
        <div>
          <div className="brand-name">Atrium</div>
          <div className="brand-sub">RAG Console</div>
        </div>
      </div>

      <nav className="nav">
        <div className="nav-label">Workspace</div>
        {items.map(it => (
          <button key={it.id}
            className={`nav-item ${active === it.id ? 'active' : ''}`}
            onClick={() => onNavigate(it.id)}
          >
            <span className="dot" />
            <span className="flex1">{it.label}</span>
            <it.icon size={13} />
          </button>
        ))}
      </nav>

      <div className="domain-card">
        <div className="domain-card-label">Current domain</div>
        <div className="domain-card-row">
          <div>
            <div className="domain-card-name">{d?.name || domain}</div>
            <div className="text-xs mono text-faint" style={{marginTop: 2}}>{d?.idx || d?.id || domain}</div>
          </div>
          <button className="domain-switch" onClick={onSwitchDomain}>switch</button>
        </div>
      </div>
    </aside>
  );
}

function Topbar({ title, crumbs = [], right }) {
  return (
    <header className="topbar">
      <h1>{title}</h1>
      {crumbs.length > 0 && (
        <div className="hstack crumb" style={{gap: 6}}>
          <span>·</span>
          {crumbs.map((c, i) => <span key={i}>{c}{i < crumbs.length - 1 ? ' / ' : ''}</span>)}
        </div>
      )}
      <div className="topbar-spacer" />
      {right}
    </header>
  );
}

// --- Pipeline parameter panel (inference params only — no embedding fields) ---
function PipelinePanel({ cfg, setCfg, title = 'Pipeline', compact = false }) {
  const update = (k, v) => setCfg({ ...cfg, [k]: v });

  return (
    <div className="panel">
      <div className="panel-header">
        <div className="panel-title">{title}</div>
        <button className="btn btn-sm btn-ghost" onClick={() => setCfg({ ...DEFAULT_CONFIG })}>
          <Icon.Refresh size={12} /> Reset
        </button>
      </div>
      <div className="panel-body param-group">
        <div className="field">
          <div className="field-label">Model</div>
          <div className="model-pick">
            {MODELS.map(m => (
              <button
                key={m.id}
                className={`model-option ${cfg.model === m.id ? 'active' : ''}`}
                onClick={() => update('model', m.id)}
              >
                <div className="hstack">
                  <span className="name">{m.name}</span>
                  <span className="provider">· {m.provider}</span>
                </div>
                <span className="provider">{m.ctx}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <div className="field-label">
            <span>Temperature</span>
            <span className="val">{cfg.temperature.toFixed(2)}</span>
          </div>
          <input className="range" type="range" min="0" max="1" step="0.05"
            value={cfg.temperature}
            onChange={(e) => update('temperature', parseFloat(e.target.value))} />
        </div>

        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12}}>
          <div className="field">
            <div className="field-label">
              <span>Top-p</span><span className="val">{cfg.topP.toFixed(2)}</span>
            </div>
            <input className="range" type="range" min="0" max="1" step="0.01"
              value={cfg.topP}
              onChange={(e) => update('topP', parseFloat(e.target.value))} />
          </div>
          <div className="field">
            <div className="field-label">
              <span>Top-k</span><span className="val">{cfg.topK}</span>
            </div>
            <input className="range" type="range" min="0" max="100" step="1"
              value={cfg.topK}
              onChange={(e) => update('topK', parseInt(e.target.value))} />
          </div>
        </div>

        <hr className="divider" style={{margin: 0}}/>

        <div className="field">
          <div className="field-label">
            <span>Retrieval k</span><span className="val">{cfg.retrievalK}</span>
          </div>
          <input className="range" type="range" min="1" max="20" step="1"
            value={cfg.retrievalK}
            onChange={(e) => update('retrievalK', parseInt(e.target.value))} />
        </div>

        <div className="field">
          <div className="field-label">
            <span>System prompt</span>
            <span className="mono text-faint">{cfg.systemPrompt.length} ch</span>
          </div>
          <textarea className="textarea" rows={compact ? 4 : 6}
            value={cfg.systemPrompt}
            onChange={(e) => update('systemPrompt', e.target.value)} />
        </div>
      </div>
    </div>
  );
}

// --- Retrieval / source panel ---
function RetrievalPanel({ sources, open, onToggle }) {
  return (
    <div className="panel">
      <div className="panel-header">
        <div className="panel-title">Retrieved chunks · {sources.length}</div>
        <button className="collapsible-toggle" onClick={onToggle}>
          <span className={`caret ${open ? 'open' : ''}`}><Icon.Caret size={10} /></span>
          {open ? 'hide' : 'show'}
        </button>
      </div>
      {open && (
        <div className="panel-body">
          <div className="source-list">
            {sources.length === 0 && (
              <div className="text-xs text-muted" style={{padding: '8px 0'}}>
                No chunks yet — send a question to see retrieved documents.
              </div>
            )}
            {sources.map((s, i) => (
              <div className="source" key={i}>
                <div className="source-head">
                  <div className="source-title">
                    <span className="mono text-faint" style={{marginRight: 6}}>[{i+1}]</span>
                    {s.title}
                  </div>
                  <div className="source-meta">{typeof s.score === 'number' ? s.score.toFixed(3) : s.score}</div>
                </div>
                {s.excerpt && <div className="source-excerpt">"{s.excerpt}"</div>}
                <div className="source-path">{s.path}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Message rendering ---
function renderWithCitations(text, onCite) {
  const parts = text.split(/(\[\d+\])/g);
  return parts.map((p, i) => {
    const m = p.match(/^\[(\d+)\]$/);
    if (m) return <span key={i} className="cite" onClick={() => onCite && onCite(parseInt(m[1]))}>{m[1]}</span>;
    const codeParts = p.split(/(`[^`]+`)/g);
    return codeParts.map((cp, j) => {
      if (cp.startsWith('`') && cp.endsWith('`'))
        return <code key={`${i}-${j}`} className="mono" style={{background: 'var(--paper-2)', padding: '1px 5px', borderRadius: 3, fontSize: '0.85em'}}>{cp.slice(1,-1)}</code>;
      return <span key={`${i}-${j}`}>{cp}</span>;
    });
  });
}

function Message({ msg, onCite, index }) {
  const ai = msg.role === 'ai';
  return (
    <div className="msg">
      <div className={`msg-avatar ${ai ? 'ai' : ''}`}>{ai ? 'AI' : 'YO'}</div>
      <div className="msg-body">
        <div className="msg-meta">
          <span className="author">{ai ? 'Pipeline' : 'You'}</span>
          {ai && msg.model && <span className="mono text-faint">· {msg.model} · t={typeof msg.temperature === 'number' ? msg.temperature.toFixed(2) : '0.30'}</span>}
          {ai && msg.latency_ms && <span className="mono text-faint">· {msg.latency_ms}ms</span>}
          {ai && <span className="mono text-faint">· run #{index}</span>}
        </div>
        <div className="msg-text">
          {msg.text.split('\n').map((line, i) => <p key={i}>{renderWithCitations(line, onCite)}</p>)}
        </div>
        {ai && (
          <div className="msg-actions">
            <button className="icon-btn" title="Copy" onClick={() => navigator.clipboard?.writeText(msg.text)}><Icon.Copy size={13} /></button>
            <button className="icon-btn" title="Compare"><Icon.Split size={13} /></button>
            <button className="icon-btn" title="Save"><Icon.Star size={13} /></button>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Composer ---
function Composer({ onSend, suggestions = [], disabled = false }) {
  const [val, setVal] = useS1('');
  const ref = useR1(null);
  const send = () => {
    if (!val.trim() || disabled) return;
    onSend(val);
    setVal('');
  };
  useE1(() => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = Math.min(ref.current.scrollHeight, 200) + 'px';
    }
  }, [val]);

  return (
    <div className="composer">
      <textarea
        ref={ref}
        placeholder="Ask a question of your knowledge base…"
        value={val}
        disabled={disabled}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
      />
      <div className="composer-row">
        <div className="composer-chips">
          {suggestions.map((s, i) => (
            <button key={i} className="chip" onClick={() => setVal(s)}>{s}</button>
          ))}
        </div>
        <div className="hstack">
          <span className="text-xs text-faint mono">⏎ to send</span>
          <button className="btn btn-accent btn-sm" onClick={send} disabled={disabled}>
            {disabled ? 'Sending…' : <><span>Send</span><Icon.Send size={11} /></>}
          </button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Sidebar, Topbar, PipelinePanel, RetrievalPanel, Message, Composer, renderWithCitations });
