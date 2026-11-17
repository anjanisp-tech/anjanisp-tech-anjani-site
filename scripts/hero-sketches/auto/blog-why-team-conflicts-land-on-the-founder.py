import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from draw import sheet, box, tick, W, H, NAVY, LINE, DIM, TEAL
KEY = 'blog-why-team-conflicts-land-on-the-founder'
# The idea: a decision on the seam between two equal roles has no owner, so every clash
# rolls up to the founder; the fix is one named owner sitting on that seam.
body = ''
# the founder at the top, with a pile of escalations stacked beside the box
body += box(510, 95, 180, 96, f'stroke="{LINE}" stroke-width="5"')
body += box(545, 120, 110, 46, f'stroke="{DIM}" stroke-width="3.5"', 6)
for i in range(4):
    body += box(730, 165 - i*24, 110, 18, f'stroke="{DIM}" stroke-width="3"', 5)
# authority lines down to the two equal roles
body += f'<path d="M560 191 C540 260, 360 300, 310 375" stroke="{DIM}" stroke-width="3.5"/>'
body += f'<path d="M640 191 C660 260, 840 300, 890 375" stroke="{DIM}" stroke-width="3.5"/>'
# the two equal roles
body += box(200, 380, 220, 120, f'stroke="{LINE}"')
body += box(780, 380, 220, 120, f'stroke="{LINE}"')
for x in (230, 810):
    body += f'<path d="M{x} 425 H{x+150}" stroke="{DIM}" stroke-width="3.5"/>'
    body += f'<path d="M{x} 455 H{x+110}" stroke="{DIM}" stroke-width="3.5"/>'
# the seam between them, and the old route: the clash climbs to the founder
body += f'<path d="M600 520 V340" stroke="{DIM}" stroke-width="3.5" stroke-dasharray="10 10"/>'
body += f'<path d="M600 340 V212" stroke="{DIM}" stroke-width="3.5" stroke-dasharray="10 10" marker-end="url(#ad)"/>'
# the fix: one named owner sitting on the seam, both sides feed it
body += f'<path d="M600 400 L642 440 L600 480 L558 440 Z" stroke="{TEAL}" stroke-width="6.5"/>'
body += f'<circle cx="600" cy="440" r="9" fill="{TEAL}" stroke="none"/>'
body += f'<path d="M430 440 H540" stroke="{TEAL}" stroke-width="5" marker-end="url(#at)"/>'
body += f'<path d="M770 440 H660" stroke="{TEAL}" stroke-width="5" marker-end="url(#at)"/>'
svg = sheet(body)
open(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'svg', KEY + '.svg'), 'w').write(svg)
