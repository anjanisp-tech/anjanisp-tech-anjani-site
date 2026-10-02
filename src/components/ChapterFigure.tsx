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
  // Mono labels are unreadable at thumbnail size, so they only render at full size.
  const T = ({ children, ...a }: React.SVGProps<SVGTextElement>) => (size === 'thumb' ? null : <text {...a}>{children}</text>);
  const box = (x: number, y: number, w = 36, h = 20) => (
    <rect x={x} y={y} width={w} height={h} rx="2" fill="#fbfbf9" />
  );

  switch (slug) {
    case 'who-decides': {
      // Every team line runs through the founder.
      const teams: [number, number][] = [[28, 120], [80, 134], [160, 134], [212, 120], [22, 40], [218, 40]];
      return (
        <svg {...common} aria-label="Every team line runs through one person">
          {teams.map(([x, y], i) => <line key={i} x1="120" y1="72" x2={x} y2={y} />)}
          {teams.map(([x, y], i) => <g key={'b' + i}>{box(x - 18, y - 10)}</g>)}
          <circle cx="120" cy="72" r="20" fill={blue} stroke={blue} />
          <T x="120" y="76" textAnchor="middle" fontSize="9" fontWeight="700" fill="#fbfbf9" stroke="none" fontFamily="JetBrains Mono, monospace">YOU</T>
        </svg>
      );
    }
    case 'letting-go': {
      // Work is handed down to the team, and a dashed line carries it back up to you.
      return (
        <svg {...common} aria-label="Work handed to the team keeps coming back to you">
          <circle cx="60" cy="44" r="20" fill={blue} stroke={blue} />
          <T x="60" y="48" textAnchor="middle" fontSize="9" fontWeight="700" fill="#fbfbf9" stroke="none" fontFamily="JetBrains Mono, monospace">YOU</T>
          {box(150, 96, 60, 26)}
          <T x="180" y="113" textAnchor="middle" fontSize="8" fill={ink} stroke="none" fontFamily="JetBrains Mono, monospace">team</T>
          {/* handed over: solid, downward */}
          <path d="M80 50 C 120 56, 140 74, 154 94" />
          <path d="M146 90 L154 94 L152 85" />
          <T x="58" y="104" fontSize="8" fill={ink} stroke="none" fontFamily="JetBrains Mono, monospace">handed over</T>
          {/* came back: dashed, blue, upward */}
          <path d="M196 94 C 200 40, 130 16, 82 34" stroke={blue} strokeDasharray="4 4" />
          <path d="M90 28 L82 34 L91 38" stroke={blue} />
          <T x="150" y="26" fontSize="8" fill={blue} stroke="none" fontFamily="JetBrains Mono, monospace">came back</T>
        </svg>
      );
    }
    case 'pointed-the-same-way': {
      // One plan at the top; the teams below each point somewhere else.
      const teams: [number, number][] = [[30, -40], [76, 20], [122, -8], [168, 35], [214, -25]];
      return (
        <svg {...common} aria-label="One plan, and teams pointing in different directions">
          <rect x="88" y="10" width="64" height="20" rx="2" fill={blue} stroke={blue} />
          <T x="120" y="24" textAnchor="middle" fontSize="8" fontWeight="700" fill="#fbfbf9" stroke="none" fontFamily="JetBrains Mono, monospace">THE PLAN</T>
          {teams.map(([x, deg], i) => {
            const r = (deg * Math.PI) / 180;
            const x2 = x + Math.sin(r) * 34, y2 = 112 - Math.cos(r) * 34;
            return (
              <g key={i}>
                {box(x - 16, 116, 32, 18)}
                <line x1={x} y1="112" x2={x2} y2={y2} />
                <circle cx={x2} cy={y2} r="2.5" fill={ink} />
              </g>
            );
          })}
          <line x1="120" y1="30" x2="120" y2="70" stroke={blue} strokeDasharray="2 4" />
        </svg>
      );
    }
    case 'chaos-not-cadence': {
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
          <T x="16" y="30" fontSize="8" fill={ink} stroke="none" fontFamily="JetBrains Mono, monospace">agreed in the meeting</T>
          <T x="16" y="128" fontSize="8" fill={ink} stroke="none" fontFamily="JetBrains Mono, monospace">actually shipped</T>
        </svg>
      );
    }
    case 'seen-not-acted-on': {
      // The dashboard line is flat and green; the real line underneath has already turned.
      return (
        <svg {...common} aria-label="The dashboard says fine while the real line has already turned">
          <rect x="16" y="20" width="208" height="100" rx="2" />
          <polyline points="28,60 70,58 112,61 154,57 196,60 212,58" stroke={ink} strokeWidth="2" />
          <T x="28" y="50" fontSize="8" fill={ink} stroke="none" fontFamily="JetBrains Mono, monospace">what the dashboard shows</T>
          <polyline points="28,70 70,72 112,80 154,96 196,112 212,116" stroke={blue} strokeWidth="2" strokeDasharray="4 3" />
          <T x="120" y="134" fontSize="8" fill={blue} stroke="none" fontFamily="JetBrains Mono, monospace">what the customer already knows</T>
        </svg>
      );
    }
    case 'growth-that-breaks': {
      // Load grows as a staircase; the support under it stays one thin column.
      return (
        <svg {...common} aria-label="Growing load on the same thin support">
          {[0, 1, 2, 3, 4].map((i) => {
            const w = 40 + i * 34;
            const y = 108 - i * 18;
            return <rect key={i} x={120 - w / 2} y={y} width={w} height="14" rx="1" fill="#fbfbf9" />;
          })}
          <rect x="112" y="122" width="16" height="18" fill={blue} stroke={blue} />
          <T x="150" y="134" fontSize="8" fill={blue} stroke="none" fontFamily="JetBrains Mono, monospace">the same few people</T>
          <T x="30" y="30" fontSize="8" fill={ink} stroke="none" fontFamily="JetBrains Mono, monospace">orders, hires, products</T>
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
          <T x="20" y="128" fontSize="8" fill={ink} stroke="none" fontFamily="JetBrains Mono, monospace">08:00</T>
          <T x="206" y="128" fontSize="8" fill={ink} stroke="none" fontFamily="JetBrains Mono, monospace">21:30</T>
        </svg>
      );
    }
  }
}
