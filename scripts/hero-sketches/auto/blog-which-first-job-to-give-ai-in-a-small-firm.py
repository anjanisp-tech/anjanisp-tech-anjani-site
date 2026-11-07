import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from draw import sheet, box, tick, W, H, NAVY, LINE, DIM, TEAL
KEY = 'blog-which-first-job-to-give-ai-in-a-small-firm'
# The idea: of all the jobs a firm could hand to AI, the right first one is the small, boring,
# weekly task that passes every safety test; bigger jobs that reach outside the firm stop at a gate.
jobs = [(150, 110, 180, 70), (150, 192, 130, 46), (150, 296, 90, 44), (150, 370, 160, 80), (150, 480, 110, 46)]
body = ''
for i, (x, y, w, h) in enumerate(jobs):
    if i == 2:
        continue
    body += box(x, y, w, h, f'stroke="{DIM}" stroke-width="3.5"')
# four gates
gates = [480, 590, 700, 810]
for gx in gates:
    body += f'<path d="M{gx} 110 V230" stroke="{LINE}" stroke-width="4.5"/>'
    body += f'<path d="M{gx} 370 V530" stroke="{LINE}" stroke-width="4.5"/>'
# stopped paths for the big jobs
for (x, y, w, h), stop in zip([jobs[0], jobs[1], jobs[3], jobs[4]], [480, 590, 480, 700]):
    yy = y + h/2
    body += f'<path d="M{x+w+10} {yy} H{stop-18}" stroke="{DIM}" stroke-width="3.5" stroke-dasharray="10 9"/>'
    body += f'<path d="M{stop-18} {yy-16} V{yy+16}" stroke="{DIM}" stroke-width="5"/>'
# the chosen small job passes through the open gap of every gate
ty = 318
body += box(150, 296, 90, 44, f'stroke="{TEAL}" stroke-width="5.5"')
body += f'<path d="M250 {ty} H905" stroke="{TEAL}" stroke-width="6" marker-end="url(#at)"/>'
for gx in gates:
    body += tick(gx - 14, 262, 0.9, DIM, 3.5)
body += box(920, 258, 140, 120, f'stroke="{TEAL}" stroke-width="5.5"')
body += tick(966, 318, 1.4, TEAL, 6)
svg = sheet(body)
open(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'svg', KEY + '.svg'), 'w').write(svg)
