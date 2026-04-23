// Tweaks panel — display/density/accent controls

const ACCENTS = [
  { id: 'terracotta', color: '#C2704B', ink: '#A15735', soft: '#E8CFBF' },
  { id: 'olive',      color: '#7A8454', ink: '#5E6738', soft: '#D6DBC4' },
  { id: 'ink',        color: '#2E3440', ink: '#1D2230', soft: '#C9CDD6' },
  { id: 'plum',       color: '#8D5A77', ink: '#6C4058', soft: '#DFCBD6' },
];

function Tweaks({ state, setState, onClose }) {
  const set = (k, v) => {
    const next = { ...state, [k]: v };
    setState(next);
  };

  return (
    <div className="tweaks">
      <div className="tweaks-header">
        <span className="tweaks-title">Tweaks</span>
        <button className="icon-btn" onClick={onClose}><Icon.Close size={12} /></button>
      </div>

      <div className="tweaks-row">
        <span className="tweaks-label">Theme</span>
        <div className="seg">
          <button className={state.theme === 'light' ? 'active' : ''} onClick={() => set('theme', 'light')}>Light</button>
          <button className={state.theme === 'dark'  ? 'active' : ''} onClick={() => set('theme', 'dark')}>Dark</button>
        </div>
      </div>

      <div className="tweaks-row">
        <span className="tweaks-label">Density</span>
        <div className="seg">
          <button className={state.density === 'comfortable' ? 'active' : ''} onClick={() => set('density', 'comfortable')}>Comfortable</button>
          <button className={state.density === 'compact'     ? 'active' : ''} onClick={() => set('density', 'compact')}>Compact</button>
        </div>
      </div>

      <div className="tweaks-row">
        <span className="tweaks-label">Accent</span>
        <div className="swatches">
          {ACCENTS.map(a => (
            <button key={a.id}
              className={`swatch ${state.accent === a.id ? 'active' : ''}`}
              style={{background: a.color}}
              onClick={() => set('accent', a.id)} />
          ))}
        </div>
      </div>

      <div className="tweaks-row">
        <span className="tweaks-label">Compare layout</span>
        <div className="seg">
          <button className={state.compareCols === 2 ? 'active' : ''} onClick={() => set('compareCols', 2)}>2-col</button>
          <button className={state.compareCols === 4 ? 'active' : ''} onClick={() => set('compareCols', 4)}>4-col</button>
        </div>
      </div>

      <div className="tweaks-row">
        <span className="tweaks-label">Retrieval panel</span>
        <div className={`toggle ${state.showRetrieval ? 'on' : ''}`} onClick={() => set('showRetrieval', !state.showRetrieval)} />
      </div>

      <div className="tweaks-row">
        <span className="tweaks-label">Pipeline panel</span>
        <div className={`toggle ${state.showConfig ? 'on' : ''}`} onClick={() => set('showConfig', !state.showConfig)} />
      </div>
    </div>
  );
}

function applyTheme(state) {
  const root = document.documentElement;
  root.setAttribute('data-theme', state.theme);
  root.setAttribute('data-density', state.density);
  const a = ACCENTS.find(x => x.id === state.accent) || ACCENTS[0];
  root.style.setProperty('--accent', a.color);
  root.style.setProperty('--accent-ink', a.ink);
  root.style.setProperty('--accent-soft', a.soft);
}

Object.assign(window, { Tweaks, applyTheme, ACCENTS });
