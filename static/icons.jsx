// Minimal line icons — 16x16 default, currentColor
const Ico = ({ d, size = 16, stroke = 1.5, children }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none"
       stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    {d ? <path d={d} /> : children}
  </svg>
);

const Icon = {
  Send:     (p) => <Ico {...p}><path d="M2 8l12-5-5 12-2-5-5-2z" /></Ico>,
  Chat:     (p) => <Ico {...p}><path d="M2 3h12v8H6l-4 3V3z" /></Ico>,
  Compare:  (p) => <Ico {...p}><path d="M8 1v14M3 4h3M3 8h3M3 12h3M10 4h3M10 8h3M10 12h3" /></Ico>,
  Settings: (p) => <Ico {...p}><circle cx="8" cy="8" r="2.2" /><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.5 1.5M11.5 11.5L13 13M3 13l1.5-1.5M11.5 4.5L13 3" /></Ico>,
  History:  (p) => <Ico {...p}><path d="M3 8a5 5 0 105-5M3 8l-1.5-1.5M3 8l1.5-1.5M8 5v3l2 2" /></Ico>,
  Book:     (p) => <Ico {...p}><path d="M3 2h5a2 2 0 012 2v10H5a2 2 0 00-2 2V2zM13 2H8v12h5V2z" /></Ico>,
  Plus:     (p) => <Ico {...p}><path d="M8 3v10M3 8h10" /></Ico>,
  Close:    (p) => <Ico {...p}><path d="M4 4l8 8M12 4l-8 8" /></Ico>,
  Caret:    (p) => <Ico {...p}><path d="M6 3l5 5-5 5" /></Ico>,
  Chevron:  (p) => <Ico {...p}><path d="M4 6l4 4 4-4" /></Ico>,
  Copy:     (p) => <Ico {...p}><rect x="5" y="5" width="9" height="9" rx="1.5" /><path d="M10 5V3.5A1.5 1.5 0 008.5 2H3.5A1.5 1.5 0 002 3.5v5A1.5 1.5 0 003.5 10H5" /></Ico>,
  Refresh:  (p) => <Ico {...p}><path d="M14 3v4h-4M2 13V9h4M13 7a5 5 0 00-9-2M3 9a5 5 0 009 2" /></Ico>,
  ThumbUp:  (p) => <Ico {...p}><path d="M4 7v7H2V7h2zm0 0l3-5 1.5.5L8 5h4.5a1.5 1.5 0 011.4 2L12 13H4" /></Ico>,
  Search:   (p) => <Ico {...p}><circle cx="7" cy="7" r="4.5" /><path d="M10.5 10.5L14 14" /></Ico>,
  Save:     (p) => <Ico {...p}><path d="M3 2h8l3 3v9H3V2zM5 2v4h6V2M5 14v-5h6v5" /></Ico>,
  Split:    (p) => <Ico {...p}><path d="M2 3h5v10H2zM9 3h5v10H9z" /></Ico>,
  Doc:      (p) => <Ico {...p}><path d="M4 2h6l2 2v10H4V2zM9 2v3h3" /></Ico>,
  Arrow:    (p) => <Ico {...p}><path d="M3 8h10M9 4l4 4-4 4" /></Ico>,
  Play:     (p) => <Ico {...p}><path d="M5 3l7 5-7 5V3z" fill="currentColor" /></Ico>,
  Star:     (p) => <Ico {...p}><path d="M8 2l1.8 4 4.2.4-3.2 2.9 1 4.1L8 11.3 4.2 13.4l1-4.1L2 6.4 6.2 6z" /></Ico>,
  Swap:     (p) => <Ico {...p}><path d="M3 5h10M10 2l3 3-3 3M13 11H3M6 14l-3-3 3-3" /></Ico>,
  Layers:   (p) => <Ico {...p}><path d="M8 2l6 3-6 3-6-3 6-3zM2 8l6 3 6-3M2 11l6 3 6-3" /></Ico>,
  Hash:     (p) => <Ico {...p}><path d="M2 6h12M2 10h12M6 2l-1 12M11 2l-1 12" /></Ico>,
  Pulse:    (p) => <Ico {...p}><path d="M2 8h3l2-5 2 10 2-5h3" /></Ico>,
};

window.Icon = Icon;
