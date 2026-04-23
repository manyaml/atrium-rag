// Animated SVG illustrations for the RAG dashboard

function PipelineIllustration() {
  // Pre-build vector grid dots
  const gridDots = [];
  const highlighted = new Set(['0-3','1-1','2-2','3-0']);
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const h = highlighted.has(`${r}-${c}`);
      gridDots.push(
        <circle key={`${r}-${c}`}
          cx={183 + c * 14} cy={48 + r * 14}
          r={h ? 4 : 2.5}
          fill={h ? '#C2704B' : '#C4BCAD'}
          opacity={h ? 1 : 0.65}
        />
      );
    }
  }

  return (
    <svg viewBox="0 0 400 158" fill="none" xmlns="http://www.w3.org/2000/svg"
         style={{width:'100%', maxWidth:400, height:'auto', display:'block'}}>

      {/* ── Document stack ── */}
      <g className="illu-float">
        <rect x="18" y="38" width="78" height="94" rx="5" fill="#E8E3D8" stroke="#D9D3C3"/>
        <rect x="26" y="28" width="78" height="94" rx="5" fill="#EEE9DC" stroke="#D9D3C3"/>
        {/* Front doc with folded corner */}
        <path d="M34 18 H106 L116 28 V122 H34 Z" fill="#F5F2EB" stroke="#C2704B" strokeWidth="1.5"/>
        <path d="M106 18 L106 28 L116 28" stroke="#C2704B" strokeWidth="1.5" fill="#EEE9DC"/>
        {/* Text lines */}
        <line x1="46" y1="44" x2="104" y2="44" stroke="#D9D3C3" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="46" y1="55" x2="104" y2="55" stroke="#D9D3C3" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="46" y1="66" x2="84" y2="66" stroke="#D9D3C3" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="46" y1="77" x2="96" y2="77" stroke="#E4DFD0" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="46" y1="88" x2="78" y2="88" stroke="#E4DFD0" strokeWidth="1.5" strokeLinecap="round"/>
        {/* TXT chip */}
        <rect x="46" y="29" width="22" height="8" rx="2" fill="#C2704B" opacity="0.18"/>
        <text x="47" y="36" fontSize="5.5" fill="#C2704B" fontFamily="monospace" letterSpacing="0.5">TXT</text>
      </g>
      <text x="75" y="135" fontSize="7.5" fill="#948E7E" textAnchor="middle" fontFamily="monospace" letterSpacing="1">CORPUS</text>

      {/* ── Arrow 1 ── */}
      <path d="M124 70 L162 70" stroke="#D9D3C3" strokeWidth="1.5" strokeDasharray="5 4" className="illu-dash"/>
      <path d="M158 66 L166 70 L158 74" stroke="#C2704B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="143" cy="57" r="3" fill="#C2704B" opacity="0.45" className="illu-blink"/>
      <circle cx="143" cy="83" r="2" fill="#948E7E" opacity="0.3" className="illu-blink-b"/>

      {/* ── Vector embedding grid ── */}
      <g className="illu-float-b">
        <rect x="169" y="30" width="72" height="78" rx="8" fill="#EEE9DC" stroke="#D9D3C3"/>
        {gridDots}
      </g>
      <text x="205" y="122" fontSize="7.5" fill="#948E7E" textAnchor="middle" fontFamily="monospace" letterSpacing="1">VECTORS</text>

      {/* ── Arrow 2 ── */}
      <path d="M249 70 L283 70" stroke="#D9D3C3" strokeWidth="1.5" strokeDasharray="5 4" className="illu-dash"/>
      <path d="M279 66 L287 70 L279 74" stroke="#C2704B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="266" cy="56" r="2.5" fill="#C2704B" opacity="0.35" className="illu-blink-c"/>
      <circle cx="266" cy="84" r="2" fill="#948E7E" opacity="0.25" className="illu-blink"/>

      {/* ── LLM / Response node ── */}
      <g className="illu-float-c">
        <circle cx="334" cy="62" r="44" stroke="#C2704B" strokeWidth="1" fill="none" opacity="0.1" className="illu-ring"/>
        <circle cx="334" cy="62" r="33" stroke="#C2704B" strokeWidth="1" fill="none" opacity="0.18" className="illu-ring"/>
        <circle cx="334" cy="62" r="24" fill="#E8CFBF" stroke="#C2704B" strokeWidth="1.5" opacity="0.55"/>
        <circle cx="334" cy="62" r="16" fill="#F5F2EB" stroke="#C2704B" strokeWidth="1.5"/>
        {/* Star in center */}
        <path d="M334 51 L335.8 59 L344 60 L335.8 62 L334 70 L332.2 62 L324 60 L332.2 59 Z" fill="#C2704B"/>
        {/* Answer chip */}
        <rect x="307" y="98" width="54" height="20" rx="10" fill="#C2704B"/>
        <path d="M327 98 L334 90 L341 98" fill="#C2704B"/>
        <line x1="316" y1="108" x2="352" y2="108" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.9"/>
      </g>
      <text x="334" y="132" fontSize="7.5" fill="#948E7E" textAnchor="middle" fontFamily="monospace" letterSpacing="1">RESPONSE</text>

      {/* Decorative dots */}
      <circle cx="370" cy="38" r="2" fill="#C2704B" opacity="0.25" className="illu-blink-b"/>
      <circle cx="298" cy="112" r="2.5" fill="#C2704B" opacity="0.3" className="illu-blink-c"/>
    </svg>
  );
}


function SearchIllustration() {
  return (
    <svg viewBox="0 0 200 168" fill="none" xmlns="http://www.w3.org/2000/svg"
         style={{width:180, height:151, display:'block', margin:'0 auto'}}>

      {/* Back-left doc */}
      <g transform="rotate(-14 52 98)">
        <g className="illu-float-c">
          <rect x="20" y="58" width="64" height="80" rx="5" fill="#EEE9DC" stroke="#D9D3C3"/>
          <line x1="30" y1="76" x2="74" y2="76" stroke="#D9D3C3" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="30" y1="86" x2="74" y2="86" stroke="#D9D3C3" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="30" y1="96" x2="56" y2="96" stroke="#E4DFD0" strokeWidth="1.5" strokeLinecap="round"/>
        </g>
      </g>

      {/* Back-right doc */}
      <g transform="rotate(12 148 98)">
        <g className="illu-float-b">
          <rect x="116" y="58" width="64" height="80" rx="5" fill="#EEE9DC" stroke="#D9D3C3"/>
          <line x1="126" y1="76" x2="170" y2="76" stroke="#D9D3C3" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="126" y1="86" x2="170" y2="86" stroke="#D9D3C3" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="126" y1="96" x2="152" y2="96" stroke="#E4DFD0" strokeWidth="1.5" strokeLinecap="round"/>
        </g>
      </g>

      {/* Front center doc */}
      <g className="illu-float">
        <rect x="68" y="44" width="64" height="82" rx="5" fill="#F5F2EB" stroke="#C2704B" strokeWidth="1.5"/>
        <line x1="80" y1="62" x2="120" y2="62" stroke="#D9D3C3" strokeWidth="1.5" strokeLinecap="round"/>
        {/* Highlighted match */}
        <rect x="80" y="70" width="40" height="7" rx="2" fill="#C2704B" opacity="0.18"/>
        <line x1="80" y1="73" x2="120" y2="73" stroke="#C2704B" strokeWidth="1.5" strokeLinecap="round" opacity="0.55"/>
        <line x1="80" y1="84" x2="104" y2="84" stroke="#D9D3C3" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="80" y1="94" x2="114" y2="94" stroke="#E4DFD0" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="80" y1="104" x2="100" y2="104" stroke="#E4DFD0" strokeWidth="1.5" strokeLinecap="round"/>
      </g>

      {/* Magnifying glass */}
      <g className="illu-float" style={{animationDelay:'0.4s'}}>
        {/* Glow */}
        <circle cx="106" cy="70" r="26" fill="#E8CFBF" opacity="0.22"/>
        {/* Lens ring */}
        <circle cx="106" cy="70" r="20" fill="none" stroke="#C2704B" strokeWidth="2.5"/>
        {/* Inner tint */}
        <circle cx="106" cy="70" r="17" fill="#C2704B" opacity="0.07"/>
        {/* Handle */}
        <line x1="120" y1="84" x2="135" y2="99" stroke="#C2704B" strokeWidth="3.5" strokeLinecap="round"/>
        {/* Shine arc */}
        <path d="M96 60 Q100 55 106 55" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.55"/>
      </g>

      {/* Sparkle top-left */}
      <g className="illu-blink">
        <path d="M38 38 L40.2 31 L42.4 38 L49 40 L42.4 42 L40.2 49 L38 42 L31 40 Z"
          fill="#C2704B" opacity="0.6"/>
      </g>
      {/* Sparkle bottom-right */}
      <g className="illu-blink-b">
        <path d="M158 130 L159.6 124 L161.2 130 L167 131.5 L161.2 133 L159.6 139 L158 133 L152 131.5 Z"
          fill="#948E7E" opacity="0.5"/>
      </g>
      {/* Dots */}
      <circle cx="155" cy="46" r="3"   fill="#C2704B" opacity="0.4"  className="illu-blink-c"/>
      <circle cx="44"  cy="132" r="2.5" fill="#C2704B" opacity="0.3" className="illu-blink"/>
      <circle cx="172" cy="78" r="2"   fill="#948E7E" opacity="0.35" className="illu-blink-b"/>
    </svg>
  );
}

window.PipelineIllustration = PipelineIllustration;
window.SearchIllustration   = SearchIllustration;
