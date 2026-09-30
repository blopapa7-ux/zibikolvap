# Arma una carpeta de prueba parecida a D:\01_MODELOS con fotos sintéticas (manchas de color),
# para probar el escáner sin usar fotos reales. Uso: python3 make_fixture.py <carpeta-destino>
import os
import random
import shutil
import sys

from PIL import Image, ImageDraw

dest = sys.argv[1] if len(sys.argv) > 1 else 'fixture'
root = os.path.join(dest, '01_MODELOS')
shutil.rmtree(root, ignore_errors=True)


def photo(path, w=1080, h=1440, seed=0):
    rnd = random.Random(seed)
    im = Image.new('RGB', (w, h), tuple(rnd.randint(0, 255) for _ in range(3)))
    d = ImageDraw.Draw(im)
    for _ in range(40):
        x0, y0 = rnd.randint(0, w), rnd.randint(0, h)
        d.ellipse([x0, y0, x0 + rnd.randint(60, 500), y0 + rnd.randint(60, 500)], fill=tuple(rnd.randint(0, 255) for _ in range(3)))
    im = Image.blend(im, Image.effect_noise((w, h), 40).convert('RGB'), 0.18)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    im.save(path, quality=92)


s = 1
for i in range(15):
    photo(f'{root}/Camila Wang/CASUALES/IMG_{1000 + i}.jpg', seed=s); s += 1
for i in range(12):
    photo(f'{root}/Camila Wang/BAILES/baile_{i:02d}.jpg', seed=s); s += 1
photo(f'{root}/Camila Wang/cara.jpg', 900, 1100, seed=s); s += 1
# duplicado exacto, foto chica y foto horizontal: el escáner tiene que saltearlas o dejarlas para el final
shutil.copy(f'{root}/Camila Wang/CASUALES/IMG_1000.jpg', f'{root}/Camila Wang/CASUALES/IMG_1000 (copia).jpg')
photo(f'{root}/Camila Wang/CASUALES/chiquita.jpg', 400, 500, seed=s); s += 1
photo(f'{root}/Camila Wang/CASUALES/horizontal.jpg', 1600, 900, seed=s); s += 1
for i in range(8):
    photo(f'{root}/Marisa Kim/foto_{i}.jpg', seed=s); s += 1
for i in range(3):
    photo(f'{root}/ARMADO CALENDARIO INSTAGRAM/pieza_{i}.png', 1080, 1350, seed=s); s += 1
for i in range(22):
    photo(f'{root}/NAOMI TANAKA/{i:03d}.jpg', seed=s); s += 1
with open(f'{root}/Camila Wang/BAILES/video_baile.mp4', 'wb') as f:
    f.write(os.urandom(200000))
with open(f'{root}/Camila Wang/desktop.ini', 'w') as f:
    f.write('[.ShellClassInfo]')
with open(f'{root}/notas.txt', 'w') as f:
    f.write('hola')
print(root)
