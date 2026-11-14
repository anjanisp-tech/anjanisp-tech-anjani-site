import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from draw import sheet, box, tick, W, H, NAVY, LINE, DIM, TEAL
KEY = 'blog-i-nearly-turned-away-the-right-client'
# The idea: where a problem concentrates is a heat map that tells you where to aim,
# not a gate that decides who gets in; the gate tests only for the problem itself,
# so a firm outside the hot zone with the same problem still walks through.
body = ''
cx, cy = 360, 300
# the heat map: contour rings around where the pain is worst
body += f'<circle cx="{cx}" cy="{cy}" r="200" stroke="{DIM}" stroke-width="3" stroke-dasharray="10 10"/>'
body += f'<circle cx="{cx}" cy="{cy}" r="135" stroke="{DIM}" stroke-width="3.5"/>'
body += f'<circle cx="{cx}" cy="{cy}" r="70" stroke="{DIM}" stroke-width="3.5" fill="{DIM}" fill-opacity="0.35"/>'
# firms inside the hot zone
for (x, y) in ((340, 280), (385, 318), (312, 330), (300, 225), (430, 250), (420, 380), (270, 300), (360, 400)):
    body += f'<circle cx="{x}" cy="{y}" r="9" fill="{LINE}" stroke="none"/>'
# a few firms well outside it, quiet
for (x, y) in ((620, 130), (150, 120), (640, 470)):
    body += f'<circle cx="{x}" cy="{y}" r="8" fill="{DIM}" stroke="none"/>'
# the gate: two posts and a lintel, tested only by the problem
body += f'<path d="M820 190 V450 M940 190 V450 M800 190 H960"/>'
body += box(845, 120, 70, 52, f'stroke="{LINE}"', 8)
body += tick(866, 144, 1.0, TEAL, 5)
# the work beyond the gate
body += box(985, 270, 95, 95, f'stroke="{LINE}" stroke-width="5"')
body += f'<path d="M945 318 H975" marker-end="url(#a)"/>'
# a firm from the hot zone heads to the gate
body += f'<path d="M500 300 C620 290, 700 300, 800 305" stroke="{DIM}" stroke-width="3.5" marker-end="url(#ad)"/>'
# the one that matters: a firm outside the map, same problem, walks through
body += f'<circle cx="190" cy="500" r="13" fill="{TEAL}" stroke="none"/>'
body += f'<path d="M212 500 C430 535, 680 470, 860 340" stroke="{TEAL}" stroke-width="6" marker-end="url(#at)"/>'
svg = sheet(body)
open(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'svg', KEY + '.svg'), 'w').write(svg)
