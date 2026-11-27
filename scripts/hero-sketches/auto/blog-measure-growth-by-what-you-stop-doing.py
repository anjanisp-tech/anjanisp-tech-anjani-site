import math, os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from draw import sheet, box, tick, W, H, NAVY, LINE, DIM, TEAL
KEY = 'blog-measure-growth-by-what-you-stop-doing'
# The idea: growth is not the pile of work that runs through you, it is the
# work you have handed off that keeps running without you.
body = ''
# before: every task wired into one centre; a busy month that all runs through it
cx, cy = 300, 315
body += f'<circle cx="{cx}" cy="{cy}" r="40" stroke-width="5"/>'
for i in range(8):
    a = math.radians(i * 45 + 22.5)
    x, y = cx + 145 * math.cos(a), cy + 165 * math.sin(a)
    sx, sy = cx + 44 * math.cos(a), cy + 44 * math.sin(a)
    ex, ey = cx + 112 * math.cos(a), cy + 128 * math.sin(a)
    body += f'<path d="M{sx:.0f} {sy:.0f} L{ex:.0f} {ey:.0f}" stroke="{DIM}" stroke-width="3.5"/>'
    body += box(x - 30, y - 22, 60, 44, f'stroke="{LINE}" stroke-width="4.5"', 8)
# the shift
body += f'<path d="M505 315 H585" stroke="{DIM}" stroke-width="3.5" marker-end="url(#ad)"/>'
# after: the centre keeps only two wires
hx, hy = 740, 315
body += f'<circle cx="{hx}" cy="{hy}" r="40" stroke-width="5"/>'
for (bx, by) in ((660, 190), (660, 440)):
    body += f'<path d="M{hx-26} {hy-30 if by < hy else hy+30} L{bx+8} {by+22 if by < hy else by-22}" stroke="{DIM}" stroke-width="3.5"/>'
    body += box(bx - 30, by - 22, 60, 44, f'stroke="{LINE}" stroke-width="4.5"', 8)
# the old wire to the handed-off work, cut
body += f'<path d="M784 315 H818" stroke="{DIM}" stroke-width="3.5"/>'
body += f'<path d="M836 300 L846 330" stroke="{DIM}" stroke-width="3.5"/>'
# what was handed off: three tasks running on their own, in a loop
loop = [(930, 175), (1030, 330), (900, 455)]
for (bx, by) in loop:
    body += box(bx - 34, by - 25, 68, 50, f'stroke="{LINE}" stroke-width="4.5"', 8)
    body += tick(bx - 14, by - 2, 1.0, TEAL, 5)
body += f'<path d="M970 202 C1010 230, 1030 260, 1032 296" stroke="{TEAL}" stroke-width="6" marker-end="url(#at)"/>'
body += f'<path d="M1012 360 C995 410, 970 440, 942 452" stroke="{TEAL}" stroke-width="6" marker-end="url(#at)"/>'
body += f'<path d="M870 428 C850 360, 860 250, 892 196" stroke="{TEAL}" stroke-width="6" marker-end="url(#at)"/>'
svg = sheet(body)
open(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'svg', KEY + '.svg'), 'w').write(svg)
