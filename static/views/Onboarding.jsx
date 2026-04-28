// Onboarding wizard — connector pick + deep config + review + completion

const { useState: useSO } = React;

const STEPS = [
  { id: 'basics',    label: 'Basics' },
  { id: 'connector', label: 'Connector' },
  { id: 'configure', label: 'Configure' },
  { id: 'pipeline',  label: 'Pipeline' },
  { id: 'review',    label: 'Review' },
];

function HowTo({ step }) {
  const docs = {
    basics: {
      title: 'Naming your index',
      steps: [
        'Use a short, descriptive name — it becomes the index identifier.',
        'Pick the domain that owns this knowledge base.',
        'Tags help others discover the index in the catalog.',
      ],
      link: 'docs/index-naming-conventions',
    },
    connector: {
      title: 'Choosing a connector',
      steps: [
        'Pick the system where your source documents already live.',
        'Each connector has its own auth model — SSO, API tokens, or service accounts.',
        'You can add multiple connectors to one index later.',
      ],
      link: 'docs/connectors/overview',
    },
    configure: {
      title: 'SharePoint configuration',
      steps: [
        'Site URL is the full https://… site path.',
        'Document library and folder paths can use globs (e.g. /Policies/**/*.docx).',
        'Filters (file type, modified date) apply during incremental sync.',
        'OAuth credentials should be from a service principal with read-only access.',
      ],
      link: 'docs/connectors/sharepoint',
    },
    pipeline: {
      title: 'Ingestion pipeline',
      steps: [
        'Splitter chunks documents — recursive works for most prose.',
        'Embedding model determines retrieval quality and cost.',
        'Vector store is where chunks are persisted for retrieval.',
        'Schedule controls when Jenkins re-runs the pipeline.',
      ],
      link: 'docs/pipelines/haystack-config',
    },
    review: {
      title: 'What happens next',
      steps: [
        'A pull request is opened in the rag-configs repo.',
        'CI validates the YAML against the haystack schema.',
        'On auto-merge, Jenkins kicks off a first ingestion run.',
        'You\'ll get a Slack ping when the index is queryable.',
      ],
      link: 'docs/pipelines/onboarding-pr-flow',
    },
  };
  const d = docs[step];
  return (
    <aside className="howto">
      <div className="ico-row">How to · step {STEPS.findIndex(s => s.id === step) + 1}</div>
      <h4>{d.title}</h4>
      <hr />
      {d.steps.map((s, i) => (
        <div key={i} className="step">
          <div className="n">{String(i + 1).padStart(2, '0')}</div>
          <div className="t">{s}</div>
        </div>
      ))}
      <hr />
      <a className="doc-link" href="#"><Icon.Doc size={12} /> {d.link}</a>
    </aside>
  );
}

function OnboardingView({ onCancel, onComplete }) {
  const [stepIdx, setStepIdx] = useSO(0);
  const [form, setForm] = useSO({
    name: '', identifier: '', tags: '', owner: 'aisha.rao',
    connector: '', siteUrl: '', library: 'Documents', folder: '/',
    fileTypes: ['pdf','docx','md'], includeShared: true, recursive: true,
    splitter: 'recursive', chunkSize: 512, chunkOverlap: 64,
    embedder: 'text-embedding-3-large', vectorStore: 'weaviate',
    schedule: 'Daily 02:00 UTC', autoMerge: true,
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const next = () => setStepIdx(Math.min(stepIdx + 1, STEPS.length));
  const back = () => setStepIdx(Math.max(stepIdx - 1, 0));

  if (stepIdx >= STEPS.length) {
    // Completion
    return (
      <>
        <Topbar title="New index" right={<button className="btn btn-sm btn-ghost" onClick={onComplete}><Icon.Close size={12} /> Close</button>} />
        <div className="content">
          <div className="completion">
            <div className="check"><Icon.Save size={26} /></div>
            <h2>Pull request created</h2>
            <p>Your index <strong>{form.name || 'new-index'}</strong> is on its way.
              The PR is set to auto-merge once CI passes; Jenkins will run the first ingestion automatically.</p>

            <div className="pr-card">
              <div className="pr-icon"><Icon.Doc size={18} /></div>
              <div style={{flex: 1}}>
                <div className="pr-title">feat(indexes): add {form.identifier || (form.name || 'new-index').toLowerCase().replace(/\s+/g, '-')} ingestion pipeline</div>
                <div className="pr-meta">rag-configs#1284 · auto-merge enabled · 2 reviewers required</div>
              </div>
              <span className="status s-running"><span className="dot" />CI running</span>
            </div>

            <div className="links">
              <button className="btn btn-sm">View pull request</button>
              <button className="btn btn-sm">Watch Jenkins build</button>
              <button className="btn btn-sm btn-primary" onClick={onComplete}>Back to indexes</button>
            </div>
          </div>
        </div>
      </>
    );
  }

  const step = STEPS[stepIdx].id;

  return (
    <>
      <Topbar title="New index"
        crumbs={[<span key="b" className="muted" style={{cursor:'pointer'}} onClick={onCancel}>Indexes</span>, 'Onboarding']}
        right={<button className="btn btn-sm btn-ghost" onClick={onCancel}><Icon.Close size={12} /> Cancel</button>}
      />
      <div className="content">
        <div className="wizard">

          <div className="wizard-stepper">
            {STEPS.map((s, i) => (
              <div key={s.id} className={`wizard-step ${i === stepIdx ? 'active' : ''} ${i < stepIdx ? 'done' : ''}`}>
                <div className="num">{i < stepIdx ? '✓' : i + 1}</div>
                <div className="label">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="wizard-body">
            <div>
              {step === 'basics' && (
                <>
                  <h2 className="wizard-step-title">Name your index</h2>
                  <p className="wizard-step-sub">Pick a short, human-readable name. The identifier is used in API calls and the haystack config.</p>

                  <div className="form-grid">
                    <div className="field">
                      <div className="field-label">Name</div>
                      <input className="input" placeholder="e.g. HR Policies" value={form.name}
                        onChange={e => {
                          const v = e.target.value;
                          setForm(f => ({
                            ...f,
                            name: v,
                            // auto-generate identifier from name, but only if user hasn't manually edited it
                            identifier: (!f.identifier || f.identifier === f.name.toLowerCase().replace(/\s+/g, '-'))
                              ? v.toLowerCase().replace(/\s+/g, '-')
                              : f.identifier,
                          }));
                        }} />
                    </div>
                    <div className="field">
                      <div className="field-label">Identifier</div>
                      <input className="input input-mono" placeholder="hr-policies" value={form.identifier} onChange={e => set('identifier', e.target.value)} />
                    </div>
                    <div className="field">
                      <div className="field-label">Owner</div>
                      <select className="select" value={form.owner} onChange={e => set('owner', e.target.value)}>
                        <option>aisha.rao</option><option>martin.cole</option><option>priya.s</option><option>devon.h</option>
                      </select>
                    </div>
                    <div className="field">
                      <div className="field-label">Tags</div>
                      <input className="input" placeholder="policy, internal" value={form.tags} onChange={e => set('tags', e.target.value)} />
                    </div>
                  </div>
                </>
              )}

              {step === 'connector' && (
                <>
                  <h2 className="wizard-step-title">Where does the data live?</h2>
                  <p className="wizard-step-sub">Pick a connector. We'll guide you through the auth and source configuration in the next step.</p>

                  <div className="text-xs text-muted" style={{margin: '0 0 8px', letterSpacing: '0.06em', textTransform: 'uppercase'}}>Popular</div>
                  <div className="conn-grid" style={{marginBottom: 18}}>
                    {CONNECTOR_LIST.filter(c => c.popular).map(c => (
                      <button key={c.id} className={`conn-card ${form.connector === c.id ? 'active' : ''}`} onClick={() => set('connector', c.id)}>
                        <div className="conn-logo">{c.name.slice(0, 2)}</div>
                        <div className="conn-name">{c.name}</div>
                        <div className="conn-desc">{c.desc}</div>
                        <div className="conn-popular">popular</div>
                      </button>
                    ))}
                  </div>

                  <div className="text-xs text-muted" style={{margin: '0 0 8px', letterSpacing: '0.06em', textTransform: 'uppercase'}}>All connectors</div>
                  <div className="conn-grid">
                    {CONNECTOR_LIST.filter(c => !c.popular).map(c => (
                      <button key={c.id} className={`conn-card ${form.connector === c.id ? 'active' : ''}`} onClick={() => set('connector', c.id)}>
                        <div className="conn-logo">{c.name.slice(0, 2)}</div>
                        <div className="conn-name">{c.name}</div>
                        <div className="conn-desc">{c.desc}</div>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {step === 'configure' && (
                <>
                  <h2 className="wizard-step-title">{form.connector === 'sharepoint' ? 'Configure SharePoint source' : `Configure ${CONNECTOR_LIST.find(c => c.id === form.connector)?.name || 'source'}`}</h2>
                  <p className="wizard-step-sub">Tell the connector exactly where to find your documents. You can refine filters later.</p>

                  {form.connector === 'sharepoint' ? (
                    <>
                      <div className="form-grid full">
                        <div className="field">
                          <div className="field-label">Site URL</div>
                          <input className="input input-mono" placeholder="https://contoso.sharepoint.com/sites/HR" value={form.siteUrl} onChange={e => set('siteUrl', e.target.value)} />
                        </div>
                      </div>
                      <div className="form-grid" style={{marginTop: 14}}>
                        <div className="field">
                          <div className="field-label">Document library</div>
                          <select className="select" value={form.library} onChange={e => set('library', e.target.value)}>
                            <option>Documents</option><option>Shared Documents</option><option>Policies</option><option>Site Pages</option>
                          </select>
                        </div>
                        <div className="field">
                          <div className="field-label">Folder path</div>
                          <input className="input input-mono" value={form.folder} onChange={e => set('folder', e.target.value)} />
                        </div>
                      </div>
                      <div style={{marginTop: 18}}>
                        <div className="field-label" style={{marginBottom: 6}}>File types</div>
                        <div className="hstack" style={{flexWrap: 'wrap', gap: 6}}>
                          {['pdf','docx','xlsx','pptx','md','txt','html'].map(t => (
                            <button key={t} className={`chip ${form.fileTypes.includes(t) ? 'active' : ''}`}
                              onClick={() => set('fileTypes', form.fileTypes.includes(t) ? form.fileTypes.filter(x => x !== t) : [...form.fileTypes, t])}>
                              .{t}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div style={{marginTop: 18}}>
                        <div className="checkbox-row">
                          <input type="checkbox" id="rec" checked={form.recursive} onChange={e => set('recursive', e.target.checked)} />
                          <label htmlFor="rec">
                            <div className="ck-label">Recurse into subfolders</div>
                            <div className="ck-desc">Index every nested folder under the chosen path.</div>
                          </label>
                        </div>
                        <div className="checkbox-row">
                          <input type="checkbox" id="sh" checked={form.includeShared} onChange={e => set('includeShared', e.target.checked)} />
                          <label htmlFor="sh">
                            <div className="ck-label">Include shared-with-me items</div>
                            <div className="ck-desc">Pull in documents shared from other tenants or sites.</div>
                          </label>
                        </div>
                        <div className="checkbox-row">
                          <input type="checkbox" id="pii" />
                          <label htmlFor="pii">
                            <div className="ck-label">Apply PII redaction</div>
                            <div className="ck-desc">Run Microsoft Presidio on each document before embedding.</div>
                          </label>
                        </div>
                      </div>
                      <div style={{marginTop: 20, padding: 14, background: 'var(--paper-2)', borderRadius: 6, border: '1px solid var(--line-soft)'}}>
                        <div className="text-xs mono text-muted" style={{marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase'}}>OAuth · service principal</div>
                        <div className="form-grid">
                          <div className="field"><div className="field-label">Tenant ID</div><input className="input input-mono" placeholder="•••••-•••-•••" /></div>
                          <div className="field"><div className="field-label">Client ID</div><input className="input input-mono" placeholder="•••••-•••-•••" /></div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="panel"><div className="panel-body text-sm text-muted">
                      Configuration form for <strong>{CONNECTOR_LIST.find(c => c.id === form.connector)?.name || 'this connector'}</strong> would render here, with auth + source-path fields specific to that system.
                    </div></div>
                  )}
                </>
              )}

              {step === 'pipeline' && (
                <>
                  <h2 className="wizard-step-title">Pipeline & schedule</h2>
                  <p className="wizard-step-sub">Choose how documents are split, embedded, stored, and refreshed.</p>

                  <div className="form-grid">
                    <div className="field">
                      <div className="field-label">Splitter</div>
                      <select className="select" value={form.splitter} onChange={e => set('splitter', e.target.value)}>
                        <option value="recursive">recursive</option><option value="sentence">sentence</option>
                        <option value="token">token</option><option value="markdown">markdown</option>
                      </select>
                    </div>
                    <div className="field">
                      <div className="field-label">Embedder</div>
                      <select className="select" value={form.embedder} onChange={e => set('embedder', e.target.value)}>
                        <option>text-embedding-3-large</option><option>text-embedding-3-small</option>
                        <option>voyage-large-2</option><option>bge-large-en-v1.5</option>
                      </select>
                    </div>
                    <div className="field">
                      <div className="field-label"><span>Chunk size</span><span className="val">{form.chunkSize}</span></div>
                      <input className="range" type="range" min="128" max="2048" step="64" value={form.chunkSize} onChange={e => set('chunkSize', parseInt(e.target.value))} />
                    </div>
                    <div className="field">
                      <div className="field-label"><span>Overlap</span><span className="val">{form.chunkOverlap}</span></div>
                      <input className="range" type="range" min="0" max="512" step="16" value={form.chunkOverlap} onChange={e => set('chunkOverlap', parseInt(e.target.value))} />
                    </div>
                    <div className="field">
                      <div className="field-label">Vector store</div>
                      <select className="select" value={form.vectorStore} onChange={e => set('vectorStore', e.target.value)}>
                        <option>weaviate</option><option>qdrant</option><option>pinecone</option>
                        <option>opensearch</option><option>pgvector</option>
                      </select>
                    </div>
                    <div className="field">
                      <div className="field-label">Schedule</div>
                      <select className="select" value={form.schedule} onChange={e => set('schedule', e.target.value)}>
                        <option>Daily 02:00 UTC</option><option>Hourly</option>
                        <option>Weekly Sun 03:00</option><option>On-demand</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {step === 'review' && (
                <>
                  <h2 className="wizard-step-title">Review & submit</h2>
                  <p className="wizard-step-sub">We'll open a pull request in <code className="mono">rag-configs</code>. On merge, Jenkins runs the first ingestion automatically.</p>

                  <div className="review-block">
                    <h5>Basics <span className="edit" onClick={() => setStepIdx(0)}>edit</span></h5>
                    <div className="kv-list">
                      <div className="k">Name</div><div className="v serif">{form.name || '—'}</div>
                      <div className="k">Identifier</div><div className="v">{form.identifier || '—'}</div>
                      <div className="k">Owner</div><div className="v">{form.owner}</div>
                      <div className="k">Tags</div><div className="v">{form.tags || '—'}</div>
                    </div>
                  </div>
                  <div className="review-block">
                    <h5>Source <span className="edit" onClick={() => setStepIdx(2)}>edit</span></h5>
                    <div className="kv-list">
                      <div className="k">Connector</div><div className="v">{form.connector || '—'}</div>
                      {form.connector === 'sharepoint' && <>
                        <div className="k">Site</div><div className="v">{form.siteUrl || '—'}</div>
                        <div className="k">Library</div><div className="v">{form.library} {form.folder}</div>
                        <div className="k">File types</div><div className="v">{form.fileTypes.map(t => '.' + t).join(', ')}</div>
                      </>}
                    </div>
                  </div>
                  <div className="review-block">
                    <h5>Pipeline <span className="edit" onClick={() => setStepIdx(3)}>edit</span></h5>
                    <div className="kv-list">
                      <div className="k">Splitter</div><div className="v">{form.splitter} · {form.chunkSize}/{form.chunkOverlap}</div>
                      <div className="k">Embedder</div><div className="v">{form.embedder}</div>
                      <div className="k">Vector store</div><div className="v">{form.vectorStore}</div>
                      <div className="k">Schedule</div><div className="v">{form.schedule}</div>
                    </div>
                  </div>

                  <div className="checkbox-row" style={{marginTop: 18}}>
                    <input type="checkbox" id="am" checked={form.autoMerge} onChange={e => set('autoMerge', e.target.checked)} />
                    <label htmlFor="am">
                      <div className="ck-label">Auto-merge PR once CI passes</div>
                      <div className="ck-desc">Skip manual review. Recommended only for low-risk indexes.</div>
                    </label>
                  </div>
                </>
              )}

            </div>

            <HowTo step={step} />
          </div>

          <div className="wizard-nav">
            <button className="btn" onClick={stepIdx === 0 ? onCancel : back}>
              {stepIdx === 0 ? 'Cancel' : '← Back'}
            </button>
            <div className="hstack">
              <span className="text-xs text-muted">Step {stepIdx + 1} of {STEPS.length}</span>
              <button className="btn btn-accent" onClick={next}>
                {stepIdx === STEPS.length - 1 ? <>Open PR & trigger build <Icon.Arrow size={12} /></> : <>Continue <Icon.Arrow size={12} /></>}
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

window.OnboardingView = OnboardingView;
