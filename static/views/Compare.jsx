// Compare view — A vs B (or up to 4), each with editable params + synced question

const { useState: useSC } = React;

function ParamPill({ k, v }) {
  return <span className="param-pill"><span className="k">{k}</span> {v}</span>;
}

function VariantCard({ label, badgeClass, cfg, setCfg, answer, onEditParams, domain }) {
  return (
    <div className="variant">
      <div className="variant-head">
        <div className="variant-title">
          <span className={`badge ${badgeClass}`}><span className="dot"/>{label}</span>
          <span className="text-sm text-muted mono">{cfg.model}</span>
        </div>
        <div className="hstack">
          <button className="icon-btn" onClick={onEditParams} title="Edit params"><Icon.Settings size={13} /></button>
          <button className="icon-btn" title="Re-run"><Icon.Refresh size={13} /></button>
        </div>
      </div>
      <div className="variant-params">
        <ParamPill k="temp" v={cfg.temperature.toFixed(2)} />
        <ParamPill k="top_p" v={cfg.topP.toFixed(2)} />
        <ParamPill k="k" v={cfg.retrievalK} />
      </div>
      <div className="variant-body">
        <div className="msg-text">
          {answer.text.split('\n').map((l, i) => <p key={i}>{renderWithCitations(l)}</p>)}
        </div>

        <hr className="divider" />
        <div className="text-xs text-muted" style={{marginBottom: 8, letterSpacing: '0.04em', textTransform: 'uppercase'}}>
          Sources cited
        </div>
        <div className="vstack" style={{gap: 6}}>
          {answer.citations && answer.citations.length > 0
            ? answer.citations.map(n => (
                <div key={n} className="text-sm hstack" style={{gap: 8}}>
                  <span className="cite">{n}</span>
                  <span className="text-muted" style={{overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                    Source {n}
                  </span>
                </div>
              ))
            : <div className="text-xs text-faint">— no citations in this response</div>
          }
        </div>
      </div>
    </div>
  );
}

function CompareView({ domain, cfg, layoutCols }) {
  const [question, setQuestion] = useSC('What are the key topics covered in this knowledge base?');
  const [showEditA, setShowEditA] = useSC(false);
  const [showEditB, setShowEditB] = useSC(false);

  const [cfgA, setCfgA] = useSC({ ...cfg, model: 'claude-sonnet-4', temperature: 0.2 });
  const [cfgB, setCfgB] = useSC({ ...cfg, model: 'gpt-4o', temperature: 0.7, retrievalK: 3,
    systemPrompt: 'You are a helpful assistant. Answer the user\'s question using the context provided.' });
  const [cfgC, setCfgC] = useSC({ ...cfg, model: 'llama-3-70b', temperature: 0.4, retrievalK: 8 });
  const [cfgD, setCfgD] = useSC({ ...cfg, model: 'mixtral-8x22b', temperature: 0.3, retrievalK: 10 });

  const cols = layoutCols === 4 ? 'cols-4' : 'cols-2';

  return (
    <>
      <Topbar
        title="Compare"
        crumbs={['A / B']}
        right={
          <div className="hstack">
            <button className="btn btn-sm"><Icon.Swap size={12} /> Swap A↔B</button>
            <button className="btn btn-sm"><Icon.Save size={12} /> Save comparison</button>
            <button className="btn btn-sm btn-primary"><Icon.Play size={11} /> Run all</button>
          </div>
        }
      />
      <div className="content">

        <div className="panel" style={{marginBottom: 16}}>
          <div className="panel-body" style={{display: 'flex', alignItems: 'center', gap: 12}}>
            <span className="text-xs text-muted mono" style={{letterSpacing:'0.06em', textTransform:'uppercase'}}>Prompt</span>
            <input className="input"
              style={{flex: 1, background: 'transparent', border: 'none', fontSize: 15, padding: '4px 0'}}
              value={question} onChange={e => setQuestion(e.target.value)} />
            <button className="btn btn-sm btn-accent"><Icon.Play size={11} /> Run both</button>
          </div>
        </div>

        <div className={`compare-grid ${cols}`}>
          <VariantCard label="Variant A" badgeClass="badge-a" cfg={cfgA} setCfg={setCfgA}
            answer={COMPARE_ANSWERS.A} onEditParams={() => setShowEditA(!showEditA)} domain={domain} />
          <VariantCard label="Variant B" badgeClass="badge-b" cfg={cfgB} setCfg={setCfgB}
            answer={COMPARE_ANSWERS.B} onEditParams={() => setShowEditB(!showEditB)} domain={domain} />
          {layoutCols === 4 && (
            <>
              <VariantCard label="Variant C" badgeClass="badge-b" cfg={cfgC} setCfg={setCfgC}
                answer={{ text: 'A staged rollout approach — canary first, then full promotion. Rollbacks are owned by the on-call engineer [1][3].', citations: [1,3] }}
                onEditParams={() => {}} domain={domain} />
              <VariantCard label="Variant D" badgeClass="badge-b" cfg={cfgD} setCfg={setCfgD}
                answer={{ text: 'Rollback within 10 min of canary failure; oncall owns the decision. The window was extended after a post-mortem analysis [1][2].', citations: [1,2] }}
                onEditParams={() => {}} domain={domain} />
            </>
          )}
        </div>

        {showEditA && (
          <div style={{marginTop: 16, maxWidth: 520}}>
            <PipelinePanel cfg={cfgA} setCfg={setCfgA} title="Variant A · params" compact />
          </div>
        )}
        {showEditB && (
          <div style={{marginTop: 16, maxWidth: 520}}>
            <PipelinePanel cfg={cfgB} setCfg={setCfgB} title="Variant B · params" compact />
          </div>
        )}

        <div className="panel" style={{marginTop: 20}}>
          <div className="panel-header">
            <div className="panel-title">Diff · what changed between A and B</div>
          </div>
          <div className="panel-body text-sm">
            <div className="vstack" style={{gap: 10}}>
              <div className="hstack" style={{gap: 16}}>
                <div style={{minWidth: 110}} className="text-muted">Model</div>
                <div><span className="diff-rem mono">{cfgA.model}</span> → <span className="diff-add mono">{cfgB.model}</span></div>
              </div>
              <div className="hstack" style={{gap: 16}}>
                <div style={{minWidth: 110}} className="text-muted">Temperature</div>
                <div><span className="diff-rem mono">{cfgA.temperature.toFixed(2)}</span> → <span className="diff-add mono">{cfgB.temperature.toFixed(2)}</span></div>
              </div>
              <div className="hstack" style={{gap: 16}}>
                <div style={{minWidth: 110}} className="text-muted">Retrieval k</div>
                <div><span className="diff-rem mono">{cfgA.retrievalK}</span> → <span className="diff-add mono">{cfgB.retrievalK}</span></div>
              </div>
              <div className="hstack" style={{gap: 16, alignItems: 'flex-start'}}>
                <div style={{minWidth: 110, paddingTop: 4}} className="text-muted">System prompt</div>
                <div className="mono text-xs" style={{flex: 1, lineHeight: 1.55}}>
                  <div className="diff-rem" style={{display:'block', padding:'4px 6px', marginBottom: 4}}>
                    {cfgA.systemPrompt.slice(0, 140)}…
                  </div>
                  <div className="diff-add" style={{display:'block', padding:'4px 6px'}}>
                    {cfgB.systemPrompt}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

window.CompareView = CompareView;
