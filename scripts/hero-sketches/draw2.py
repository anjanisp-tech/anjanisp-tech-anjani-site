"""anjanipandey.com idea sketches, batch 2 (2026-11-02): the last 3 posts and
all 8 case studies. Same register as draw.py."""
import math, os
from draw import sheet, box, tick, W, H, NAVY, LINE, DIM, TEAL, OUT

S = {}

# Every business is the same seven boxes: one map of seven parts; the one to
# distrust first is ringed.
seven = [(250, 170), (480, 170), (710, 170), (365, 330), (595, 330), (825, 330), (480, 470)]
links = f'<path d="M370 205 H470 M600 205 H700 M310 240 L380 320 M540 240 L600 320 M770 240 L840 320 M485 365 H585 M715 365 H815 M600 400 L560 460" stroke="{DIM}" stroke-width="3.5"/>'
S['blog-every-business-is-the-same-seven-boxes'] = sheet(links + ''.join(
    box(x, y, 120, 70, f'stroke="{TEAL}" stroke-width="6"' if (x, y) == (595, 330) else '') for x, y in seven) +
    f'<circle cx="655" cy="365" r="84" stroke="{TEAL}" stroke-width="3" stroke-dasharray="8 9"/>')

# Every AI tool ships with a do-not list: the worker's arrows run free; at the
# fence, the do-not side is struck off.
S['blog-every-agent-i-build-now-ships-with-a-list-of-what-it-must-not-do'] = sheet(f'''
{box(170, 250, 140, 140)}
<path d="M310 290 C420 250, 520 180, 640 170" marker-end="url(#a)"/>
<path d="M310 320 C420 320, 520 320, 640 320" marker-end="url(#a)"/>
<path d="M310 350 C420 390, 520 450, 640 470" marker-end="url(#a)"/>
<path d="M700 110 V530" stroke="{TEAL}" stroke-width="7"/>
<path d="M700 140 h40 M700 220 h40 M700 300 h40 M700 380 h40 M700 460 h40" stroke="{TEAL}" stroke-width="4"/>
<path d="M800 190 l24 24 m0 -24 l-24 24 M800 310 l24 24 m0 -24 l-24 24 M800 430 l24 24 m0 -24 l-24 24" stroke="{DIM}" stroke-width="4"/>
<path d="M860 202 H990 M860 322 H970 M860 442 H1000" stroke="{DIM}" stroke-width="3.5"/>''')

# What founders ask before they trust AI tools: the path is predictable, and
# where the tool is unsure it stops at a gate and waits.
S['blog-what-founders-ask-before-they-trust-an-ai-operating-system-for-a-business'] = sheet(f'''
<circle cx="180" cy="315" r="30"/>
<path d="M210 315 H430" marker-end="url(#a)"/>
<path d="M440 315 L520 215 H900" marker-end="url(#a)"/>
<path d="M440 315 L520 415 H640" stroke="{TEAL}" stroke-width="5"/>
{box(650, 375, 30, 80, f'stroke="{TEAL}" stroke-width="6"', 4)}
<path d="M700 415 H900" stroke="{DIM}" stroke-width="3.5" stroke-dasharray="10 10" marker-end="url(#ad)"/>
<circle cx="665" cy="320" r="22" stroke="{TEAL}" stroke-width="4"/>
<path d="M665 342 V370" stroke="{TEAL}" stroke-width="4"/>
{box(920, 180, 110, 70)}{box(920, 380, 110, 70, f'stroke="{DIM}" stroke-width="3.5"')}''')

# Writer notes that leaked onto live pages: notes meant for a person are caught
# at the gate before the page goes out.
S['case-writer-notes-that-leaked-onto-live-pages'] = sheet(f'''
{box(170, 140, 260, 350)}
<path d="M200 190 H400 M200 230 H390 M200 270 H400" stroke="{DIM}" stroke-width="3.5"/>
<path d="M200 320 H330 M200 360 H300 M200 400 H340" stroke="{TEAL}" stroke-width="4" stroke-dasharray="6 7"/>
<path d="M430 315 H560" marker-end="url(#a)"/>
<path d="M580 180 V450 M640 180 V450" stroke="{TEAL}" stroke-width="6"/>
<path d="M580 315 H640" stroke="{TEAL}" stroke-width="3" stroke-dasharray="5 6"/>
<path d="M610 460 V520" stroke="{TEAL}" stroke-width="4" stroke-dasharray="6 7" marker-end="url(#at)"/>
<path d="M660 315 H780" marker-end="url(#a)"/>
{box(800, 160, 240, 310)}
<path d="M830 210 H1010 M830 250 H1000 M830 290 H1010" stroke="{DIM}" stroke-width="3.5"/>''')

# 71 idea files made searchable: a jumble of file shapes goes in, plain notes
# come out, and the lens can finally read them.
files = (box(170, 150, 90, 120, f'stroke="{DIM}" stroke-width="3.5"', 6) +
         box(290, 190, 120, 90, f'stroke="{DIM}" stroke-width="3.5"', 6) +
         f'<path d="M290 220 H410 M290 250 H410 M330 190 V280 M370 190 V280" stroke="{DIM}" stroke-width="2.5"/>' +
         box(200, 310, 150, 95, f'stroke="{DIM}" stroke-width="3.5"', 6) +
         f'<path d="M215 395 L255 345 L290 380 L315 355 L340 395" stroke="{DIM}" stroke-width="3"/>' +
         box(370, 330, 90, 120, f'stroke="{DIM}" stroke-width="3.5"', 6))
notes = ''.join(box(700, 160 + i*58, 230, 42, '', 6) + f'<path d="M720 {181 + i*58} H{880 - (i % 3)*30}" stroke="{DIM}" stroke-width="3"/>' for i in range(6))
S['case-71-idea-files-made-searchable-zero-installs'] = sheet(f'''{files}
<path d="M500 315 H660" marker-end="url(#a)"/>{notes}
<circle cx="960" cy="230" r="58" stroke="{TEAL}" stroke-width="6" fill="{NAVY}" fill-opacity="0.6"/>
<path d="M1002 272 L1042 312" stroke="{TEAL}" stroke-width="10"/>''')

# Status notes that had gone stale: two records that should agree do not; the
# nightly check finds the gap.
S['case-when-the-notes-say-done-and-it-is-not'] = sheet(f'''
{box(200, 170, 280, 300)}{box(720, 170, 280, 300)}
{tick(240, 240, 1.1, LINE, 4.5)}<path d="M300 245 H440" stroke="{DIM}" stroke-width="3.5"/>
{tick(240, 320, 1.1, LINE, 4.5)}<path d="M300 325 H430" stroke="{DIM}" stroke-width="3.5"/>
{tick(240, 400, 1.1, LINE, 4.5)}<path d="M300 405 H420" stroke="{DIM}" stroke-width="3.5"/>
{tick(760, 240, 1.1, LINE, 4.5)}<path d="M820 245 H960" stroke="{DIM}" stroke-width="3.5"/>
{box(760, 300, 36, 36, f'stroke="{TEAL}" stroke-width="5"', 4)}<path d="M820 325 H950" stroke="{DIM}" stroke-width="3.5"/>
{tick(760, 400, 1.1, LINE, 4.5)}<path d="M820 405 H940" stroke="{DIM}" stroke-width="3.5"/>
<path d="M480 320 H560 M640 320 H720" stroke="{TEAL}" stroke-width="5" stroke-dasharray="10 9"/>
<path d="M575 300 l20 20 l-20 20 M625 300 l-20 20 l20 20" stroke="{TEAL}" stroke-width="5"/>''')

# Rebuilding the firm's website with an AI pair: a crowded page becomes a calm
# one; the struck-out claims made it honest.
dots = ''.join(f'<circle cx="{200 + (i*53) % 240}" cy="{180 + (i*37) % 280}" r="{4 + i % 4}" fill="{DIM}" stroke="none"/>' for i in range(26))
S['case-rebuilding-my-firms-website-with-an-ai-pair'] = sheet(f'''
{box(170, 140, 300, 350, f'stroke="{DIM}" stroke-width="3.5"')}{dots}
<path d="M520 315 H660" marker-end="url(#a)"/>
{box(710, 140, 320, 350)}
<path d="M750 200 H990" stroke-width="7"/><path d="M750 250 H950 M750 290 H970" stroke="{DIM}" stroke-width="3.5"/>
<path d="M750 350 H900 M750 400 H930" stroke="{DIM}" stroke-width="3.5"/>
<path d="M740 345 L920 355 M740 405 L950 395" stroke="{TEAL}" stroke-width="5"/>''')

# Putting every content rule behind a check: each rule line runs through its
# own gate before anything ships.
rules = ''.join(
    f'<path d="M180 {172 + i*75} H560" stroke="{DIM}" stroke-width="3.5"/>' +
    box(590, 150 + i*75, 44, 44, f'stroke="{TEAL}" stroke-width="5"', 6) +
    tick(598, 172 + i*75, 0.95, TEAL, 5) +
    f'<path d="M650 {172 + i*75} H760" stroke="{LINE}" stroke-width="3.5"/>' for i in range(5))
S['case-putting-every-content-rule-behind-a-check'] = sheet(f'''{rules}
<path d="M770 160 V500" stroke="{LINE}"/><path d="M770 330 H1000" marker-end="url(#a)"/>''')

# 112 scheduled jobs, and how many really ran: a clock and a grid of jobs; only
# the ones that left proof are filled.
grid = ''
for i in range(112):
    r, c = divmod(i, 16)
    x, y = 470 + c*36, 165 + r*46
    ran = (i * 7) % 112 < 66
    grid += f'<circle cx="{x}" cy="{y}" r="10" stroke="{TEAL if ran else DIM}" stroke-width="3" fill="{TEAL if ran else "none"}" fill-opacity="{0.55 if ran else 0}"/>'
marks = ''.join(f'<path d="M{260 + 95*math.cos(math.radians(a)):.0f} {315 + 95*math.sin(math.radians(a)):.0f} L{260 + 108*math.cos(math.radians(a)):.0f} {315 + 108*math.sin(math.radians(a)):.0f}" stroke-width="3"/>' for a in range(0, 360, 30))
S['case-112-scheduled-jobs-and-how-many-really-ran'] = sheet(f'''
<circle cx="260" cy="315" r="110"/><path d="M260 315 V240 M260 315 L320 345"/>{marks}{grid}''')

# The quality gate I said never fired: drafts flow through a gate; some are sent
# back. It had been firing all along.
flow = ''.join(f'<circle cx="{200 + i*80}" cy="315" r="16"/>' for i in range(4))
S['case-the-quality-gate-i-said-never-fired'] = sheet(f'''{flow}
<path d="M480 315 H560" marker-end="url(#a)"/>
<path d="M590 170 V460 M680 170 V460"/><path d="M590 170 H680" stroke-width="7"/>
<path d="M700 315 H800" marker-end="url(#a)"/>
{''.join(f'<circle cx="{850 + i*70}" cy="315" r="16"/>' for i in range(3))}
<path d="M635 165 C635 70, 280 70, 280 280" stroke="{TEAL}" stroke-width="6" marker-end="url(#at)"/>
<path d="M635 465 C635 560, 360 560, 360 350" stroke="{TEAL}" stroke-width="6" marker-end="url(#at)"/>''')

# Taking website publishing off a person: the hand-copy route broke at its
# steps; a straight, checked line now carries the sheet to both sites.
S['case-taking-website-publishing-off-a-person'] = sheet(f'''
{box(160, 240, 150, 160)}
<path d="M190 280 H280 M190 315 H270 M190 350 H280" stroke="{DIM}" stroke-width="3.5"/>
<path d="M310 280 C380 200, 430 260, 470 200 L500 230" stroke="{DIM}" stroke-width="3.5" stroke-dasharray="10 9"/>
<path d="M515 215 l18 18 m0 -18 l-18 18" stroke="{DIM}" stroke-width="4"/>
<path d="M310 360 H600" stroke="{TEAL}" stroke-width="6"/>
{box(600, 335, 50, 50, f'stroke="{TEAL}" stroke-width="5"', 6)}{tick(609, 358, 1.0, TEAL, 5)}
<path d="M650 360 H760 L840 260 H900 M760 360 L840 440 H900" stroke="{TEAL}" stroke-width="6"/>
{box(910, 200, 140, 110)}{box(910, 390, 140, 110)}''')

if __name__ == '__main__':
    for key, svg in S.items():
        with open(os.path.join(OUT, key + '.svg'), 'w') as f:
            f.write(svg)
    print(len(S), 'sketches written to', OUT)
