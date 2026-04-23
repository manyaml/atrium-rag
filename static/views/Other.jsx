// History, Config, Sources views

function ConfigView({ cfg, setCfg }) {
  return (
    <>
      <Topbar title="Pipeline" crumbs={['Configuration']}
        right={<button className="btn btn-sm btn-primary"><Icon.Save size={12} /> Save preset</button>} />
      <div className="content" style={{maxWidth: 720}}>
        <p className="text-sm text-muted" style={{margin: '0 0 20px', maxWidth: 560}}>
          These settings apply to new runs from the playground. Saved presets can be selected as either
          variant in the compare view.
        </p>
        <PipelinePanel cfg={cfg} setCfg={setCfg} title="Active pipeline" />

        <div className="panel" style={{marginTop: 16}}>
          <div className="panel-header"><div className="panel-title">Saved presets · 4</div></div>
          <div className="panel-body">
            <div className="vstack" style={{gap: 4}}>
              {[
                { name: 'Strict · low-temp baseline',    meta: 'sonnet-4 · t=0.1 · k=4',  ts: 'Updated 2d ago' },
                { name: 'Exploratory · higher recall',    meta: 'opus-4 · t=0.6 · k=12',  ts: 'Updated 5d ago' },
                { name: 'Fast · cheap backfill',          meta: 'mixtral · t=0.3 · k=6',  ts: 'Updated 12d ago' },
                { name: 'Grounded · citations-required',  meta: 'sonnet-4 · t=0.0 · k=8', ts: 'Updated 18d ago' },
              ].map((p, i) => (
                <div key={i} className="hstack" style={{padding: '10px 4px', borderBottom: '1px solid var(--line-soft)', gap: 16}}>
                  <div className="flex1">
                    <div style={{fontWeight: 500}}>{p.name}</div>
                    <div className="text-xs text-muted mono">{p.meta}</div>
                  </div>
                  <div className="text-xs text-faint">{p.ts}</div>
                  <button className="btn btn-sm">Load</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function HistoryView({ domain, domains, onOpen }) {
  const rows = HISTORY.filter(h => h.domain === domain);
  const domainObj = domains.find(d => d.id === domain);

  return (
    <>
      <Topbar title="History" crumbs={['Saved runs']}
        right={
          <div className="hstack">
            <div style={{position: 'relative'}}>
              <input className="input" placeholder="Search runs…" style={{paddingLeft: 28, width: 220}} />
              <span style={{position: 'absolute', left: 9, top: 9, color: 'var(--ink-4)'}}><Icon.Search size={13} /></span>
            </div>
            <button className="btn btn-sm"><Icon.Star size={12} /> Starred</button>
          </div>
        }
      />
      <div className="content">
        {rows.length === 0 ? (
          <div className="empty">
            <div className="ico"><Icon.History size={16} /></div>
            <p className="text-sm text-muted" style={{marginTop: 8}}>
              No saved runs yet for {domainObj?.name || domain}. Run some queries in the Playground first.
            </p>
          </div>
        ) : (
          <div className="panel">
            <table className="table">
              <thead>
                <tr>
                  <th style={{width: 28}}></th>
                  <th>Question</th>
                  <th style={{width: 140}}>Model</th>
                  <th style={{width: 80}}>Temp</th>
                  <th style={{width: 140}}>Timestamp</th>
                  <th style={{width: 80}}></th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.id}>
                    <td><button className="icon-btn" style={{color: r.starred ? 'var(--accent)' : 'var(--ink-4)'}}><Icon.Star size={13} /></button></td>
                    <td className="q">{r.q}</td>
                    <td><span className="mono text-xs">{r.model}</span></td>
                    <td><span className="mono text-xs">{r.temp.toFixed(2)}</span></td>
                    <td><span className="ts">{r.ts}</span></td>
                    <td>
                      <div className="hstack" style={{gap: 2}}>
                        <button className="icon-btn" title="Open" onClick={() => onOpen && onOpen(r.id)}><Icon.Arrow size={13} /></button>
                        <button className="icon-btn" title="Compare"><Icon.Split size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

function SourcesView({ domain, domains }) {
  const d = domains.find(x => x.id === domain);
  return (
    <>
      <Topbar title="Index" crumbs={[d?.name || domain, d?.idx || domain]}
        right={
          <div className="hstack">
            <span className="badge"><span className="dot" />synced</span>
            <button className="btn btn-sm">Re-index</button>
          </div>
        }
      />
      <div className="content" style={{maxWidth: 920}}>
        <div className="hstack" style={{gap: 24, marginBottom: 20}}>
          {d?.docs && (
            <div>
              <div className="text-xs text-muted" style={{letterSpacing:'0.06em', textTransform:'uppercase'}}>Documents</div>
              <div className="serif" style={{fontSize: 28, marginTop: 2}}>{d.docs.toLocaleString()}</div>
            </div>
          )}
          <div>
            <div className="text-xs text-muted" style={{letterSpacing:'0.06em', textTransform:'uppercase'}}>Domain</div>
            <div className="serif" style={{fontSize: 28, marginTop: 2}}>{d?.name || domain}</div>
          </div>
          <div>
            <div className="text-xs text-muted" style={{letterSpacing:'0.06em', textTransform:'uppercase'}}>Index</div>
            <div className="serif" style={{fontSize: 28, marginTop: 2}}>{d?.idx || domain}</div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">Domain overview</div>
          </div>
          <div className="panel-body">
            <p className="text-sm text-muted" style={{margin: 0, lineHeight: 1.65}}>
              {d?.desc || 'No description available for this domain.'}
            </p>
            <p className="text-sm text-muted" style={{marginTop: 12}}>
              Use the Playground to query documents in this index. The retrieval panel will show
              which chunks were fetched for each question, along with their relevance scores.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

Object.assign(window, { ConfigView, HistoryView, SourcesView });
