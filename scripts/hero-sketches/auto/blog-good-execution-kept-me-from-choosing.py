import os, sys, math
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from draw import sheet, box, tick, W, H, NAVY, LINE, DIM, TEAL
KEY = 'blog-good-execution-kept-me-from-choosing'
# The idea: a tall stack of finished tasks sits on top of one choice never made; making it
# means one path forward and a clean stop on all the others.
stack = ''
for i in range(5):
    y = 105 + i*62
    stack += box(230, y, 150, 48, f'stroke="{LINE}" stroke-width="4.5"', 8)
    stack += tick(285, y + 22, 1.0, DIM, 3.5)
cx, cy = 305, 470
dia = f'<path d="M{cx} {cy-52} L{cx+60} {cy} L{cx} {cy+52} L{cx-60} {cy} Z" stroke="{TEAL}" stroke-width="6"/>'
stubs = ''
for ty in (130, 215, 300, 385):
    x0, y0, x1, y1 = cx + 60, cy, 700, ty
    stubs += f'<path d="M{x0+20} {y0-8} L{x1} {y1}" stroke="{DIM}" stroke-width="3.5"/>'
    a = math.atan2(y1 - y0, x1 - x0) + math.pi/2
    dx, dy = 18*math.cos(a), 18*math.sin(a)
    stubs += f'<path d="M{x1-dx:.1f} {y1-dy:.1f} L{x1+dx:.1f} {y1+dy:.1f}" stroke="{DIM}" stroke-width="5"/>'
svg = sheet(f'''{stack}{dia}{stubs}
<path d="M{cx+64} {cy} H890" stroke="{TEAL}" stroke-width="6" marker-end="url(#at)"/>
{box(905, 410, 150, 120, f'stroke="{TEAL}" stroke-width="5.5"')}''')
open(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'svg', KEY + '.svg'), 'w').write(svg)
