"""anjanipandey.com idea sketches. Textless line drawings on a navy sheet.

Register: navy ground, a soft dot grid, pale linework, ONE teal accent on the
point of the idea. No gold, no amber, no text, never the title.

Each sketch is keyed <kind>-<slug> and written to svg/<key>.svg. render.mjs
turns the folder into public/hero/<key>.png (1200x630) with sharp, and
check.mjs runs the automatic look check (size, not blank, enough line work).
"""
import math, os, sys

W, H = 1200, 630
NAVY = '#0d1a2e'     # ground
DOT = 'rgba(207,219,232,0.10)'
LINE = '#cfdbe8'     # pale linework
DIM = '#5d7391'      # quiet linework
TEAL = '#2bc0ae'     # the one accent
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'svg')
os.makedirs(OUT, exist_ok=True)


def sheet(body):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">
<defs>
<pattern id="d" width="30" height="30" patternUnits="userSpaceOnUse"><circle cx="15" cy="15" r="1.4" fill="{DOT}"/></pattern>
<radialGradient id="v" cx="50%" cy="45%" r="75%"><stop offset="0" stop-color="#13243d"/><stop offset="1" stop-color="{NAVY}"/></radialGradient>
<marker id="a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0L10 5L0 10z" fill="{LINE}"/></marker>
<marker id="at" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0L10 5L0 10z" fill="{TEAL}"/></marker>
<marker id="ad" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0L10 5L0 10z" fill="{DIM}"/></marker>
</defs>
<rect width="{W}" height="{H}" fill="url(#v)"/><rect width="{W}" height="{H}" fill="url(#d)"/>
<g fill="none" stroke="{LINE}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round">{body}</g></svg>'''


def box(x, y, w, h, extra='', r=10):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" {extra}/>'


def tick(x, y, s=1.0, col=None, sw=4.5):
    c = f' stroke="{col}"' if col else ''
    return f'<path d="M{x} {y} l{9*s:.1f} {9*s:.1f} l{18*s:.1f} {-20*s:.1f}"{c} stroke-width="{sw}"/>'


S = {}

# 1. Three launches in one week: three take-offs from one short week strip,
#    all landing on the same small team, whose load bar spills over.
cells = ''.join(box(230 + i*70, 470, 56, 46, f'stroke="{DIM}" stroke-width="3.5"', 6) for i in range(7))
launch = ''.join(f'<path d="M{230 + i*70 + 28} 462 C{230 + i*70 + 28} 330, {560 + (i-2)*30} 300, {600 + (i-2)*40} 230" marker-end="url(#a)"/>' for i in (0, 3, 6))
S['blog-three-launches-in-one-week-is-a-warning'] = sheet(f'''{cells}{launch}
{box(500, 120, 260, 70, f'stroke="{LINE}"')}
{box(500, 120, 260, 70, f'stroke="none" fill="{TEAL}" opacity="0.18"')}
<path d="M760 155 H880" stroke="{TEAL}" stroke-width="6"/><path d="M880 155 l-14 -12 M880 155 l-14 12" stroke="{TEAL}" stroke-width="6"/>
<path d="M900 120 l18 18 M918 120 l-18 18 M930 160 l18 18 M948 160 l-18 18" stroke="{TEAL}" stroke-width="3.5"/>''')

# 2. The question nobody asked at year five: a full board of tasks the operator
#    could run; most are struck off, one is kept and ringed.
grid = ''
for r in range(3):
    for c in range(4):
        x, y = 290 + c*170, 150 + r*120
        grid += box(x, y, 120, 76, f'stroke="{DIM}" stroke-width="3.5"')
        if (r, c) != (1, 2):
            grid += f'<path d="M{x+14} {y+38} H{x+106}" stroke="{DIM}" stroke-width="3.5"/>'
S['blog-the-question-nobody-asked-me-at-year-five'] = sheet(f'''{grid}
{box(290 + 2*170, 150 + 120, 120, 76, f'stroke="{TEAL}" stroke-width="6"')}
<circle cx="{290 + 2*170 + 60}" cy="{150 + 120 + 38}" r="92" stroke="{TEAL}" stroke-width="3" stroke-dasharray="8 9"/>''')

# 3. Two leaders, one goal, two definitions: one target, two lines from either
#    side, each landing on its own centre; the gap between them is the point.
S['blog-two-leaders-one-goal-two-definitions'] = sheet(f'''
<circle cx="600" cy="315" r="170" stroke="{DIM}" stroke-width="3.5"/>
<circle cx="600" cy="315" r="110" stroke="{DIM}" stroke-width="3.5"/>
<circle cx="600" cy="315" r="50" stroke="{DIM}" stroke-width="3.5"/>
<circle cx="150" cy="315" r="34"/><circle cx="1050" cy="315" r="34"/>
<path d="M186 315 C330 315, 420 250, 552 268" marker-end="url(#a)"/>
<path d="M1014 315 C870 315, 780 380, 648 362" marker-end="url(#a)"/>
<circle cx="600" cy="315" r="78" stroke="{TEAL}" stroke-width="4" stroke-dasharray="9 9"/>
<path d="M566 270 L634 360" stroke="{TEAL}" stroke-width="7" stroke-dasharray="10 9"/>
<circle cx="562" cy="268" r="8" fill="{LINE}"/><circle cx="638" cy="362" r="8" fill="{LINE}"/>''')

# 4. Devotion is a schedule: a mood line rises and falls above; below it the
#    same small flame sits at the same hour, every day of the week.
mood = 'M170 200 C240 120, 300 280, 380 190 S520 110, 600 230 S760 300, 840 160 S990 230, 1040 190'
days = ''
for i in range(7):
    x = 210 + i*130
    days += f'<path d="M{x-40} 470 H{x+40}" stroke="{DIM}" stroke-width="3.5"/>'
    days += f'<path d="M{x} 438 C{x-16} 418, {x-6} 400, {x} 388 C{x+6} 400, {x+16} 418, {x} 438 Z" stroke="{TEAL}" stroke-width="4" fill="{TEAL}" fill-opacity="0.25"/>'
    days += f'<path d="M{x} 446 V462" stroke="{TEAL}" stroke-width="4"/>'
S['blog-devotion-is-a-schedule'] = sheet(f'''<path d="{mood}" stroke="{DIM}" stroke-width="3.5" stroke-dasharray="12 10"/>
<path d="M150 360 H1060" stroke="{DIM}" stroke-width="2.5" stroke-dasharray="3 10"/>{days}''')

# 5. Delegation dies at the first mistake: the work is handed over, one small
#    slip appears, and the whole thing travels straight back.
S['blog-delegation-dies-at-the-first-mistake'] = sheet(f'''
{box(170, 250, 220, 140)}{box(810, 250, 220, 140)}
<path d="M400 290 H560 L585 270 L610 312 L635 290 H795" marker-end="url(#a)"/>
<circle cx="597" cy="290" r="40" stroke="{TEAL}" stroke-width="3.5" stroke-dasharray="7 7"/>
<path d="M920 400 C920 540, 280 540, 280 410" stroke="{TEAL}" stroke-width="6" marker-end="url(#at)"/>
<path d="M210 290 H350 M210 320 H330 M210 350 H310" stroke="{DIM}" stroke-width="3.5"/>''')

# 6. Where the pain is worst vs who you take on: a heat map tells you where to
#    aim; the gate that decides who comes in is a separate instrument.
rings = ''.join(f'<ellipse cx="380" cy="315" rx="{40 + i*42}" ry="{28 + i*30}" stroke="{DIM if i else TEAL}" stroke-width="{3.5 if i else 6}"/>' for i in range(5))
S['blog-where-it-hurts-most-is-not-a-filter'] = sheet(f'''{rings}
<path d="M380 120 V200 M380 430 V510 M150 315 H250 M510 315 H610" stroke="{LINE}"/>
<path d="M760 170 H1040 L940 330 V500 H860 V330 Z"/>
<path d="M800 210 H1000" stroke="{DIM}" stroke-width="3.5"/>
<circle cx="830" cy="120" r="12" fill="{LINE}"/><circle cx="900" cy="100" r="12" fill="{LINE}"/><circle cx="970" cy="125" r="12" fill="{LINE}"/>''')

# 7. Your second business gets your leftovers: a day of hours poured out; the
#    first business takes almost all of it, the second gets the last sliver.
hours = ''.join(box(170 + i*36, 120, 28, 40, f'stroke="{DIM}" stroke-width="3"', 4) for i in range(24))
S['blog-your-second-business-gets-your-leftovers'] = sheet(f'''{hours}
<path d="M170 190 H970" stroke="{LINE}"/><path d="M570 190 V280" marker-end="url(#a)"/>
<path d="M1006 190 H1030" stroke="{TEAL}" stroke-width="6"/><path d="M1018 190 V420" stroke="{TEAL}" stroke-width="4" stroke-dasharray="8 8" marker-end="url(#at)"/>
{box(380, 300, 380, 220)}
<path d="M420 350 H720 M420 400 H680 M420 450 H700" stroke="{DIM}" stroke-width="3.5"/>
{box(930, 440, 180, 110, f'stroke="{TEAL}" stroke-width="5"')}''')

# 8. When software says it checked its own work: twelve ticked boxes on the
#    report; under the lens only two of them hold a real mark.
rows = ''
for i in range(12):
    r, c = divmod(i, 6)
    x, y = 190 + c*90, 210 + r*140
    rows += box(x, y, 56, 56, f'stroke="{DIM}" stroke-width="3.5"', 6)
    rows += tick(x + 10, y + 26, 1.0, DIM, 3.5)
S['blog-the-stamp-said-twelve-checks-ran-two-had'] = sheet(f'''{rows}
<circle cx="880" cy="300" r="150" stroke="{LINE}" fill="{NAVY}" fill-opacity="0.85"/>
<path d="M986 406 L1070 490" stroke-width="12"/>
{box(800, 250, 56, 56, f'stroke="{TEAL}" stroke-width="5" fill="{TEAL}" fill-opacity="0.18"', 6)}{tick(810, 276, 1.0, TEAL, 7)}
{box(890, 250, 56, 56, f'stroke="{TEAL}" stroke-width="5" fill="{TEAL}" fill-opacity="0.18"', 6)}{tick(900, 276, 1.0, TEAL, 7)}
{box(800, 320, 56, 56, f'stroke="{DIM}" stroke-width="3.5" stroke-dasharray="6 6"', 6)}
{box(890, 320, 56, 56, f'stroke="{DIM}" stroke-width="3.5" stroke-dasharray="6 6"', 6)}''')

# 9. The loyalty tax on a growing company: the company outline grows three
#    times over; the one seat inside it never changes size.
growth = ''
for i, (w, h) in enumerate([(160, 160), (240, 250), (330, 350)]):
    x = 170 + [0, 230, 560][i]
    y = 520 - h
    growth += box(x, y, w, h, '' if i == 2 else f'stroke="{DIM}" stroke-width="3.5"')
    sx, sy = x + w/2 - 30, 520 - 70
    growth += box(sx, sy, 60, 50, f'stroke="{TEAL}" stroke-width="5"', 6)
S['blog-the-loyalty-tax-on-a-growing-company'] = sheet(f'''<path d="M140 520 H1060" stroke="{DIM}" stroke-width="3.5"/>{growth}
<path d="M360 300 L410 270 M640 200 L690 170" stroke="{DIM}" stroke-width="3.5" marker-end="url(#ad)"/>''')

# 10. Operator to builder, my own report lied: the record says all clear, the
#     real world has moved; the line between them does not meet.
doc = box(200, 130, 300, 380)
doc += ''.join(tick(230, 200 + i*70, 1.0, DIM, 3.5) + f'<path d="M280 {205 + i*70} H460" stroke="{DIM}" stroke-width="3.5"/>' for i in range(4))
S['blog-operator-to-builder-my-own-report-lied'] = sheet(f'''{doc}
<path d="M700 470 L760 330 L830 400 L900 250 L960 340 L1020 300"/>
<path d="M690 510 H1040" stroke="{DIM}" stroke-width="3.5"/>
<path d="M500 345 C580 345, 600 300, 680 300" stroke="{DIM}" stroke-width="3.5" stroke-dasharray="10 9"/>
<circle cx="900" cy="250" r="34" stroke="{TEAL}" stroke-width="5"/>
<path d="M684 300 H720" stroke="{TEAL}" stroke-width="6"/><path d="M730 285 l12 30 M742 285 l-12 30" stroke="{TEAL}" stroke-width="4"/>''')


if __name__ == '__main__':
    only = set(sys.argv[1:])
    for key, svg in S.items():
        if only and key not in only:
            continue
        with open(os.path.join(OUT, key + '.svg'), 'w') as f:
            f.write(svg)
    print(len(S), 'sketches written to', OUT)
