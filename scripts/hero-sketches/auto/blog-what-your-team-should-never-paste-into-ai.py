import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from draw import sheet, box, tick, W, H, NAVY, LINE, DIM, TEAL
KEY = 'blog-what-your-team-should-never-paste-into-ai'
# The idea: a short list of five kinds of raw data never go into the AI chat; the same
# job still gets done by swapping the real details for blank labels first.
rows = ''
for i in range(5):
    y = 175 + i*62
    rows += box(180, y, 34, 34, f'stroke="{DIM}" stroke-width="3" fill="{DIM}" fill-opacity="0.55"', 5)
    rows += f'<path d="M232 {y+17} H340" stroke="{DIM}" stroke-width="3.5"/>'
stops = ''.join(f'<path d="M370 {192 + i*62} H566" stroke="{DIM}" stroke-width="3.5" marker-end="url(#ad)"/>' for i in range(4))
chat = ''.join(box(870, 220 + j*64, 40, 34, f'stroke="{TEAL}" stroke-width="4" stroke-dasharray="7 6"', 5) + f'<path d="M928 {237 + j*64} H1030" stroke="{DIM}" stroke-width="3.5"/>' for j in range(3))
svg = sheet(f'''{box(150, 140, 220, 360)}{rows}{stops}
<path d="M590 120 V430" stroke-width="7"/>
<path d="M370 470 H560 C600 470, 610 470, 640 470" stroke="{TEAL}" stroke-width="5.5"/>
{box(650, 448, 44, 44, f'stroke="{TEAL}" stroke-width="5" stroke-dasharray="8 6"', 6)}
<path d="M704 470 C780 470, 780 340, 838 330" stroke="{TEAL}" stroke-width="5.5" marker-end="url(#at)"/>
{box(850, 150, 210, 330)}
<path d="M850 196 H1060" stroke="{DIM}" stroke-width="3.5"/>{chat}''')
open(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'svg', KEY + '.svg'), 'w').write(svg)
