// Query — clean conversational chat with no config panel
const { useState: useQS, useRef: useQR, useMemo: useQM } = React;

function QueryView({ domain, domains }) {
  const [messages, setMessages] = useQS([]);
  const [sending, setSending] = useQS(false);
  const [conversationId, setConversationId] = useQS(null);
  const [copied, setCopied] = useQS(false);
  const chatEndRef = useQR(null);

  const domainObj = domains.find(d => d.id === domain);
  const turns = Math.floor(messages.length / 2);

  const suggestions = useQM(() => [
    'Give me a summary of the key topics.',
    'What are the most recent updates?',
    'Explain the main policies in plain language.',
  ], [domain]);

  const clearConversation = () => {
    setMessages([]);
    setConversationId(null);
  };

  const exportConversation = () => {
    if (messages.length === 0) return;
    const text = messages.map(m =>
      `${m.role === 'user' ? 'You' : 'AI'}: ${m.text}`
    ).join('\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `query-${domain}-${Date.now()}.txt`;
    a.click();
  };

  const copyAll = () => {
    const text = messages.map(m =>
      `${m.role === 'user' ? 'You' : 'AI'}: ${m.text}`
    ).join('\n\n');
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleSend = async (text) => {
    if (sending) return;
    setMessages(prev => [...prev, { role: 'user', text }]);
    setSending(true);

    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: text,
          domain,
          use_history: conversationId !== null,
          metadata: {},
          conversation_id: conversationId,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
        throw new Error(err.detail || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setConversationId(data.conversation_id);
      setMessages(prev => [...prev, {
        role: 'ai',
        text: data.answer,
        latency_ms: data.latency_ms,
        sources: (data.search_results || []).length,
      }]);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'ai',
        text: `Error: ${err.message}`,
        error: true,
      }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Topbar
        title="Query"
        crumbs={[domainObj?.name || domain]}
        right={
          <div className="hstack">
            {turns > 0 && (
              <span className="badge">
                <span className="dot" />{turns} turn{turns !== 1 ? 's' : ''}
              </span>
            )}
            {messages.length > 0 && (
              <>
                <button className="btn btn-sm" onClick={copyAll} title="Copy full conversation">
                  <Icon.Copy size={12} /> {copied ? 'Copied!' : 'Copy all'}
                </button>
                <button className="btn btn-sm" onClick={exportConversation} title="Download as text">
                  <Icon.Send size={12} /> Export
                </button>
                <button className="btn btn-sm" onClick={clearConversation}>
                  <Icon.Refresh size={12} /> New
                </button>
              </>
            )}
          </div>
        }
      />

      <div className="content">
        <div className="workspace no-config">
          <div className="chat-panel" style={{ maxWidth: 720, margin: '0 auto', width: '100%' }}>
            <div className="chat-scroll scrollable">
              <div className="chat">
                {messages.length === 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 20px 24px', gap: 16 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: '50%',
                      background: 'var(--accent-tint)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon.Chat size={20} />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div className="text-sm" style={{ fontWeight: 500, marginBottom: 4 }}>Start a conversation</div>
                      <div className="text-sm text-muted" style={{ maxWidth: 280, lineHeight: 1.6 }}>
                        Ask anything about the <strong>{domainObj?.name || domain}</strong> knowledge base. History is preserved across turns.
                      </div>
                    </div>
                    <div className="text-xs text-faint mono">⏎ to send · Shift+⏎ for newline</div>
                  </div>
                )}

                {messages.map((m, i) => (
                  <QueryMessage key={i} msg={m} index={Math.floor(i / 2) + 1} />
                ))}

                {sending && (
                  <div className="msg">
                    <div className="msg-avatar ai">AI</div>
                    <div className="msg-body">
                      <div className="msg-meta">
                        <span className="author">Assistant</span>
                        <span className="mono text-faint">· thinking…</span>
                      </div>
                      <div className="msg-text text-muted">Generating response…</div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            </div>

            <Composer onSend={handleSend} suggestions={suggestions} disabled={sending} />
          </div>
        </div>
      </div>
    </>
  );
}

function QueryMessage({ msg, index }) {
  const [copied, setCopied] = useQS(false);
  const ai = msg.role === 'ai';

  const copyText = () => {
    navigator.clipboard?.writeText(msg.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="msg">
      <div className={`msg-avatar ${ai ? 'ai' : ''}`}>{ai ? 'AI' : 'YO'}</div>
      <div className="msg-body">
        <div className="msg-meta">
          <span className="author">{ai ? 'Assistant' : 'You'}</span>
          {ai && msg.latency_ms && (
            <span className="mono text-faint">· {msg.latency_ms}ms</span>
          )}
          {ai && msg.sources > 0 && (
            <span className="mono text-faint">· {msg.sources} sources</span>
          )}
          {ai && <span className="mono text-faint">· #{index}</span>}
        </div>
        <div className={`msg-text ${msg.error ? 'text-muted' : ''}`}>
          {msg.text.split('\n').map((line, i) => <p key={i}>{line}</p>)}
        </div>
        {ai && !msg.error && (
          <div className="msg-actions">
            <button className="icon-btn" title={copied ? 'Copied!' : 'Copy'} onClick={copyText}>
              <Icon.Copy size={13} />
            </button>
            <button className="icon-btn" title="Open in Playground"
              onClick={() => { window.location.hash = 'playground'; }}>
              <Icon.Split size={13} />
            </button>
            <button className="icon-btn" title="Save">
              <Icon.Star size={13} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

window.QueryView = QueryView;
