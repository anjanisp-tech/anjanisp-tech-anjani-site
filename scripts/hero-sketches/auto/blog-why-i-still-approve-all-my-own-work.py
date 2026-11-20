import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from draw import sheet, box, tick, W, H, NAVY, LINE, DIM, TEAL
KEY = 'blog-why-i-still-approve-all-my-own-work'
# The idea: every build passes through one reader's sign-off before it leaves; that single
# gate sets a fixed limit on how much goes out, and it is a ceiling chosen on purpose.
body = ''
# the builds waiting: a full cluster of dim boxes
for r in range(3):
    for c in range(3):
        x, y = 150 + c*95, 170 + r*100
        body += box(x, y, 74, 56, f'stroke="{DIM}" stroke-width="3.5"', 8)
        body += f'<path d="M{x+14} {y+28} H{x+60}" stroke="{DIM}" stroke-width="3"/>'
# all of them head for one narrow opening
for yy in (198, 298, 398):
    body += f'<path d="M440 {yy} C490 {yy}, 500 315, 532 315" stroke="{DIM}" stroke-width="3.5" marker-end="url(#ad)"/>'
# the wall, with one opening: the single sign-off
body += f'<path d="M600 110 V255 M600 375 V520"/>'
body += f'<path d="M580 110 H620 M580 520 H620"/>'
body += f'<circle cx="600" cy="315" r="50" stroke="{TEAL}" stroke-width="6.5"/>'
body += tick(584, 314, 1.1, TEAL, 6.5)
# what leaves: fewer, each one read
body += f'<path d="M665 315 H770" marker-end="url(#a)"/>'
for i, x in enumerate((800, 893, 986)):
    body += box(x, 287, 74, 56, f'stroke="{LINE}"', 8)
    body += tick(x+24, 316, 0.9, LINE, 4.5)
# a fixed limit over the outgoing row
body += f'<path d="M800 240 H1060 M800 228 V252 M1060 228 V252" stroke="{DIM}" stroke-width="3.5"/>'
svg = sheet(body)
open(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'svg', KEY + '.svg'), 'w').write(svg)
