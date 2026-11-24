import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from draw import sheet, box, tick, W, H, NAVY, LINE, DIM, TEAL
KEY = 'blog-culture-will-not-beat-structure'
# The idea: the values on the wall point one way, but behaviour runs along the
# structure and ends where the reward is; nothing follows the wall's arrow.
body = ''
# the wall: a quiet framed panel with blank lines on it
body += box(170, 110, 250, 150, f'stroke="{DIM}" stroke-width="3.5"', 8)
for i, w in enumerate((170, 130, 150)):
    body += f'<path d="M210 {150 + i*35} h{w}" stroke="{DIM}" stroke-width="3"/>'
# the wall's stated direction: a dashed arrow to a dashed goal nobody reaches
body += f'<path d="M440 185 H790" stroke="{DIM}" stroke-width="3.5" stroke-dasharray="12 12" marker-end="url(#ad)"/>'
body += f'<circle cx="860" cy="185" r="50" stroke="{DIM}" stroke-width="3.5" stroke-dasharray="10 10"/>'
# the structure: a solid channel with posts
body += f'<path d="M170 360 H800 M170 480 H800"/>'
for x in (170, 380, 590, 800):
    body += f'<path d="M{x} 345 V375 M{x} 465 V495"/>'
# behaviour: a run of arrows travelling along the channel
for i in range(4):
    x = 200 + i*150
    body += f'<path d="M{x} 420 h90" marker-end="url(#a)"/>'
# where it ends: the reward
body += f'<path d="M800 420 H850" stroke="{TEAL}" stroke-width="6" marker-end="url(#at)"/>'
body += box(870, 345, 200, 150, f'stroke="none" fill="{TEAL}" opacity="0.16"', 10)
body += box(870, 345, 200, 150, f'stroke="{TEAL}" stroke-width="6.5"', 10)
body += tick(942, 420, 1.6, TEAL, 7)
svg = sheet(body)
open(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'svg', KEY + '.svg'), 'w').write(svg)
