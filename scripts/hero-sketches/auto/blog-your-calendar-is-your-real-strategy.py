import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from draw import sheet, box, tick, W, H, NAVY, LINE, DIM, TEAL
KEY = 'blog-your-calendar-is-your-real-strategy'
# The idea: the plan points one way, but the week's booked hours carry the firm somewhere
# else, and the gap between where the plan aims and where the calendar lands is the real measure.
body = ''
# the plan: a sheet with a few dim rules, aiming at a dashed target it never reaches
body += box(150, 105, 170, 140, f'stroke="{LINE}"')
for yy in (145, 175, 205):
    body += f'<path d="M178 {yy} H{292 if yy != 205 else 250}" stroke="{DIM}" stroke-width="3.5"/>'
body += f'<path d="M340 175 H790" stroke="{DIM}" stroke-width="3.5" stroke-dasharray="12 11" marker-end="url(#ad)"/>'
body += f'<circle cx="870" cy="175" r="62" stroke="{DIM}" stroke-width="3.5" stroke-dasharray="10 9"/>'
body += f'<circle cx="870" cy="175" r="22" stroke="{DIM}" stroke-width="3.5" stroke-dasharray="6 7"/>'
# the week: a grid of booked hours, almost all filled
free = {(0, 3), (2, 1)}
for r in range(3):
    for c in range(5):
        x, y = 150 + c*54, 340 + r*46
        if (r, c) in free:
            body += box(x, y, 44, 34, f'stroke="{DIM}" stroke-width="3"', 6)
        else:
            body += box(x, y, 44, 34, f'stroke="{LINE}" stroke-width="3.5" fill="{DIM}" fill-opacity="0.45"', 6)
# what the week funds: a solid path to the business it already runs
body += f'<path d="M430 403 H790" marker-end="url(#a)"/>'
for i, xx in enumerate((500, 570, 640, 710)):
    body += f'<circle cx="{xx}" cy="372" r="8" fill="{LINE}" stroke="none"/>'
body += box(810, 343, 120, 120, f'stroke="{LINE}" stroke-width="5"')
body += box(832, 365, 76, 76, f'stroke="{DIM}" stroke-width="3.5"', 6)
# the gap between the two: the one honest measure
body += f'<path d="M975 175 H1030 V403 H975" stroke="{TEAL}" stroke-width="6.5"/>'
body += f'<path d="M1030 289 H1068" stroke="{TEAL}" stroke-width="6.5"/>'
svg = sheet(body)
open(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'svg', KEY + '.svg'), 'w').write(svg)
