from __future__ import annotations

"""Generate SlateCamp-ready GLB hinge assets using Articraft-derived hinge anatomy.

This script is intentionally local/offline. Articraft was used to validate the core
butt-hinge geometry grammar (leaf plates, alternating knuckles, pin, countersunk
screws). The variants below extend that grammar into separate article-ready GLBs.
"""

import json
import math
from pathlib import Path

import numpy as np
import trimesh

ROOT = Path('/Users/philiplewis/slatecamp')
OUT = ROOT / 'public' / 'models' / 'wiki' / 'door-hinges'
EXP = ROOT / '.ai' / '07_experiments' / 'articraft-hinge-assets' / 'slatecamp-glb-assets'
OUT.mkdir(parents=True, exist_ok=True)
EXP.mkdir(parents=True, exist_ok=True)

COLORS = {
    'leaf': [0.78, 0.83, 0.87, 1.0],
    'body': [0.70, 0.77, 0.82, 1.0],
    'barrel': [0.58, 0.65, 0.72, 1.0],
    'screw': [0.50, 0.56, 0.63, 1.0],
    'slot': [0.22, 0.27, 0.32, 1.0],
}

def rgba(name):
    return (np.array(COLORS[name]) * 255).astype(np.uint8)

def mat(mesh, name):
    mesh.visual = trimesh.visual.ColorVisuals(mesh, face_colors=rgba(name))
    return mesh

def tr(mesh, xyz=(0,0,0), rpy=(0,0,0)):
    T = trimesh.transformations.euler_matrix(*rpy, axes='sxyz')
    T[:3, 3] = xyz
    mesh.apply_transform(T)
    return mesh

def box(size, pos, material='leaf'):
    return mat(tr(trimesh.creation.box(extents=size), pos), material)

def cyl_y(radius, height, pos, material='barrel', sections=36):
    m = trimesh.creation.cylinder(radius=radius, height=height, sections=sections)
    return mat(tr(m, pos, (-math.pi/2, 0, 0)), material)

def cyl_z(radius, height, pos, material='screw', sections=36):
    return mat(tr(trimesh.creation.cylinder(radius=radius, height=height, sections=sections), pos), material)

def sphere(radius, pos, material='screw'):
    return mat(tr(trimesh.creation.icosphere(subdivisions=2, radius=radius), pos), material)

def screw(pos, r=0.045):
    x,y,z = pos
    return [cyl_z(r, 0.018, (x,y,z), 'screw', 28), box((r*1.45, r*0.16, 0.012), (x,y,z+0.014), 'slot'), box((r*0.16, r*1.45, 0.012), (x,y,z+0.016), 'slot')]

def hinge_leaf(x, height=1.75, width=0.58, screws=4):
    parts=[box((width,height,0.06),(x,0,0),'leaf'), box((width,0.025,0.02),(x,height/2-0.035,0.04),'body'), box((width,0.025,0.02),(x,-height/2+0.035,0.04),'body')]
    ys = [height*.28,-height*.28] if screws==2 else [height*.32,height*.12,-height*.12,-height*.32]
    for y in ys: parts += screw((x,y,0.055),0.05)
    return parts

def knuckles(height=1.85, count=5, radius=0.08):
    parts=[cyl_y(radius*.55,height+.08,(0,0,0.015),'screw')]
    seg=height/count
    for i in range(count):
        y=-height/2+seg/2+i*seg
        parts.append(cyl_y(radius,seg*.76,(0,y,0.015),'barrel' if i%2==0 else 'body'))
        parts.append(box((radius*1.45,seg*.56,0.04),((-radius*1.18 if i%2==0 else radius*1.18),y,0.005),'body' if i%2==0 else 'leaf'))
    parts += [cyl_y(radius*.72,0.06,(0,height/2+.065,0.015),'screw'), cyl_y(radius*.72,0.06,(0,-height/2-.065,0.015),'screw')]
    return parts

def butt_family(kind):
    parts = hinge_leaf(-.38, width=.5) + hinge_leaf(.38, width=.5)
    for y in [-.62,0,.62]: parts.append(box((.22,.26,.052),(-.12,y,.035),'body'))
    for y in [-.31,.31]: parts.append(box((.22,.28,.052),(.12,y,.035),'leaf'))
    parts += knuckles()
    if kind=='loose-pin': parts += [cyl_y(.04,.36,(0,1.17,.04),'leaf'), cyl_y(.12,.07,(0,1.4,.04),'leaf')]
    if kind=='ball-bearing':
        for y in [-.56,0,.56]:
            parts += [cyl_y(.13,.04,(0,y,.08),'body'), cyl_y(.095,.052,(0,y,.08),'leaf')]
            for x in [-.055,0,.055]: parts.append(sphere(.018,(x,y,.135),'screw'))
    if kind=='spring':
        parts.append(cyl_y(.14,1.55,(0,0,.12),'barrel'))
        for i in range(11): parts.append(box((.34,.018,.024),(0,-.72+i*.145,.275),'screw'))
        parts += [cyl_y(.105,.08,(0,.86,.12),'leaf'), cyl_y(.105,.08,(0,-.86,.12),'leaf')]
    return parts

def pivot():
    parts=[box((.54,1.72,.055),(.1,0,-.02),'leaf'), box((.88,.22,.12),(-.33,-1,.035),'body'), box((.88,.22,.12),(-.33,1,.035),'body'), cyl_y(.026,2.18,(-.66,0,.09),'screw'), cyl_y(.145,.19,(-.66,-1,.13),'barrel'), cyl_y(.145,.19,(-.66,1,.13),'barrel'), cyl_y(.075,.24,(-.66,-.78,.105),'body'), cyl_y(.075,.24,(-.66,.78,.105),'body'), box((.34,.11,.075),(-.43,-1,.08),'body'), box((.34,.11,.075),(-.43,1,.08),'body'), box((.46,.16,.06),(-.66,-1.18,.035),'leaf'), box((.46,.16,.06),(-.66,1.18,.035),'leaf')]
    for x in [-.42,.04]: parts += screw((x,-.96,.14),.043)+screw((x,.96,.14),.043)
    return parts

def continuous():
    parts=hinge_leaf(-.27,2.25,.42)+hinge_leaf(.27,2.25,.42)+[box((.16,2.2,.052),(-.08,0,.022),'body'), box((.16,2.2,.052),(.08,0,.022),'body')]+knuckles(2.35,13,.055)
    for m in parts: m.apply_scale([.8,1.12,1])
    return parts

def concealed():
    parts=[box((.38,1.12,.06),(-.62,0,-.04),'leaf'), box((.42,.92,.06),(.62,0,-.04),'body'), cyl_z(.30,.075,(-.58,0,.045),'body',48), cyl_z(.225,.03,(-.58,0,.095),'screw',48), cyl_z(.14,.016,(-.58,0,.13),'barrel',36), box((.30,.58,.07),(.58,0,.055),'leaf'), box((.22,.08,.055),(.58,.24,.1),'barrel'), box((.22,.08,.055),(.58,-.24,.1),'barrel'), box((.9,.075,.045),(.05,.13,.1),'leaf'), box((.9,.075,.045),(.05,-.13,.12),'barrel'), cyl_y(.055,.24,(-.16,.33,.13),'barrel'), cyl_y(.055,.24,(.16,-.33,.13),'barrel')]
    for x,y in [(-.58,0),(.58,0),(0,.24),(0,-.24)]: parts += screw((x,y,.145),.038)
    return parts

def parliament():
    parts=[box((.18,1.68,.055),(-.95,0,-.05),'leaf'), box((.18,1.68,.055),(.95,0,-.05),'leaf'), box((.62,1.42,.055),(-.58,0,.015),'leaf'), box((.62,1.42,.055),(.58,0,.015),'leaf'), box((.36,1.18,.07),(-.28,0,.075),'body'), box((.36,1.18,.07),(.28,0,.075),'body'), box((.2,.16,.075),(-.06,.48,.11),'body'), box((.2,.16,.075),(.06,-.48,.11),'leaf')]+knuckles(1.65,5,.082)
    for x in [-.95,.95]:
        for y in [.48,-.48]: parts += screw((x,y,.005),.04)
    for x in [-.56,.56]:
        for y in [.32,-.32]: parts += screw((x,y,.08),.038)
    return parts

def strap():
    parts=[box((.24,1.18,.06),(-.62,0,.02),'leaf'), box((.22,.34,.075),(-.36,0,.035),'body'), box((1.22,.16,.055),(.1,0,.03),'leaf'), box((.5,.12,.052),(.52,.105,.033),'leaf'), box((.5,.12,.052),(.52,-.105,.033),'leaf'), box((.26,.24,.055),(.84,0,.034),'leaf'), cyl_y(.07,1.28,(-.78,0,.08),'barrel'), cyl_y(.08,.24,(-.78,.38,.09),'body'), cyl_y(.08,.24,(-.78,-.38,.09),'body')]
    for x in [-.52,-.1,.32,.7]: parts += screw((x,0,.085),.047)
    for y in [.35,-.35]: parts += screw((-.62,y,.09),.052)
    return parts

BUILDERS = {
    'butt': lambda: butt_family('butt'),
    'loose-pin': lambda: butt_family('loose-pin'),
    'ball-bearing': lambda: butt_family('ball-bearing'),
    'spring': lambda: butt_family('spring'),
    'pivot': pivot,
    'continuous': continuous,
    'concealed': concealed,
    'parliament': parliament,
    'strap': strap,
}

manifest = {
    'source': 'Articraft-derived SlateCamp hinge GLB pass',
    'articraft_record': 'rec_create-a-recognition-grade-architectural-butt-hi_20260516_074918_697657_49211ad4',
    'license_notes': 'Internal generated assets; keep Articraft Apache-2.0 / CC-BY-4.0 provenance if distributing as Articraft-derived work.',
    'assets': {},
}
for name,builder in BUILDERS.items():
    scene = trimesh.Scene()
    for i,mesh in enumerate(builder()):
        scene.add_geometry(mesh, node_name=f'{name}_{i:03d}')
    out = OUT / f'{name}.glb'
    scene.export(out)
    mirror = EXP / f'{name}.glb'
    mirror.write_bytes(out.read_bytes())
    manifest['assets'][name] = {'public_path': f'/models/wiki/door-hinges/{name}.glb', 'bytes': out.stat().st_size}

(EXP / 'manifest.json').write_text(json.dumps(manifest, indent=2))
(OUT / 'manifest.json').write_text(json.dumps(manifest, indent=2))
print(json.dumps(manifest, indent=2))
