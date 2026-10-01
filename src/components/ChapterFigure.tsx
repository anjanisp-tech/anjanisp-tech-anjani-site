import type { ChapterSlug } from '../data/chapters';

/**
 * One line drawing per chapter of the Field Manual. Ink and the one blue,
 * drawn from currentColor so the same figure works on paper and on the ink
 * footer. Each shows the mechanism of the disease, not a metaphor for it.
 * `size="thumb"` is the contents-page thumbnail; default is the chapter head.
 */
export default function ChapterFigure({
  slug,
  size = 'full',
  className = '',
}: {
  slug: ChapterSlug;
  size?: 'full' | 'thumb';
  className?: string;
}) {
  const ink = 'currentColor';
  const blue = '#1f3bc4';
  const common = {
    viewBox: '0 0 240 150',
    role: 'img' as const,
    className: `block w-full h-auto ${size === 'thumb' ? 'max-w-[120px]' : 'max-w-[420px]'} ${className}`,
    fill: 'none',
    stroke: ink,
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  const box = (x: number, y: number, w = 36, h = 20) => (
    <rect x={x} y={y} width={w} height={h} rx="2" fill="#fbfbf9" />
  );

  switch (slug) {
    case 'founder-trap': {
      // Every team line runs through the founder.
      const teams: [number, number][] = [[28, 120], [80, 134], [160, 134], [212, 120], [22, 40], [218, 40]];
      return (
        <svg {...common} aria-label="Every team line runs through one person">
          {teams.map(([x, y], i) => <line key={i} x1="120" y1="72" x2={x} y2={y} />)}
          {teams.map(([x, y], i) => <g key={'b' + i}>{box(x - 18, y - 10)}</g>)}
          <circle cx="120" cy="72" r="20" fill={blue} stroke={blue} />
          <text x="120" y="76" textAnchor="middle" fontSize="9" fontWeight="700" fill="#fbfbf9" stroke="none" fontFamily="JetBrains Mono, monospace">YOU</text>
        </svg>
      );
    }
    case 'structure-without-spine': {
      // A complete org chart with the spine drawn as a gap.
      return (
        <svg {...common} aria-label="An org chart with nothing holding it together">
          {box(102, 14)}
          {[36, 102, 168].map((x) => <g key={x}>{box(x, 64)}</g>)}
          {[18, 54, 102, 138, 168, 204].map((x) => <g key={x}>{box(x, 114, 30, 18)}</g>)}
          {/* connectors are dashed: structure exists, ownership does not */}
          <g strokeDasharray="3 4" stroke={ink}>
            <line x1="120" y1="34" x2="120" y2="64" />
            <line x1="54" y1="48" x2="186" y2="48" />
            <line x1="54" y1="48" x2="54" y2="64" /><line x1="186" y1="48" x2="186" y2="64" />
            <line x1="54" y1="84" x2="54" y2="114" /><line x1="120" y1="84" x2="120" y2="114" /><line x1="186" y1="84" x2="186" y2="114" />
          </g>
          {/* the missing spine */}
          <line x1="120" y1="8" x2="120" y2="142" stroke={blue} strokeWidth="6" strokeDasharray="0 14" opacity="0.9" />
          <text x="130" y="140" fontSize="8" fill={blue} stroke="none" fontFamily="JetBrains Mono, monospace">spine: missing</text>
        </svg>
      );
    }
    case 'execution-breakdown': {
      // Decisions enter on the left, output leaves on the right, most fall through the floor.
      return (
        <svg {...common} aria-label="Decisions go in, few come out the other side">
          <path d="M16 40 H224" />
          <path d="M16 110 H224" />
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const x = 30 + i * 36;
            const falls = i !== 1 && i !== 4;
            return (
              <g key={i}>
                <circle cx={x} cy="40" r="5" fill={blue} stroke={blue} />
                {falls
                  ? <path d={`M${x} 46 C ${x} 70, ${x + 8} 80, ${x + 4} 104`} strokeDasharray="2 4" />
                  : <path d={`M${x} 46 V 104`} stroke={blue} />}
                {!falls && <circle cx={x} cy="110" r="5" fill="#fbfbf9" stroke={blue} />}
              </g>
            );
          })}
          <text x="16" y="30" fontSize="8" fill={ink} stroke="none" fontFamily="JetBrains Mono, monospace">agreed in the meeting</text>
          <text x="16" y="128" fontSize="8" fill={ink} stroke="none" fontFamily="JetBrains Mono, monospace">actually shipped</text>
        </svg>
      );
    }
    case 'visibility-collapse': {
      // The dashboard line is flat and green; the real line underneath has already turned.
      return (
        <svg {...common} aria-label="The dashboard says fine while the real line has already turned">
          <rect x="16" y="20" width="208" height="100" rx="2" />
          <polyline points="28,60 70,58 112,61 154,57 196,60 212,58" stroke={ink} strokeWidth="2" />
          <text x="28" y="50" fontSize="8" fill={ink} stroke="none" fontFamily="JetBrains Mono, monospace">what the dashboard shows</text>
          <polyline points="28,70 70,72 112,80 154,96 196,112 212,116" stroke={blue} strokeWidth="2" strokeDasharray="4 3" />
          <text x="120" y="134" fontSize="8" fill={blue} stroke="none" fontFamily="JetBrains Mono, monospace">what the customer already knows</text>
        </svg>
      );
    }
    case 'growth-induced-fragility': {
      // Load grows as a staircase; the support under it stays one thin column.
      return (
        <svg {...common} aria-label="Growing load on the same thin support">
          {[0, 1, 2, 3, 4].map((i) => {
            const w = 40 + i * 34;
            const y = 108 - i * 18;
            return <rect key={i} x={120 - w / 2} y={y} width={w} height="14" rx="1" fill="#fbfbf9" />;
          })}
          <rect x="112" y="122" width="16" height="18" fill={blue} stroke={blue} />
          <text x="150" y="134" fontSize="8" fill={blue} stroke="none" fontFamily="JetBrains Mono, monospace">the same few people</text>
          <text x="30" y="30" fontSize="8" fill={ink} stroke="none" fontFamily="JetBrains Mono, monospace">orders, hires, products</text>
        </svg>
      );
    }
    case 'operating-in-public':
    default: {
      // Nine small boxes running on a schedule, one of them marked as the human's seat.
      return (
        <svg {...common} aria-label="Nine systems on a daily schedule, one human seat">
          {[0, 1, 2].map((r) =>
            [0, 1, 2].map((c) => {
              const x = 42 + c * 56, y = 26 + r * 36;
              const human = r === 1 && c === 1;
              return (
                <g key={`${r}${c}`}>
                  <rect x={x} y={y} width="44" height="22" rx="2" fill={human ? blue : '#fbfbf9'} stroke={human ? blue : ink} />
                  {!human && <line x1={x + 8} y1={y + 11} x2={x + 36} y2={y + 11} strokeDasharray="2 3" />}
                </g>
              );
            }),
          )}
          <line x1="20" y1="136" x2="220" y2="136" />
          {[20, 70, 120, 170, 220].map((x) => <line key={x} x1={x} y1="132" x2={x} y2="140" />)}
          <text x="20" y="128" fontSize="8" fill={ink} stroke="none" fontFamily="JetBrains Mono, monospace">08:00</text>
          <text x="206" y="128" fontSize="8" fill={ink} stroke="none" fontFamily="JetBrains Mono, monospace">21:30</text>
        </svg>
      );
    }
  }
}
