import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from draw import sheet, box, tick, W, H, NAVY, LINE, DIM, TEAL
KEY = 'blog-how-a-small-firm-can-start-with-ai-safely'
# The idea: start with one small, boring job inside a written fence of what it must
# never do, and have a person check its output against something real.
rows = ''.join(f'<path d="M{270} {285 + i*28} H{390}" stroke="{DIM}" stroke-width="3.5"/>' for i in range(3))
svg = sheet(f'''
{box(140, 140, 400, 350, f'stroke="{LINE}" stroke-width="4.5" stroke-dasharray="14 12"', 22)}
{box(245, 255, 170, 130)}{rows}
<path d="M330 250 V172" stroke="{DIM}" stroke-width="3.5" marker-end="url(#ad)"/>
<path d="M300 158 H360" stroke-width="6"/>
<path d="M240 320 H172" stroke="{DIM}" stroke-width="3.5" marker-end="url(#ad)"/>
<path d="M158 290 V350" stroke-width="6"/>
<path d="M330 390 V458" stroke="{DIM}" stroke-width="3.5" marker-end="url(#ad)"/>
<path d="M300 472 H360" stroke-width="6"/>
<path d="M420 320 H640" marker-end="url(#a)"/>
{box(655, 255, 150, 130)}
<path d="M685 295 H775 M685 323 H775 M685 351 H750" stroke="{DIM}" stroke-width="3.5"/>
{box(905, 255, 150, 130, f'stroke="{DIM}" stroke-width="3.5"')}
<path d="M935 295 H1025 M935 323 H1025 M935 351 H1000" stroke="{DIM}" stroke-width="3.5"/>
<path d="M730 392 V440 H980 V392" stroke="{TEAL}" stroke-width="5.5"/>
<path d="M830 300 H880 M880 300 l-12 -10 M880 300 l-12 10" stroke="{TEAL}" stroke-width="5"/>
<path d="M880 340 H830 M830 340 l12 -10 M830 340 l12 10" stroke="{TEAL}" stroke-width="5"/>
<circle cx="855" cy="490" r="34" stroke="{TEAL}" stroke-width="5"/>
{tick(842, 490, 1.0, TEAL, 6)}
<path d="M855 440 V456" stroke="{TEAL}" stroke-width="5"/>''')
open(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'svg', KEY + '.svg'), 'w').write(svg)
