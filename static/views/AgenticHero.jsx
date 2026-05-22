// Agentic RAG Hero — animated constellation, shown above the composer in the empty playground state.
// Variant A (constellation): agent core pinned dead-center, knowledge sources in orbit, chunks pulsing inward.

const { useEffect: useHE, useRef: useHR, useState: useHS } = React;

// Suggested questions keyed by lowercased domain name (partial match)
const HERO_QDOMAIN = {
  engineering: [
    'What changed in Q3 incidents?',
    'Summarize the rollback cluster',
    'Show recent deploy failures',
    'Who owns the auth service?',
  ],
  support: [
    'Common reasons for refund denial',
    'Find similar tickets to #4821',
    'What\'s the SLA for enterprise?',
    'Draft a reply for billing dispute',
  ],
  legal: [
    'How do EU customer refunds work?',
    'Summarize our DPA template',
    'GDPR obligations for support team',
    'Are we SOC 2 Type II compliant?',
  ],
  sales: [
    'Summarize the last call with Acme',
    'Top 5 accounts by pipeline value',
    'Common objections this quarter',
    'Compare us vs Competitor X',
  ],
  product: [
    'What shipped last month?',
    'User feedback on onboarding',
    'Open bugs by severity',
    'Next sprint top priorities',
  ],
  research: [
    'Papers cited by our last 5 PRs',
    'Summarize findings on RAG benchmarks',
    'What\'s the state of multi-agent eval?',
    'Draft a literature review section',
  ],
};

const FALLBACK_QUESTIONS = [
  'What documents are in this knowledge base?',
  'Summarize the key topics covered.',
  'What are the most important policies?',
  'Find recent changes.',
];

function resolveQuestions(domainId, domainName) {
  const key = ((domainName || domainId) || '').toLowerCase();
  for (const k of Object.keys(HERO_QDOMAIN)) {
    if (key.includes(k)) return HERO_QDOMAIN[k];
  }
  return FALLBACK_QUESTIONS;
}

// Constellation SVG — variant A
function ConstellationSVG() {
  return (
    <svg className="rag-hero-svg" viewBox="0 0 880 280" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="rhCoreGlow">
          <stop offset="0%" stopColor="#e25a3c" stopOpacity=".55" />
          <stop offset="60%" stopColor="#e25a3c" stopOpacity=".05" />
          <stop offset="100%" stopColor="#e25a3c" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* expanding rings */}
      <circle className="rh-ring" cx="440" cy="140" r="50" fill="none" stroke="#e25a3c" strokeWidth="1" />
      <circle className="rh-ring rh-ring-2" cx="440" cy="140" r="50" fill="none" stroke="#e25a3c" strokeWidth="1" />
      <circle className="rh-ring rh-ring-3" cx="440" cy="140" r="50" fill="none" stroke="#e25a3c" strokeWidth="1" />

      {/* orbit guides */}
      <circle cx="440" cy="140" r="90" fill="none" stroke="#2a2e38" strokeWidth="1" strokeDasharray="2 4" opacity=".5" />
      <circle cx="440" cy="140" r="130" fill="none" stroke="#2a2e38" strokeWidth="1" strokeDasharray="2 4" opacity=".35" />

      {/* inner orbit — 4 source icons */}
      <g className="rh-orbit-a">
        {/* doc */}
        <g transform="translate(440,50)" className="rh-twinkle">
          <rect x="-14" y="-10" width="28" height="20" rx="3" fill="transparent" stroke="#a2a7b3" strokeWidth="1.25" />
          <line x1="-9" y1="-4" x2="7" y2="-4" stroke="#a2a7b3" strokeWidth="1" />
          <line x1="-9" y1="0" x2="9" y2="0" stroke="#a2a7b3" strokeWidth="1" />
          <line x1="-9" y1="4" x2="4" y2="4" stroke="#a2a7b3" strokeWidth="1" />
        </g>
        {/* db */}
        <g transform="translate(530,140)" className="rh-twinkle rh-twinkle-d2">
          <ellipse cx="0" cy="-6" rx="12" ry="3.5" fill="transparent" stroke="#a2a7b3" strokeWidth="1.25" />
          <path d="M-12 -6 v12 a12 3.5 0 0 0 24 0 v-12" fill="transparent" stroke="#a2a7b3" strokeWidth="1.25" />
          <path d="M-12 0 a12 3.5 0 0 0 24 0" fill="none" stroke="#a2a7b3" strokeWidth="1" />
        </g>
        {/* code/api */}
        <g transform="translate(440,230)" className="rh-twinkle rh-twinkle-d3">
          <rect x="-15" y="-10" width="30" height="20" rx="3" fill="transparent" stroke="#a2a7b3" strokeWidth="1.25" />
          <text fill="#a2a7b3" fontFamily='"JetBrains Mono", monospace' fontSize="9" x="-10" y="3">&lt;/&gt;</text>
        </g>
        {/* web */}
        <g transform="translate(350,140)" className="rh-twinkle rh-twinkle-d4">
          <circle cx="0" cy="0" r="11" fill="transparent" stroke="#a2a7b3" strokeWidth="1.25" />
          <ellipse cx="0" cy="0" rx="11" ry="4.5" fill="none" stroke="#a2a7b3" strokeWidth="1" />
          <line x1="-11" y1="0" x2="11" y2="0" stroke="#a2a7b3" strokeWidth="1" />
        </g>
      </g>

      {/* outer orbit — faint secondary icons */}
      <g className="rh-orbit-b">
        <g transform="translate(440,10)" className="rh-twinkle rh-twinkle-d3">
          <rect x="-12" y="-8" width="24" height="16" rx="2" fill="transparent" stroke="#6b7180" strokeWidth="1" />
          <line x1="-8" y1="-3" x2="6" y2="-3" stroke="#6b7180" strokeWidth="1" />
          <line x1="-8" y1="1" x2="8" y2="1" stroke="#6b7180" strokeWidth="1" />
        </g>
        <g transform="translate(570,140)" className="rh-twinkle">
          <rect x="-12" y="-8" width="24" height="16" rx="2" fill="transparent" stroke="#6b7180" strokeWidth="1" />
          <line x1="-8" y1="-3" x2="6" y2="-3" stroke="#6b7180" strokeWidth="1" />
          <line x1="-8" y1="1" x2="8" y2="1" stroke="#6b7180" strokeWidth="1" />
        </g>
        <g transform="translate(440,270)" className="rh-twinkle rh-twinkle-d4">
          <rect x="-12" y="-8" width="24" height="16" rx="2" fill="transparent" stroke="#6b7180" strokeWidth="1" />
          <line x1="-8" y1="-3" x2="6" y2="-3" stroke="#6b7180" strokeWidth="1" />
          <line x1="-8" y1="1" x2="8" y2="1" stroke="#6b7180" strokeWidth="1" />
        </g>
        <g transform="translate(310,140)" className="rh-twinkle rh-twinkle-d2">
          <rect x="-12" y="-8" width="24" height="16" rx="2" fill="transparent" stroke="#6b7180" strokeWidth="1" />
          <line x1="-8" y1="-3" x2="6" y2="-3" stroke="#6b7180" strokeWidth="1" />
          <line x1="-8" y1="1" x2="8" y2="1" stroke="#6b7180" strokeWidth="1" />
        </g>
      </g>

      {/* inward-flying chunks */}
      <g transform="translate(440,140)">
        <rect className="rh-chunk" x="-3" y="-3" width="6" height="6" fill="#e25a3c" style={{ '--dx': '0px', '--dy': '-86px', transformOrigin: '0 0' }} />
        <rect className="rh-chunk" x="-3" y="-3" width="6" height="6" fill="#e25a3c" style={{ '--dx': '86px', '--dy': '0px', animationDelay: '.9s', transformOrigin: '0 0' }} />
        <rect className="rh-chunk" x="-3" y="-3" width="6" height="6" fill="#e25a3c" style={{ '--dx': '0px', '--dy': '86px', animationDelay: '1.8s', transformOrigin: '0 0' }} />
        <rect className="rh-chunk" x="-3" y="-3" width="6" height="6" fill="#e25a3c" style={{ '--dx': '-86px', '--dy': '0px', animationDelay: '2.7s', transformOrigin: '0 0' }} />
      </g>

      {/* core — pinned dead-center */}
      <g transform="translate(440,140)">
        <circle r="56" fill="url(#rhCoreGlow)" />
        <circle r="28" fill="transparent" stroke="#e25a3c" strokeWidth="1.5" />
        <circle r="20" fill="none" stroke="#e25a3c" strokeWidth="1" opacity=".5" />
        {/* rotating spark */}
        <g className="rh-core-spin">
          <path d="M 0 -10 L 3 -3 L 10 0 L 3 3 L 0 10 L -3 3 L -10 0 L -3 -3 Z" fill="#e25a3c" />
        </g>
      </g>
    </svg>
  );
}

// Question chip with a small icon
function HeroChip({ question, icon, onSelect, delay }) {
  return (
    <button
      className="rh-chip"
      style={{ animationDelay: delay + 's' }}
      onClick={() => onSelect(question)}
    >
      <svg className="rh-chip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {icon === 'search' && (
          <>
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </>
        )}
        {icon === 'doc' && (
          <>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </>
        )}
      </svg>
      <span>{question}</span>
    </button>
  );
}

function AgenticHero({ domainId, domainName, onSelect }) {
  const questions = resolveQuestions(domainId, domainName);

  return (
    <div className="rh-wrap">
      {/* animated constellation */}
      <div className="rh-hero">
        <ConstellationSVG />
      </div>

      {/* suggested questions */}
      <div className="rh-questions">
        <span className="rh-hint">suggested questions</span>
        <div className="rh-chips">
          {questions.map((q, i) => (
            <HeroChip
              key={i}
              question={q}
              icon={i % 2 === 0 ? 'search' : 'doc'}
              onSelect={onSelect}
              delay={0.05 + i * 0.07}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

window.AgenticHero = AgenticHero;
