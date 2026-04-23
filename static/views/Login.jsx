// Login / domain-select screen
const { useState: useLoginState } = React;

function LoginView({ onLogin, domains, loading }) {
  const [email, setEmail] = useLoginState('');
  const [password, setPassword] = useLoginState('');
  const [domain, setDomain] = useLoginState('');

  // Auto-select first domain once they load
  React.useEffect(() => {
    if (domains.length > 0 && !domain) setDomain(domains[0].id);
  }, [domains]);

  const submit = (e) => {
    e.preventDefault();
    if (!domain) return;
    onLogin(domain);
  };

  const selectedDomain = domains.find(d => d.id === domain);

  return (
    <div className="login-wrap">
      <div className="login-hero">
        <div className="hstack" style={{gap: 10}}>
          <div className="brand-mark" />
          <div>
            <div className="serif" style={{fontSize: 17}}>Atrium</div>
            <div className="brand-sub">RAG Evaluation Console</div>
          </div>
        </div>

        <div>
          <h1 className="hero-title">
            A quiet console for <em>inspecting</em>,
            tuning, and comparing your retrieval pipelines.
          </h1>
          <p className="hero-sub">
            Ask questions of your domain corpora. Change the model, the prompt, the retrieval depth — and watch
            what changes, and what doesn't.
          </p>
        </div>

        <div className="text-xs text-faint mono" style={{letterSpacing: '0.04em'}}>
          Atrium · internal build
        </div>
      </div>

      <form className="login-form" onSubmit={submit}>
        <h2>Sign in</h2>
        <p className="muted" style={{margin: '0 0 28px', fontSize: 14}}>
          Use your corporate SSO credentials. Each domain has a separate permission scope.
        </p>

        <div className="col" style={{gap: 14}}>
          <div className="field">
            <label className="field-label">Work email</label>
            <input className="input" type="email" placeholder="you@company.com"
              value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label className="field-label">Password</label>
            <input className="input" type="password" placeholder="••••••••••••"
              value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          <div className="field" style={{marginTop: 8}}>
            <label className="field-label">
              Domain
              {selectedDomain && <span className="mono text-faint">{selectedDomain.idx || selectedDomain.id}</span>}
            </label>
            {loading ? (
              <div className="text-sm text-muted" style={{padding: '8px 0'}}>Loading domains…</div>
            ) : (
              <div className="model-pick">
                {domains.map(d => (
                  <button
                    type="button"
                    key={d.id}
                    className={`model-option ${domain === d.id ? 'active' : ''}`}
                    onClick={() => setDomain(d.id)}
                  >
                    <div className="model-main">
                      <div className="name">{d.name}</div>
                      <div className="text-xs text-muted" style={{fontWeight: 400, marginTop: 2, whiteSpace: 'normal', lineHeight: 1.4}}>{d.desc}</div>
                    </div>
                    {d.docs && <div className="provider">{d.docs.toLocaleString()} docs</div>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button className="btn btn-accent" type="submit" disabled={!domain || loading}
            style={{marginTop: 12, height: 40, justifyContent: 'center'}}>
            Continue
            <Icon.Arrow />
          </button>

          <div className="hstack" style={{justifyContent: 'space-between', marginTop: 8}}>
            <span className="text-xs text-muted">Can't access your domain? Contact your workspace admin.</span>
            <span className="text-xs"><span className="kbd">⏎</span></span>
          </div>
        </div>
      </form>
    </div>
  );
}

window.LoginView = LoginView;
