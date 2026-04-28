// Tweaks panel — display/density/accent controls

function LayoutGlyph({ kind }) {
  const stroke = 'currentColor';
  if (kind === 'cards') return (
    <svg viewBox="0 0 36 26" width="36" height="26">
      <rect x="2"  y="3"  width="14" height="9" rx="1" fill="none" stroke={stroke} strokeWidth="1.2" />
      <rect x="20" y="3"  width="14" height="9" rx="1" fill="none" stroke={stroke} strokeWidth="1.2" />
      <rect x="2"  y="15" width="14" height="9" rx="1" fill="none" stroke={stroke} strokeWidth="1.2" />
      <rect x="20" y="15" width="14" height="9" rx="1" fill="none" stroke={stroke} strokeWidth="1.2" />
    </svg>
  );
  if (kind === 'bubbles') return (
    <svg viewBox="0 0 36 26" width="36" height="26">
      <circle cx="8"  cy="9"  r="4.5" fill="none" stroke={stroke} strokeWidth="1.2" />
      <circle cx="20" cy="7"  r="3"   fill="none" stroke={stroke} strokeWidth="1.2" />
      <circle cx="29" cy="11" r="5"   fill="none" stroke={stroke} strokeWidth="1.2" />
      <circle cx="11" cy="20" r="3.5" fill="none" stroke={stroke} strokeWidth="1.2" />
      <circle cx="22" cy="20" r="2.5" fill="none" stroke={stroke} strokeWidth="1.2" />
    </svg>
  );
  if (kind === 'list') return (
    <svg viewBox="0 0 36 26" width="36" height="26">
      <line x1="3" y1="6"  x2="33" y2="6"  stroke={stroke} strokeWidth="1.2" />
      <line x1="3" y1="13" x2="33" y2="13" stroke={stroke} strokeWidth="1.2" />
      <line x1="3" y1="20" x2="33" y2="20" stroke={stroke} strokeWidth="1.2" />
      <circle cx="6" cy="6"  r="1.3" fill={stroke} />
      <circle cx="6" cy="13" r="1.3" fill={stroke} />
      <circle cx="6" cy="20" r="1.3" fill={stroke} />
    </svg>
  );
  if (kind === 'dense') return (
    <svg viewBox="0 0 36 26" width="36" height="26">
      <rect x="2" y="3" width="32" height="20" fill="none" stroke={stroke} strokeWidth="1" />
      <line x1="2"  y1="8"  x2="34" y2="8"  stroke={stroke} strokeWidth="0.8" />
      <line x1="2"  y1="13" x2="34" y2="13" stroke={stroke} strokeWidth="0.8" />
      <line x1="2"  y1="18" x2="34" y2="18" stroke={stroke} strokeWidth="0.8" />
      <line x1="12" y1="3"  x2="12" y2="23" stroke={stroke} strokeWidth="0.8" />
      <line x1="22" y1="3"  x2="22" y2="23" stroke={stroke} strokeWidth="0.8" />
    </svg>
  );
  if (kind === 'gallery') return (
    <svg viewBox="0 0 36 26" width="36" height="26">
      <rect x="2"  y="3" width="15" height="20" rx="1.5" fill="none" stroke={stroke} strokeWidth="1.2" />
      <rect x="19" y="3" width="15" height="20" rx="1.5" fill="none" stroke={stroke} strokeWidth="1.2" />
      <line x1="4"  y1="16" x2="15" y2="16" stroke={stroke} strokeWidth="0.8" />
      <line x1="4"  y1="19" x2="11" y2="19" stroke={stroke} strokeWidth="0.8" />
      <line x1="21" y1="16" x2="32" y2="16" stroke={stroke} strokeWidth="0.8" />
      <line x1="21" y1="19" x2="28" y2="19" stroke={stroke} strokeWidth="0.8" />
    </svg>
  );
  return null;
}

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

      <div className="tweaks-row" style={{flexDirection: 'column', alignItems: 'stretch', gap: 8}}>
        <span className="tweaks-label">Indexes layout</span>
        <div className="layout-picker">
          {[
            { id: 'cards',   label: 'Cards' },
            { id: 'bubbles', label: 'Bubbles' },
            { id: 'list',    label: 'List' },
            { id: 'dense',   label: 'Dense' },
            { id: 'gallery', label: 'Gallery' },
          ].map(opt => (
            <button key={opt.id}
              className={`layout-tile ${state.indexLayout === opt.id ? 'active' : ''}`}
              onClick={() => set('indexLayout', opt.id)}>
              <LayoutGlyph kind={opt.id} />
              <span className="layout-tile-label">{opt.label}</span>
            </button>
          ))}
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
