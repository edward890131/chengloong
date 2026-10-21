import json, math, sys
d = json.load(open(sys.argv[1]))
def shapes(layer, ty):
    out=[]
    def walk(o, nm=None):
        if isinstance(o, dict):
            if o.get('ty')=='gr': nm=o.get('nm')
            if o.get('ty')==ty: out.append((nm,o))
            for v in o.values(): walk(v, nm)
        elif isinstance(o, list):
            for v in o: walk(v, nm)
    walk(layer['shapes']); return out
def pts(k, N=200):
    k = k if isinstance(k, dict) else k[0]['s'][0]
    v,i,o=k['v'],k['i'],k['o'];n=len(v);segs=n if k.get('c') else n-1;P=[]
    for a in range(segs):
        b=(a+1)%n;P0=v[a];P1=[v[a][0]+o[a][0],v[a][1]+o[a][1]];P2=[v[b][0]+i[b][0],v[b][1]+i[b][1]];P3=v[b]
        for s in range(N):
            t=s/N;mt=1-t
            P.append((mt**3*P0[0]+3*mt*mt*t*P1[0]+3*mt*t*t*P2[0]+t**3*P3[0], mt**3*P0[1]+3*mt*mt*t*P1[1]+3*mt*t*t*P2[1]+t**3*P3[1]))
    P.append(tuple(v[0] if k.get('c') else v[-1]));return P
by={l['nm']:l for l in d['layers']}
mp=pts(shapes(by['箭頭遮罩'],'sh')[0][1]['ks']['k'])
cum=[0]
for a,b in zip(mp,mp[1:]): cum.append(cum[-1]+math.hypot(b[0]-a[0],b[1]-a[1]))
L=cum[-1]
for nm,sh in shapes(by['箭頭'],'sh'):
    q=pts(sh['ks']['k'],20)
    us=[]
    for x,y in q:
        for j in range(len(mp)-1):
            a,b=mp[j],mp[j+1];tx,ty=b[0]-a[0],b[1]-a[1];l=math.hypot(tx,ty) or 1
            proj=((x-a[0])*tx+(y-a[1])*ty)/l
            if 0<=proj<=l and abs((x-a[0])*ty-(y-a[1])*tx)/l<=45: us.append(100*(cum[j]+proj)/L)
    us.sort()
    # cluster
    cl=[];
    for u in us:
        if cl and u-cl[-1][1]<1: cl[-1][1]=u
        else: cl.append([u,u])
    print(nm, [(round(a,2),round(b,2)) for a,b in cl])
print('L',round(L,1))
