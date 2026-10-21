import sys
from PIL import Image, ImageChops
d=sys.argv[1]
secs={'1440':[('hero',0,800),('about',800,2253),('paper',2253,3983),('process',3983,5593),('green',5593,7033),('strip',7033,7615),('faq',7615,8589),('cta',8589,9309),('footer',9309,9799)],
      '375':[('hero',0,756),('about',756,2104),('paper',2104,3307),('process',3307,5421),('green',5421,7129),('strip',7129,7429),('faq',7429,8257),('cta',8257,8921),('footer',8921,9626)]}
for w in ('1440','375'):
  f=Image.open(f'{d}/figma_{w}.png').convert('RGB'); h=Image.open(f'{d}/html_{w}.png').convert('RGB')
  H=min(f.height,h.height); print(w,'figma',f.size,'html',h.size)
  diff=ImageChops.difference(f.crop((0,0,f.width,H)),h.crop((0,0,f.width,H))).convert('L').point(lambda v:255 if v>40 else 0)
  tot=0
  for n,a,b in secs[w]:
    b=min(b,H); c=diff.crop((0,a,f.width,b)); r=sum(c.histogram()[255:])/(f.width*(b-a)); tot+=sum(c.histogram()[255:])
    print(f'  {n:8s} {r*100:5.2f}%')
  print('  total',f'{tot/(f.width*H)*100:.2f}%')
  # side by side scaled
  sc=0.25 if w=='1440' else 0.5
  W=int(f.width*sc); HH=int(H*sc)
  out=Image.new('RGB',(W*3+20,HH),'white')
  out.paste(f.crop((0,0,f.width,H)).resize((W,HH)),(0,0)); out.paste(h.crop((0,0,f.width,H)).resize((W,HH)),(W+10,0)); out.paste(diff.convert('RGB').resize((W,HH)),(2*W+20,0))
  out.save(f'{d}/page_{w}_compare.png')
