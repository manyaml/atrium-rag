// App root — fetches domains from /api/domains, then routes views

const { useState: useSA, useEffect: useEA } = React;

const TWEAK_DEFAULTS = {
  theme: 'light',
  density: 'comfortable',
  accent: 'terracotta',
  compareCols: 2,
  showRetrieval: true,
  showConfig: true,
};

function App() {
  const [view, setView] = useSA(() => localStorage.getItem('atrium.view') || 'playground');
  const [domain, setDomain] = useSA(() => localStorage.getItem('atrium.domain') || '');
  const [loggedIn, setLoggedIn] = useSA(() => localStorage.getItem('atrium.loggedIn') === '1');
  const [domains, setDomains] = useSA([]);
  const [domainsLoading, setDomainsLoading] = useSA(true);
  const [cfg, setCfg] = useSA({ ...DEFAULT_CONFIG });
  const [tweakState, setTweakState] = useSA(() => {
    const stored = localStorage.getItem('atrium.tweaks');
    return stored ? { ...TWEAK_DEFAULTS, ...JSON.parse(stored) } : { ...TWEAK_DEFAULTS };
  });
  const [tweaksOpen, setTweaksOpen] = useSA(false);

  // Persist state
  useEA(() => { localStorage.setItem('atrium.view', view); }, [view]);
  useEA(() => { if (domain) localStorage.setItem('atrium.domain', domain); }, [domain]);
  useEA(() => { localStorage.setItem('atrium.loggedIn', loggedIn ? '1' : '0'); }, [loggedIn]);
  useEA(() => {
    localStorage.setItem('atrium.tweaks', JSON.stringify(tweakState));
    applyTheme(tweakState);
  }, [tweakState]);

  // Apply theme on first render
  useEA(() => { applyTheme(tweakState); }, []);

  // Fetch domains from API
  useEA(() => {
    fetch('/api/domains')
      .then(r => r.json())
      .then(data => {
        const normalised = (data.domains || []).map(normaliseDomain);
        setDomains(normalised);
        // Update global so other modules can access it
        window.DOMAINS = normalised;
        // Auto-select first domain if none chosen
        if (!domain && normalised.length > 0) {
          setDomain(normalised[0].id);
        }
      })
      .catch(err => console.error('Failed to load domains:', err))
      .finally(() => setDomainsLoading(false));
  }, []);

  if (!loggedIn) {
    return (
      <LoginView
        domains={domains}
        loading={domainsLoading}
        onLogin={(d) => { setDomain(d); setLoggedIn(true); setView('playground'); }}
      />
    );
  }

  const onSwitchDomain = () => { setLoggedIn(false); };

  let main;
  const sharedProps = { domain, domains, cfg, setCfg };

  if (view === 'playground') {
    main = <PlaygroundView {...sharedProps}
      showRetrieval={tweakState.showRetrieval}
      showConfig={tweakState.showConfig} />;
  } else if (view === 'compare') {
    main = <CompareView {...sharedProps} layoutCols={tweakState.compareCols} />;
  } else if (view === 'config') {
    main = <ConfigView cfg={cfg} setCfg={setCfg} />;
  } else if (view === 'history') {
    main = <HistoryView domain={domain} domains={domains} onOpen={() => setView('playground')} />;
  } else if (view === 'sources') {
    main = <SourcesView domain={domain} domains={domains} />;
  }

  return (
    <div className="app">
      <Sidebar
        active={view}
        onNavigate={setView}
        domain={domain}
        domains={domains}
        onSwitchDomain={onSwitchDomain}
      />
      <div className="main">{main}</div>
      <button
        onClick={() => setTweaksOpen(o => !o)}
        style={{
          position: 'fixed', right: 16, bottom: 16,
          width: 32, height: 32,
          border: '1px solid var(--line)',
          borderRadius: 'var(--radius-s)',
          background: 'var(--paper)',
          color: 'var(--ink-3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 40,
        }}
        title="Tweaks"
      >
        <Icon.Settings size={14} />
      </button>
      {tweaksOpen && (
        <Tweaks state={tweakState} setState={setTweakState} onClose={() => setTweaksOpen(false)} />
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
