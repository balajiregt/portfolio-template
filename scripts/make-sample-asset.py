"""Regenerate the original, explicitly illustrative sample bitmap (optional Pillow utility)."""
from PIL import Image, ImageDraw
from pathlib import Path
im=Image.new('RGB',(640,640),'#eaf1ed')
d=ImageDraw.Draw(im)
d.line([(170,165),(440,165),(440,450),(170,450),(170,165)],fill='#83978c',width=5)
d.line([(170,165),(440,450)],fill='#83978c',width=4)
for x,y,c in [(170,165,'#246d54'),(440,165,'#267d9b'),(440,450,'#af8350'),(170,450,'#805967')]:
    d.rounded_rectangle((x-70,y-70,x+70,y+70),radius=10,fill=c)
    for yy in [y-25,y,y+25]:
        d.rounded_rectangle((x-40,yy-5,x+40,yy+5),radius=4,fill='#f2f7f4')
Path('public/assets').mkdir(parents=True,exist_ok=True)
im.save('public/assets/sample-workbench.png')
