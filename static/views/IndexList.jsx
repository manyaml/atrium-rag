// Index list view — 5 layouts: cards, bubbles, list, dense, gallery

const { useState: useSI, useMemo: useMI } = React;

function StatusPill({ s }) {
  const label = { success: 'Success', failed: 'Failed', running: 'Running', queued: 'Queued' }[s] || s;
  return <span className={`status s-${s}`}><span className="dot" />{label}</span>;
}

function fmtNum(n) { return n.toLocaleString(); }

// --- Mini visualizations ---

function Sparkline({ values, color = '#E8B596' }) {
  const w = 200, h = 32;
  const min = Math.min(...values), max = Math.max(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return [x, y];
  });
  const line = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `${line} L${w},${h} L0,${h} Z`;
  return (
    <svg className="spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="sp-grad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.55" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#sp-grad)" />
      <path d={line} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.slice(-1).map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.5" fill={color} />
      ))}
    </svg>
  );
}

function ChunkStackBar({ buckets }) {
  const palette = {
    256:  '#A87B5C',
    384:  '#C9986B',
    512:  '#D9B898',
    768:  '#8FA88F',
    1024: '#6B8AA8',
  };
  const entries = Object.entries(buckets).sort((a, b) => +a[0] - +b[0]);
  const total = entries.reduce((a, [, v]) => a + v, 0);
  return (
    <div>
      <div className="stack-bar">
        {entries.map(([k, v]) => (
          <span key={k} style={{ width: `${(v / total) * 100}%`, background: palette[k] || '#999' }} />
        ))}
      </div>
      <div className="stack-legend">
        {entries.map(([k, v]) => (
          <span key={k}><span className="sw" style={{ background: palette[k] || '#999' }} />{k}t · {v}</span>
        ))}
      </div>
    </div>
  );
}

function HealthDonut({ success, running, failed, queued }) {
  const total = success + running + failed + queued || 1;
  const segments = [
    { v: success, color: '#5A7A4E' },
    { v: running, color: '#E08A4A' },
    { v: failed,  color: '#A84632' },
    { v: queued,  color: '#B07B2C' },
  ].filter(s => s.v > 0);

  const r = 32, cx = 42, cy = 42, c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="donut-wrap">
      <svg width="84" height="84" viewBox="0 0 84 84" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="10" />
        {segments.map((s, i) => {
          const len = (s.v / total) * c;
          const dasharray = `${len} ${c - len}`;
          const dashoffset = -offset;
          offset += len;
          return (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none"
              stroke={s.color} strokeWidth="10"
              strokeDasharray={dasharray} strokeDashoffset={dashoffset}
              strokeLinecap="butt" />
          );
        })}
      </svg>
      <div className="donut-center">{total}</div>
    </div>
  );
}

function LayoutCards({ rows, onPick }) {
  return (
    <div className="idx-grid">
      {rows.map(ix => (
        <div key={ix.id} className="idx-card" onClick={() => onPick(ix.id)}>
          <div className="head">
            <div>
              <div className="name">{ix.name}</div>
              <div className="ver">{ix.id} · {ix.version}</div>
            </div>
            <StatusPill s={ix.status} />
          </div>
          <div className="meta">
            <span><span className="k">docs</span><span className="v">{fmtNum(ix.docs)}</span></span>
            <span><span className="k">chunks</span><span className="v">{fmtNum(ix.chunks)}</span></span>
            <span><span className="k">updated</span><span className="v">{ix.lastUpdate}</span></span>
          </div>
        </div>
      ))}
    </div>
  );
}

function LayoutBubbles({ rows, onPick }) {
  // size by docs (relative)
  const max = Math.max(...rows.map(r => r.docs));
  return (
    <div className="idx-bubbles">
      {rows.map(ix => {
        // size by docs — drive font/padding (not transform) so layout reserves space
        const t = ix.docs / max; // 0..1
        const fs = (13 + t * 7).toFixed(1);
        const px = (10 + t * 10).toFixed(0);
        const py = (7 + t * 7).toFixed(0);
        return (
          <button key={ix.id} className={`idx-bubble s-${ix.status}`} onClick={() => onPick(ix.id)}
            style={{padding: `${py}px ${parseInt(px) + 4}px ${py}px ${px}px`}}>
            <span className="b-status" />
            <span className="b-name" style={{fontSize: `${fs}px`}}>{ix.name}</span>
            <span className="b-meta">{fmtNum(ix.docs)} · {ix.lastUpdate}</span>
          </button>
        );
      })}
    </div>
  );
}

function LayoutList({ rows, onPick }) {
  return (
    <div className="idx-list">
      <div className="row head">
        <div>Name</div>
        <div>Status</div>
        <div>Connector</div>
        <div>Docs</div>
        <div>Updated</div>
        <div>Owner</div>
        <div></div>
      </div>
      {rows.map(ix => (
        <div key={ix.id} className="row" onClick={() => onPick(ix.id)}>
          <div className="name">{ix.name}<span className="ver">{ix.version}</span></div>
          <div><StatusPill s={ix.status} /></div>
          <div className="mono">{ix.connector}</div>
          <div className="mono">{fmtNum(ix.docs)}</div>
          <div className="muted">{ix.lastUpdate}</div>
          <div className="muted mono">{ix.owner}</div>
          <div className="muted"><Icon.Caret size={11} /></div>
        </div>
      ))}
    </div>
  );
}

function LayoutDense({ rows, onPick }) {
  return (
    <div className="panel">
      <table className="idx-dense">
        <thead><tr>
          <th>Name</th><th>Ver</th><th>Status</th><th>Connector</th>
          <th>Docs</th><th>Chunks</th><th>Size</th><th>Embedder</th>
          <th>Store</th><th>Updated</th><th>Job</th><th>Owner</th>
        </tr></thead>
        <tbody>
          {rows.map(ix => (
            <tr key={ix.id} onClick={() => onPick(ix.id)}>
              <td className="name">{ix.name}</td>
              <td>{ix.version}</td>
              <td><StatusPill s={ix.status} /></td>
              <td>{ix.connector}</td>
              <td>{fmtNum(ix.docs)}</td>
              <td>{fmtNum(ix.chunks)}</td>
              <td>{ix.sizeMb}MB</td>
              <td>{ix.embedder.split('-').slice(0,3).join('-')}</td>
              <td>{ix.vectorStore}</td>
              <td>{ix.lastUpdate}</td>
              <td>{ix.lastJob}</td>
              <td>{ix.owner}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LayoutGallery({ rows, onPick }) {
  return (
    <div className="idx-gallery">
      {rows.map(ix => (
        <div key={ix.id} className="idx-hero" onClick={() => onPick(ix.id)}>
          <div className="top">
            <h3 className="name">{ix.name}</h3>
            <div className="ver">{ix.id} · {ix.version} · {ix.connector}</div>
          </div>
          <div className="body">
            <div className="field"><div className="field-label">Documents</div><div className="v">{fmtNum(ix.docs)}</div></div>
            <div className="field"><div className="field-label">Chunks</div><div className="v">{fmtNum(ix.chunks)}</div></div>
            <div className="field"><div className="field-label">Embedder</div><div className="v" style={{fontSize: 11}}>{ix.embedder}</div></div>
            <div className="field"><div className="field-label">Store</div><div className="v">{ix.vectorStore}</div></div>
          </div>
          <div className="foot">
            <StatusPill s={ix.status} />
            <span className="muted">Updated {ix.lastUpdate}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function IndexListView({ onPick, onNew, layout, setLayout }) {
  const [q, setQ] = useSI('');
  const [statusFilter, setStatusFilter] = useSI('all');

  const filtered = useMI(() => {
    return INDEXES.filter(ix => {
      if (statusFilter !== 'all' && ix.status !== statusFilter) return false;
      if (q && !ix.name.toLowerCase().includes(q.toLowerCase()) && !ix.id.includes(q.toLowerCase())) return false;
      return true;
    });
  }, [q, statusFilter]);

  const totals = useMI(() => {
    const statusCounts = INDEXES.reduce((a, ix) => {
      a[ix.status] = (a[ix.status] || 0) + 1;
      return a;
    }, {});
    // Chunk-size distribution buckets
    const chunkBuckets = INDEXES.reduce((a, ix) => {
      const k = ix.chunkSize;
      a[k] = (a[k] || 0) + 1;
      return a;
    }, {});
    // Connector spread (for dot-grid hint)
    const connectors = [...new Set(INDEXES.map(i => i.connector))].length;
    // Synthetic doc-growth sparkline (12 weeks)
    const total = INDEXES.reduce((a, b) => a + b.docs, 0);
    const spark = Array.from({length: 12}, (_, i) => {
      const r = Math.sin(i * 1.7) * 0.08 + (i / 11) * 0.55 + 0.4;
      return Math.round(total * r);
    });
    return {
      indexes: INDEXES.length,
      docs: total,
      chunks: INDEXES.reduce((a, b) => a + b.chunks, 0),
      failed: statusCounts.failed || 0,
      running: statusCounts.running || 0,
      queued: statusCounts.queued || 0,
      success: statusCounts.success || 0,
      connectors,
      chunkBuckets,
      spark,
    };
  }, []);

  let body;
  if (layout === 'cards')   body = <LayoutCards rows={filtered} onPick={onPick} />;
  else if (layout === 'bubbles') body = <LayoutBubbles rows={filtered} onPick={onPick} />;
  else if (layout === 'list')    body = <LayoutList rows={filtered} onPick={onPick} />;
  else if (layout === 'dense')   body = <LayoutDense rows={filtered} onPick={onPick} />;
  else                            body = <LayoutGallery rows={filtered} onPick={onPick} />;

  return (
    <>
      <Topbar title="Indexes" crumbs={[`${INDEXES.length} total`]}
        right={
          <div className="hstack">
            <button className="btn btn-sm btn-accent" onClick={onNew}><Icon.Plus size={12} /> New index</button>
          </div>
        }
      />
      <div className="content">

        <div className="idx-stats">
          {/* A — Indexes */}
          <div className="stat-tile t-indexes">
            <div>
              <div className="stat-label"><Icon.Layers size={11} /> Indexes</div>
              <div className="stat-val">{totals.indexes}</div>
              <div className="stat-sub">across {totals.connectors} connectors</div>
            </div>
            <div className="dot-grid">
              {Array.from({length: 40}).map((_, i) => (
                <span key={i} className={i < totals.indexes ? '' : 'muted'} />
              ))}
            </div>
          </div>

          {/* B — Documents w/ sparkline */}
          <div className="stat-tile t-docs">
            <div>
              <div className="stat-label"><Icon.Doc size={11} /> Documents
                <span className="trend-up">↑ 12.4%</span>
              </div>
              <div className="stat-val">{(totals.docs / 1000).toFixed(1)}<span style={{fontSize: 18, opacity: 0.7}}>k</span></div>
            </div>
            <Sparkline values={totals.spark} color="#E8B596" />
          </div>

          {/* C — Chunks w/ stacked bar */}
          <div className="stat-tile t-chunks">
            <div>
              <div className="stat-label"><Icon.Hash size={11} /> Chunks</div>
              <div className="stat-val">{(totals.chunks / 1000000).toFixed(1)}<span style={{fontSize: 18, opacity: 0.7}}>M</span></div>
            </div>
            <ChunkStackBar buckets={totals.chunkBuckets} />
          </div>

          {/* D — Health donut */}
          <div className={`stat-tile t-health ${totals.failed > 0 ? 'has-failures' : ''}`}>
            <HealthDonut success={totals.success} running={totals.running} failed={totals.failed} queued={totals.queued} />
            <div className="text-side">
              <div className="stat-label"><Icon.Pulse size={11} /> Health</div>
              <div className="stat-val" style={{fontSize: 30}}>{Math.round((totals.success / totals.indexes) * 100)}<span style={{fontSize: 16, opacity: 0.6}}>%</span></div>
              <div className="health-legend">
                <span><span className="sw" style={{background: '#5A7A4E'}} />{totals.success} ok</span>
                <span><span className="sw" style={{background: '#E08A4A'}} />{totals.running} run</span>
                <span><span className="sw" style={{background: '#A84632'}} />{totals.failed} fail</span>
                <span><span className="sw" style={{background: '#B07B2C'}} />{totals.queued} q</span>
              </div>
            </div>
          </div>
        </div>

        <div className="idx-toolbar">
          <div className="idx-search">
            <span className="ico"><Icon.Search size={13} /></span>
            <input className="input" placeholder="Search indexes…" value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <div className="seg">
            {['all','success','running','failed','queued'].map(s => (
              <button key={s} className={statusFilter === s ? 'active' : ''} onClick={() => setStatusFilter(s)}>
                {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          <div style={{flex: 1}} />
          <span className="text-xs text-muted">{filtered.length} shown</span>
        </div>

        {body}
      </div>
    </>
  );
}

window.IndexListView = IndexListView;
