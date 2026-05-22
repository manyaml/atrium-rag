// Playground view — chat + optional pipeline + optional retrieval panels
// Wired to the real POST /api/query backend.

const { useState: useSP, useMemo: useMP, useRef: useRP } = React;

function PlaygroundView({ domain, domains, cfg, setCfg, showRetrieval, showConfig }) {
  const [messages, setMessages] = useSP([]);
  const [sources, setSources] = useSP([]);
  const [retrievalOpen, setRetrievalOpen] = useSP(true);
  const [sending, setSending] = useSP(false);
  const [conversationId, setConversationId] = useSP(null);
  const chatEndRef = useRP(null);

  const domainObj = domains.find(d => d.id === domain);

  const suggestions = useMP(() => {
    return [
      'What documents are in this knowledge base?',
      'Summarise the key topics covered.',
      'What are the most important policies?',
    ];
  }, [domain]);

  // Normalise a search result from the backend into the source shape the UI expects
  function normSource(sr, idx) {
    return {
      title: sr.source ? sr.source.split('/').pop() : `doc-${idx + 1}`,
      path: sr.source || '',
      score: sr.score,
      excerpt: sr.content ? sr.content.slice(0, 220) + (sr.content.length > 220 ? '…' : '') : '',
    };
  }

  const handleSend = async (text) => {
    if (sending) return;

    const userMsg = { role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
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

      const aiMsg = {
        role: 'ai',
        text: data.answer,
        model: cfg.model,
        temperature: cfg.temperature,
        latency_ms: data.latency_ms,
        citations: [],
      };
      setMessages(prev => [...prev, aiMsg]);
      setSources((data.search_results || []).map(normSource));

      // Scroll to bottom
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    } catch (err) {
      const errMsg = {
        role: 'ai',
        text: `Error: ${err.message}. Check that the backend is running and the domain is configured.`,
        model: cfg.model,
        temperature: cfg.temperature,
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setSending(false);
    }
  };

  let cls = 'workspace';
  if (showRetrieval && showConfig) cls += ' with-retrieval';
  if (!showConfig && !showRetrieval) cls += ' no-config';

  return (
    <>
      <Topbar
        title="Playground"
        crumbs={[domainObj?.name || domain]}
        right={
          <div className="hstack">
            <span className="badge"><span className="dot" />live</span>
            <button className="btn btn-sm" onClick={() => { setMessages([]); setSources([]); setConversationId(null); }}>
              <Icon.Refresh size={12} /> Clear
            </button>
            <button className="btn btn-sm btn-primary" onClick={() => window.location.hash = 'compare'}>
              <Icon.Split size={12} /> Compare
            </button>
          </div>
        }
      />
      <div className="content">
        <div className={cls}>
          {showConfig && (
            <div className="scrollable side-config">
              <PipelinePanel cfg={cfg} setCfg={setCfg} compact />
            </div>
          )}

          <div className="chat-panel">
            {messages.length === 0 && !sending && (
              <AgenticHero
                domainId={domain}
                domainName={domainObj?.name}
                onSelect={(q) => handleSend(q)}
              />
            )}
            {messages.length > 0 && (
              <div className="chat-scroll scrollable">
                <div className="chat">
                  {messages.map((m, i) => (
                    <Message key={i} msg={m} index={Math.floor(i / 2) + 1} />
                  ))}
                  {sending && (
                    <div className="msg">
                      <div className="msg-avatar ai">AI</div>
                      <div className="msg-body">
                        <div className="msg-meta"><span className="author">Pipeline</span><span className="mono text-faint">· thinking…</span></div>
                        <div className="msg-text text-muted">Retrieving and generating…</div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              </div>
            )}
            <Composer onSend={handleSend} suggestions={[]} disabled={sending} />
          </div>

          {showRetrieval && (
            <div className="scrollable side-retrieval">
              <RetrievalPanel
                sources={sources.slice(0, cfg.retrievalK)}
                open={retrievalOpen}
                onToggle={() => setRetrievalOpen(!retrievalOpen)}
              />

              <div className="panel" style={{marginTop: 14}}>
                <div className="panel-header">
                  <div className="panel-title">Run summary</div>
                </div>
                <div className="panel-body text-sm">
                  <div className="vstack" style={{gap: 6}}>
                    <div className="hstack" style={{justifyContent: 'space-between'}}>
                      <span className="text-muted">Model</span>
                      <span className="mono">{cfg.model}</span>
                    </div>
                    <div className="hstack" style={{justifyContent: 'space-between'}}>
                      <span className="text-muted">Temperature</span>
                      <span className="mono">{cfg.temperature.toFixed(2)}</span>
                    </div>
                    <div className="hstack" style={{justifyContent: 'space-between'}}>
                      <span className="text-muted">Retrieval k</span>
                      <span className="mono">{cfg.retrievalK}</span>
                    </div>
                    <div className="hstack" style={{justifyContent: 'space-between'}}>
                      <span className="text-muted">Turns</span>
                      <span className="mono">{Math.floor(messages.length / 2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

window.PlaygroundView = PlaygroundView;
