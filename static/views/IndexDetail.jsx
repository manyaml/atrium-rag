// Index detail view — visual single-scroll layout, no tabs

const { useState: useSD } = React;

// Connector/store color tokens
const CONNECTOR_COLOR = { sharepoint:'#0078D4', confluence:'#0052CC', s3:'#FF9900', gdrive:'#34A853', notion:'#000', jira:'#0052CC', salesforce:'#00A1E0', gitlab:'#FC6D26', 'web-crawler':'#6B8AA8', sql:'#336791' };
const STORE_COLOR = { weaviate:'#00D6A0', qdrant:'#DC244C', pinecone:'#5436DA', opensearch:'#005EB8', pgvector:'#336791' };
const TYPE_COLOR  = { pdf:'#C2704B', docx:'#2B579A', md:'#5A7A4E', xlsx:'#217346', pptx:'#D24726', txt:'#8B7355', html:'#E34C26' };

function PipelineFlow({ ix }) {
  const nodes = [
    { label: ix.connector, sub: 'connector', color: CONNECTOR_COLOR[ix.connector] || '#888' },
    { label: ix.splitter,  sub: `${ix.chunkSize}t / ${ix.chunkOverlap}t`,  color: '#B07B2C' },
    { label: ix.embedder.split('-').slice(0,3).join('-'), sub: `dim ${ix.vectorDim}`, color: '#7A8454' },
    { label: ix.vectorStore, sub: ix.version, color: STORE_COLOR[ix.vectorStore] || '#888' },
  ];
  return (
    <div style={{display:'flex', alignItems:'center', gap:0, marginBottom:20, overflowX:'auto', paddingBottom:4}}>
      {nodes.map((n, i) => (
        <React.Fragment key={i}>
          <div style={{
            flexShrink:0, minWidth:110, padding:'10px 12px',
            border:`1px solid ${n.color}44`,
            borderRadius:6,
            background:`${n.color}10`,
          }}>
            <div style={{width:8,height:8,borderRadius:'50%',background:n.color,marginBottom:5}} />
            <div style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--ink)',fontWeight:500,letterSpacing:'-0.01em',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',maxWidth:120}}>{n.label}</div>
            <div style={{fontFamily:'var(--font-mono)',fontSize:10,color:'var(--ink-4)',marginTop:2}}>{n.sub}</div>
          </div>
          {i < nodes.length - 1 && (
            <div style={{flexShrink:0,display:'flex',alignItems:'center',padding:'0 4px',color:'var(--ink-4)'}}>
              <svg width="20" height="12" viewBox="0 0 20 12" fill="none">
                <path d="M0 6h16M12 2l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function DocTypeDonut({ docs }) {
  // Build type counts from INDEX_DOCS sample
  const counts = INDEX_DOCS.reduce((a, d) => { a[d.type] = (a[d.type]||0) + 1; return a; }, {});
  const entries = Object.entries(counts).sort((a,b) => b[1]-a[1]);
  const total = entries.reduce((s,[,v])=>s+v,0);

  const r=26, cx=32, cy=32, c=2*Math.PI*r;
  let offset=0;
  const segments = entries.map(([type, v]) => {
    const len=(v/total)*c;
    const seg = { type, v, color: TYPE_COLOR[type]||'#999', len, offset };
    offset+=len;
    return seg;
  });

  return (
    <div style={{display:'flex',gap:16,alignItems:'center'}}>
      <svg width="64" height="64" viewBox="0 0 64 64" style={{flexShrink:0,transform:'rotate(-90deg)'}}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--line)" strokeWidth="8"/>
        {segments.map((s,i)=>(
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={s.color} strokeWidth="8"
            strokeDasharray={`${s.len} ${c-s.len}`}
            strokeDashoffset={-s.offset}/>
        ))}
      </svg>
      <div style={{display:'flex',flexWrap:'wrap',gap:'4px 12px'}}>
        {entries.map(([type,v])=>(
          <div key={type} style={{display:'flex',alignItems:'center',gap:5,fontFamily:'var(--font-mono)',fontSize:10.5,color:'var(--ink-2)'}}>
            <span style={{width:7,height:7,borderRadius:2,background:TYPE_COLOR[type]||'#999',display:'inline-block',flexShrink:0}}/>
            .{type} <span style={{color:'var(--ink-4)'}}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TokenBar({ tokens, maxTokens }) {
  const pct = maxTokens ? Math.max(4, (tokens/maxTokens)*100) : 0;
  return (
    <div style={{height:3,background:'var(--line)',borderRadius:999,overflow:'hidden',flex:1,minWidth:40}}>
      <div style={{height:'100%',width:`${pct}%`,background:'var(--accent)',borderRadius:999,opacity:0.7}}/>
    </div>
  );
}

function RunDots({ ix }) {
  const runs = [0,1,2,3,4].map(i => ({
    job: `#${parseInt(ix.lastJob.slice(1)) - i*3}`,
    status: i===0 ? ix.status : (i===2 ? 'failed' : 'success'),
    when: i===0 ? ix.lastUpdate : `${i+1}d ago`,
    dur: i===0 ? ix.lastDuration : `${5+i*2}m ${i*7}s`,
  }));
  const colors = { success:'#5A7A4E', failed:'#A84632', running:'var(--accent)', queued:'#B07B2C' };
  return (
    <div style={{display:'flex',gap:6,alignItems:'flex-end',marginTop:2}}>
      {runs.map((r,i)=>(
        <div key={i} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4,flex:1}}>
          <div style={{fontFamily:'var(--font-mono)',fontSize:9,color:'var(--ink-4)',whiteSpace:'nowrap'}}>{r.dur}</div>
          <div style={{
            width:'100%', height: i===0?36:28+i*2,
            borderRadius:3,
            background: colors[r.status]||'#999',
            opacity: i===0?1:0.55+i*0.08,
            minWidth:18,
          }}/>
          <div style={{fontFamily:'var(--font-mono)',fontSize:9,color:'var(--ink-4)'}}>{r.when}</div>
          <div style={{fontFamily:'var(--font-mono)',fontSize:9,color: colors[r.status],textTransform:'capitalize'}}>{r.status}</div>
        </div>
      ))}
    </div>
  );
}

function MetaGrid({ ix }) {
  const items = [
    ['Owner',    ix.owner],
    ['Created',  ix.createdAt],
    ['Schedule', ix.schedule],
    ['Source',   ix.sourceUri],
    ['Last sync',ix.lastUpdate + ' · ' + ix.lastDuration],
    ['Tags',     ix.tags.join(', ')],
  ];
  return (
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px 20px'}}>
      {items.map(([k,v])=>(
        <div key={k}>
          <div style={{fontSize:9.5,letterSpacing:'0.07em',textTransform:'uppercase',color:'var(--ink-4)',marginBottom:2}}>{k}</div>
          <div style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--ink-2)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}} title={v}>{v}</div>
        </div>
      ))}
    </div>
  );
}

function IndexDetailView({ id, onBack }) {
  const ix = INDEXES.find(x => x.id === id) || INDEXES[0];
  const [yaml, setYaml] = useSD(HAYSTACK_YAML);
  const [dirty, setDirty] = useSD(false);
  const [triggered, setTriggered] = useSD(false);

  const maxTokens = Math.max(...INDEX_DOCS.map(d=>d.tokens||0));
  const statusColors = { success:'#5A7A4E', failed:'#A84632', running:'var(--accent)', queued:'#B07B2C' };

  return (
    <>
      <Topbar title="Index" crumbs={[
        <span key="b" style={{cursor:'pointer'}} onClick={onBack} className="muted">Indexes</span>,
        ix.name
      ]}
        right={
          <div className="hstack">
            <span className="badge"><span className="dot" />{ix.lastJob}</span>
            <button className="btn btn-sm"><Icon.Refresh size={12} /> Reindex</button>
          </div>
        }
      />
      <div className="content">

        {/* Hero */}
        <div style={{display:'flex',alignItems:'flex-end',gap:20,paddingBottom:16,marginBottom:16,borderBottom:'1px solid var(--line-soft)',flexWrap:'wrap'}}>
          <div style={{flex:1,minWidth:240}}>
            <button className="btn btn-sm btn-ghost" onClick={onBack} style={{marginBottom:8}}>
              <span style={{display:'inline-flex',transform:'rotate(180deg)'}}><Icon.Arrow size={12}/></span> Back to Indexes
            </button>
            <h1 className="detail-title">{ix.name}</h1>
            <div className="detail-sub">{ix.id} · {ix.version} · {ix.connector}</div>
          </div>
          {/* Stat chips */}
          <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
            {[
              { label:'Status',    val: <span className={`status s-${ix.status}`}><span className="dot"/>{ix.status}</span>, bg: `${statusColors[ix.status]}18` },
              { label:'Documents', val: ix.docs.toLocaleString(),   bg:'var(--paper-2)' },
              { label:'Chunks',    val: ix.chunks.toLocaleString(), bg:'var(--paper-2)' },
              { label:'Size',      val: `${ix.sizeMb} MB`,          bg:'var(--paper-2)' },
            ].map(s=>(
              <div key={s.label} style={{padding:'8px 14px',border:'1px solid var(--line)',borderRadius:6,background:s.bg,minWidth:90}}>
                <div style={{fontSize:9.5,letterSpacing:'0.07em',textTransform:'uppercase',color:'var(--ink-4)',marginBottom:3}}>{s.label}</div>
                <div style={{fontFamily:'var(--font-serif)',fontSize:18,lineHeight:1}}>{s.val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Two-column main */}
        <div className="idx-detail">

          {/* LEFT — visual panels */}
          <div style={{display:'flex',flexDirection:'column',gap:16}}>

            {/* Pipeline flow */}
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">Ingestion pipeline</div>
                <span className="text-xs mono text-faint">{ix.connector} → embed → {ix.vectorStore}</span>
              </div>
              <div className="panel-body" style={{paddingBottom:12}}>
                <PipelineFlow ix={ix}/>
                <MetaGrid ix={ix}/>
              </div>
            </div>

            {/* Docs + type breakdown */}
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">Documents · {ix.docs.toLocaleString()}</div>
                <button className="btn btn-sm btn-ghost"><Icon.Search size={12}/> Search</button>
              </div>
              <div className="panel-body" style={{paddingTop:10}}>
                <DocTypeDonut docs={INDEX_DOCS}/>
                <div style={{marginTop:14,display:'flex',flexDirection:'column',gap:1}}>
                  {INDEX_DOCS.map((d,i)=>(
                    <div key={i} style={{display:'grid',gridTemplateColumns:'28px 1fr auto',gap:8,alignItems:'center',padding:'5px 0',borderTop:i>0?'1px solid var(--line-soft)':'none'}}>
                      <div style={{width:28,height:22,borderRadius:3,background:TYPE_COLOR[d.type]||'var(--paper-2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:8.5,fontFamily:'var(--font-mono)',color:'#fff',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.03em'}}>
                        {d.type}
                      </div>
                      <div>
                        <div style={{fontSize:12,fontFamily:'var(--font-serif)',color:'var(--ink)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',maxWidth:260}}>{d.name}</div>
                        <div style={{display:'flex',alignItems:'center',gap:6,marginTop:3}}>
                          <TokenBar tokens={d.tokens||0} maxTokens={maxTokens}/>
                          <span style={{fontFamily:'var(--font-mono)',fontSize:9.5,color:'var(--ink-4)',whiteSpace:'nowrap'}}>{d.tokens?d.tokens.toLocaleString()+'t':'—'}</span>
                        </div>
                      </div>
                      <div style={{fontFamily:'var(--font-mono)',fontSize:10,color:'var(--ink-4)',textAlign:'right'}}>
                        <div>{d.size}</div>
                        <div style={{marginTop:1,color:'var(--ink-5,var(--ink-4))'}}>{d.updated}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Run history */}
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">Run history · last 5</div>
                <span className="text-xs mono text-faint">{ix.lastJob}</span>
              </div>
              <div className="panel-body" style={{paddingTop:10}}>
                <RunDots ix={ix}/>
              </div>
            </div>

          </div>

          {/* RIGHT — groovy config + trigger */}
          <div className="vstack" style={{gap:14}}>
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">Ingestion pipeline · groovy</div>
                <span className="text-xs mono text-faint">{ix.id}.groovy</span>
              </div>
              <div className="panel-body">
                <textarea
                  className="code"
                  style={{width:'100%',border:'none',padding:0,background:'transparent',resize:'vertical',minHeight:360,color:'var(--ink-2)'}}
                  value={yaml}
                  onChange={e=>{ setYaml(e.target.value); setDirty(true); }}
                />
              </div>
            </div>

            <div className="panel">
              <div className="panel-header"><div className="panel-title">Trigger pipeline</div></div>
              <div className="panel-body">
                {!triggered ? (
                  <>
                    <p className="text-sm text-muted" style={{margin:'0 0 12px'}}>
                      {dirty ? 'Saving will commit changes to the config repo and trigger a Jenkins build.' : 'No pending changes. You can still manually trigger a re-ingestion run.'}
                    </p>
                    <div className="hstack" style={{gap:8,flexWrap:'wrap'}}>
                      <button className="btn btn-sm" disabled={!dirty} style={{opacity:dirty?1:0.5}}>
                        <Icon.Save size={12}/> Save & PR
                      </button>
                      <button className="btn btn-sm btn-accent" onClick={()=>setTriggered(true)}>
                        <Icon.Play size={11}/> Trigger Jenkins
                      </button>
                      <button className="btn btn-sm btn-ghost" onClick={()=>{ setYaml(HAYSTACK_YAML); setDirty(false); }}>
                        <Icon.Refresh size={12}/> Reset
                      </button>
                    </div>
                    <div style={{marginTop:14,padding:10,background:'var(--paper-2)',borderRadius:4,fontFamily:'var(--font-mono)',fontSize:11,color:'var(--ink-3)'}}>
                      jenkins://ci/job/rag-ingestion/build?index={ix.id}
                    </div>
                  </>
                ) : (
                  <div className="vstack" style={{gap:8}}>
                    <div className="hstack" style={{gap:10}}>
                      <span className="status s-running"><span className="dot"/>Running</span>
                      <span className="text-xs text-muted">Build #{parseInt(ix.lastJob.slice(1))+3}</span>
                    </div>
                    <div className="text-xs text-muted">Started just now · estimated 4–6 min</div>
                    <div className="hstack" style={{marginTop:8,gap:8}}>
                      <button className="btn btn-sm">View build logs</button>
                      <button className="btn btn-sm btn-ghost" onClick={()=>setTriggered(false)}>Dismiss</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

window.IndexDetailView = IndexDetailView;
