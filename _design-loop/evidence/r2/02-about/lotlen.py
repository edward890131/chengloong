import json, math, sys
d = json.load(open(sys.argv[1]))
def paths(layer):
    out = []
    def walk(o):
        if isinstance(o, dict):
            if o.get('ty') == 'sh': out.append(o['ks']['k'])
            for v in o.values(): walk(v)
        elif isinstance(o, list):
            for v in o: walk(v)
    walk(layer.get('shapes', []))
    return out
def blen(p):
    k = p if isinstance(p, dict) else p[0]['s'][0]
    v, i, o = k['v'], k['i'], k['o']; n = len(v); L = 0
    segs = n if k.get('c') else n - 1
    for a in range(segs):
        b = (a + 1) % n
        P0 = v[a]; P1 = [v[a][0] + o[a][0], v[a][1] + o[a][1]]; P2 = [v[b][0] + i[b][0], v[b][1] + i[b][1]]; P3 = v[b]
        prev = P0
        for s in range(1, 201):
            t = s / 200; mt = 1 - t
            x = mt**3*P0[0] + 3*mt*mt*t*P1[0] + 3*mt*t*t*P2[0] + t**3*P3[0]
            y = mt**3*P0[1] + 3*mt*mt*t*P1[1] + 3*mt*t*t*P2[1] + t**3*P3[1]
            L += math.hypot(x - prev[0], y - prev[1]); prev = (x, y)
    return L
for l in d['layers']:
    ps = paths(l)
    sc = l['ks'].get('s', {}).get('k')
    print(l['nm'], 'paths', len(ps), [round(blen(p), 1) for p in ps], 'scale', sc)
