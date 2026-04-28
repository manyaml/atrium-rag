// Search — semantic document retrieval without generation
const { useState: useSS, useRef: useSR, useEffect: useSE } = React;

function SearchView({ domain, domains }) {
  const [query, setQuery] = useSS('');
  const [results, setResults] = useSS([]);
  const [searching, setSearching] = useSS(false);
  const [lastQuery, setLastQuery] = useSS('');
  const [latency, setLatency] = useSS(null);
  const [k, setK] = useSS(6);
  const [minScore, setMinScore] = useSS(0.0);
  const [sortBy, setSortBy] = useSS('score');
  const [hasSearched, setHasSearched] = useSS(false);
  const inputRef = useSR(null);

  const domainObj = domains.find(d => d.id === domain);

  useSE(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  const runSearch = async (q = query) => {
    if (!q.trim() || searching) return;
    setSearching(true);
    setHasSearched(true);
    setLastQuery(q);

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, domain, k, min_score: minScore }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
        throw new Error(err.detail || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setLatency(data.latency_ms);

      let sorted = [...(data.results || [])];
      if (sortBy === 'source') sorted.sort((a, b) => (a.source || '').localeCompare(b.source || ''));
      else sorted.sort((a, b) => b.score - a.score);

      setResults(sorted);
    } catch (err) {
      setResults([{ _error: err.message }]);
    } finally {
      setSearching(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') runSearch();
  };

  const sendToPlayground = (result) => {
    // Store the doc in sessionStorage so Playground can reference it
    sessionStorage.setItem('atrium.pinned', JSON.stringify(result));
    window.location.hash = 'playground';
  };

  const displayResults = sortBy === 'source'
    ? [...results].sort((a, b) => (a.source || '').localeCompare(b.source || ''))
    : results;

  return (
    <>
      <Topbar
        title="Search"
        crumbs={[domainObj?.name || domain]}
        right={
          <div className="hstack">
            {hasSearched && latency != null && (
              <span className="text-xs text-faint mono">{results.length} result{results.length !== 1 ? 's' : ''} · {latency}ms</span>
            )}
            <div className="hstack" style={{ gap: 4 }}>
              <span className="text-xs text-muted">Sort:</span>
              <button
                className={`btn btn-sm ${sortBy === 'score' ? 'btn-primary' : ''}`}
                onClick={() => setSortBy('score')}
              >Score</button>
              <button
                className={`btn btn-sm ${sortBy === 'source' ? 'btn-primary' : ''}`}
                onClick={() => setSortBy('source')}
              >Source</button>
            </div>
          </div>
        }
      />

      <div className="content">
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

          {/* Search bar */}
          <div style={{
            padding: '20px 24px 0',
            borderBottom: '1px solid var(--line)',
            background: 'var(--paper)',
          }}>
            <div style={{ maxWidth: 760, margin: '0 auto' }}>
              <div style={{
                display: 'flex', gap: 8, alignItems: 'center',
                background: 'var(--paper-2)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius)',
                padding: '6px 10px 6px 14px',
              }}>
                <Icon.Search size={15} style={{ color: 'var(--ink-3)', flexShrink: 0 }} />
                <input
                  ref={inputRef}
                  style={{
                    flex: 1, background: 'none', border: 'none', outline: 'none',
                    fontSize: 14, color: 'var(--ink)', fontFamily: 'var(--font-sans)',
                  }}
                  placeholder={`Search ${domainObj?.name || domain} knowledge base…`}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                {query && (
                  <button
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)', padding: 4 }}
                    onClick={() => { setQuery(''); inputRef.current?.focus(); }}
                  >✕</button>
                )}
                <button
                  className="btn btn-accent btn-sm"
                  onClick={() => runSearch()}
                  disabled={!query.trim() || searching}
                  style={{ flexShrink: 0 }}
                >
                  {searching ? 'Searching…' : <><Icon.Send size={11} /> Search</>}
                </button>
              </div>

              {/* Controls row */}
              <div className="hstack" style={{ gap: 20, padding: '12px 4px', flexWrap: 'wrap' }}>
                <div className="hstack" style={{ gap: 8 }}>
                  <span className="text-xs text-muted">Results k</span>
                  <input className="range" type="range" min="1" max="20" step="1"
                    value={k} onChange={e => setK(parseInt(e.target.value))}
                    style={{ width: 80 }} />
                  <span className="text-xs mono">{k}</span>
                </div>
                <div className="hstack" style={{ gap: 8 }}>
                  <span className="text-xs text-muted">Min score</span>
                  <input className="range" type="range" min="0" max="1" step="0.05"
                    value={minScore} onChange={e => setMinScore(parseFloat(e.target.value))}
                    style={{ width: 80 }} />
                  <span className="text-xs mono">{minScore.toFixed(2)}</span>
                </div>

                {/* Quick searches */}
                {!hasSearched && (
                  <div className="hstack" style={{ gap: 6, marginLeft: 'auto', flexWrap: 'wrap' }}>
                    {['key policies', 'recent changes', 'definitions'].map(s => (
                      <button key={s} className="chip" onClick={() => { setQuery(s); runSearch(s); }}>
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Results area */}
          <div className="scrollable" style={{ flex: 1, padding: '20px 24px' }}>
            <div style={{ maxWidth: 760, margin: '0 auto' }}>

              {!hasSearched && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px', gap: 16 }}>
                  <SearchIllustration />
                  <div className="text-sm text-muted" style={{ textAlign: 'center', maxWidth: 300, lineHeight: 1.6 }}>
                    Search retrieves semantically matched documents directly from the index — no generation, just raw retrieval scores.
                  </div>
                  <div className="text-xs text-faint mono">⏎ to search</div>
                </div>
              )}

              {hasSearched && searching && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} style={{
                      height: 110, borderRadius: 'var(--radius)',
                      background: 'var(--paper-2)', border: '1px solid var(--line)',
                      opacity: 0.5 + i * 0.15,
                      animation: 'illu-blink 1.4s ease-in-out infinite',
                    }} />
                  ))}
                </div>
              )}

              {hasSearched && !searching && results.length === 0 && (
                <div style={{ textAlign: 'center', padding: '48px 20px' }}>
                  <div className="text-sm text-muted">No documents matched "{lastQuery}" with score ≥ {minScore.toFixed(2)}.</div>
                  <div className="text-xs text-faint" style={{ marginTop: 8 }}>Try lowering the minimum score or broadening the query.</div>
                </div>
              )}

              {!searching && displayResults.filter(r => !r._error).map((result, i) => (
                <SearchResultCard
                  key={i}
                  result={result}
                  rank={i + 1}
                  query={lastQuery}
                  onSendToPlayground={() => sendToPlayground(result)}
                />
              ))}

              {!searching && results.find(r => r._error) && (
                <div className="text-sm" style={{ color: 'var(--red, #c0392b)', padding: '12px 0' }}>
                  Error: {results.find(r => r._error)._error}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function SearchResultCard({ result, rank, query, onSendToPlayground }) {
  const [expanded, setExpanded] = useSS(false);
  const [copied, setCopied] = useSS(false);

  const filename = result.source ? result.source.split('/').pop() : `doc-${rank}`;
  const score = typeof result.score === 'number' ? result.score : 0;
  const scoreColor = score >= 0.85 ? 'var(--accent)' : score >= 0.7 ? 'var(--ink-2)' : 'var(--ink-3)';

  const copyExcerpt = () => {
    navigator.clipboard?.writeText(result.content || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const copyPath = () => {
    navigator.clipboard?.writeText(result.source || '');
  };

  return (
    <div style={{
      border: '1px solid var(--line)',
      borderRadius: 'var(--radius)',
      background: 'var(--paper)',
      marginBottom: 12,
      overflow: 'hidden',
    }}>
      {/* Card header */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 12,
        padding: '14px 16px 10px',
        borderBottom: expanded ? '1px solid var(--line)' : 'none',
      }}>
        {/* Rank */}
        <div style={{
          minWidth: 26, height: 26, borderRadius: 6,
          background: 'var(--paper-2)', border: '1px solid var(--line)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--ink-3)', flexShrink: 0,
        }}>
          {rank}
        </div>

        {/* Title + meta */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 500, fontSize: 13 }}>{filename}</span>
            {result.metadata?.section && (
              <span style={{
                fontSize: 10, fontFamily: 'var(--font-mono)',
                background: 'var(--accent-tint)', color: 'var(--accent)',
                padding: '1px 6px', borderRadius: 4,
              }}>{result.metadata.section}</span>
            )}
            {result.metadata?.page && (
              <span className="text-xs text-faint mono">p.{result.metadata.page}</span>
            )}
          </div>
          <div className="mono text-faint" style={{ fontSize: 10, marginTop: 3, wordBreak: 'break-all' }}>
            {result.source}
          </div>
        </div>

        {/* Score badge */}
        <div style={{ flexShrink: 0, textAlign: 'right' }}>
          <div style={{ fontSize: 15, fontFamily: 'var(--font-mono)', fontWeight: 600, color: scoreColor }}>
            {score.toFixed(3)}
          </div>
          {/* Score bar */}
          <div style={{
            width: 60, height: 3, background: 'var(--line)',
            borderRadius: 2, marginTop: 4, overflow: 'hidden',
          }}>
            <div style={{
              width: `${score * 100}%`, height: '100%',
              background: scoreColor, borderRadius: 2,
              transition: 'width 0.3s ease',
            }} />
          </div>
        </div>
      </div>

      {/* Excerpt */}
      <div style={{ padding: '10px 16px' }}>
        <div style={{
          fontSize: 13, lineHeight: 1.6, color: 'var(--ink-2)',
          display: '-webkit-box', WebkitLineClamp: expanded ? 'unset' : 3,
          WebkitBoxOrient: 'vertical', overflow: expanded ? 'visible' : 'hidden',
        }}>
          "{result.content || 'No content available.'}"
        </div>
        {result.content && result.content.length > 200 && (
          <button
            className="text-xs"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', padding: '4px 0', marginTop: 2 }}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>

      {/* Actions row */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '8px 16px',
        borderTop: '1px solid var(--line)',
        background: 'var(--paper-2)',
      }}>
        <button className="btn btn-sm" onClick={copyExcerpt} title="Copy excerpt text">
          <Icon.Copy size={11} /> {copied ? 'Copied!' : 'Copy excerpt'}
        </button>
        <button className="btn btn-sm" onClick={copyPath} title="Copy source path">
          <Icon.Book size={11} /> Copy path
        </button>
        <button className="btn btn-sm" onClick={onSendToPlayground} title="Ask about this document in Playground">
          <Icon.Chat size={11} /> Ask in Playground
        </button>
        {result.metadata?.author && (
          <span className="text-xs text-faint mono" style={{ marginLeft: 'auto' }}>
            {result.metadata.author}
          </span>
        )}
      </div>
    </div>
  );
}

window.SearchView = SearchView;
