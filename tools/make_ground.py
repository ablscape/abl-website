#!/usr/bin/env python3
"""Make the ground of the site from one of the firm's own drawings.

Usage:
    python3 tools/make_ground.py content/projects/lime-kiln-theater/photos/01-1280.jpg
    python3 tools/make_ground.py DRAWING wide_from wide_to tall_from tall_to

The ground is the faint linework that runs behind every page. This reads one drawing, enlarges
it to twice its size so that its lines stay sharp on a large screen, keeps only its lines (the
paper becomes white and the pencil shading is kept very light), prints them in the green of
the logo, and writes two sheets into static/assets/img/:

    ground-wide.webp   for computers and tablets, where one copy spans the window
    ground-tall.webp   for phones, where the window shows a narrow part of a page at a time

Each sheet holds its part of the drawing twice, the second time reversed left to right, and
the joins are blended, so the sheet repeats down a page without a visible seam and without
the same feature turning up twice side by side.

The four numbers say which part of the drawing's width each sheet uses, as shares from the
left edge. The defaults suit the Lime Kiln plan: the wide sheet takes 0 to 0.74 (everything
but the house lots at the right), and the tall sheet takes 0.34 to 0.78 (the slopes, the
woods and the drive, without the parking lots, which a phone would show over and over).
Choose a drawing without lettering: lettering would show, faintly, behind the text of every
page.

Needs Pillow:  pip install pillow
"""

import os
import sys

try:
    from PIL import Image, ImageChops, ImageFilter, ImageOps
except ImportError:
    sys.exit("Pillow is missing. Install it with:  pip install pillow")

INK = (0x64, 0x80, 0x70)   # the green of the logo, "--sage" in the stylesheet
ENLARGE = 2                # the drawing is enlarged this many times before its lines are taken
PEAK = 0.55                # how dark the strongest line gets, as a share of the ink
LINES = 3.2                # how strongly thin marks are picked out against their surroundings
FLOOR, CEILING = 0.10, 0.75  # marks fainter than FLOOR are dropped (paper grain, scanner noise); CEILING and above print at full strength
SHADING = 0.14             # how much of the broad pencil shading is kept
BLEND = 180                # rows over which one copy of the drawing passes into the next


def linework(image):
    """The drawing as a grayscale picture of its marks alone: white marks on black, 255 the strongest."""
    gray = image.convert("L")
    if ENLARGE != 1:
        gray = gray.resize((gray.width * ENLARGE, gray.height * ENLARGE), Image.LANCZOS)
    counts = gray.histogram()
    target, seen, paper = sum(counts) * 0.88, 0, 255
    for tone, count in enumerate(counts):
        seen += count
        if seen >= target:
            paper = max(1, tone)                             # the tone of the bare paper
            break
    flat = gray.point(lambda v: min(255, round(v * 255 / paper)))
    soft = flat.filter(ImageFilter.GaussianBlur(5 * ENLARGE))
    lines = ImageChops.subtract(soft, flat, scale=1 / LINES)  # marks darker than their surroundings

    def firm(v):
        # a steeper edge to every line, so that an enlarged line stays a line and does not turn to fog
        t = min(1.0, max(0.0, (v / 255 - FLOOR) / (CEILING - FLOOR)))
        return round(255 * t * t * (3 - 2 * t))

    lines = lines.point(firm)
    shading = ImageChops.invert(soft).point(lambda v: round(v * SHADING))
    return ImageChops.add(lines, shading).point(lambda v: round(v * PEAK))


def ramp(width, height, rising):
    """A mask that goes from black to white down its height (or white to black)."""
    column = Image.new("L", (1, height))
    column.putdata([round(255 * (y + 0.5) / height) if rising else round(255 * (1 - (y + 0.5) / height)) for y in range(height)])
    return column.resize((width, height))


def sheet(marks):
    """Two copies down the page, the second reversed left to right, each join blended; the end blends into the start."""
    width, height = marks.size
    copies = [marks, ImageOps.mirror(marks)]
    step = height - BLEND
    out = Image.new("L", (width, step * len(copies)))
    for i, copy in enumerate(copies):
        nxt = copies[(i + 1) % len(copies)]
        out.paste(copy.crop((0, BLEND, width, step)), (0, i * step + BLEND))
        # the last rows of this copy pass into the first rows of the next one, which start the next step
        join = Image.composite(nxt.crop((0, 0, width, BLEND)), copy.crop((0, step, width, height)), ramp(width, BLEND, True))
        out.paste(join, (0, ((i + 1) % len(copies)) * step))
    return out


def printed(marks):
    return ImageOps.colorize(ImageChops.invert(marks), black=INK, white=(255, 255, 255))


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    source = sys.argv[1]
    if len(sys.argv) not in (2, 6):
        sys.exit(__doc__)
    spans = [float(v) for v in sys.argv[2:6]] if len(sys.argv) == 6 else [0.0, 0.74, 0.34, 0.78]
    if not os.path.isfile(source):
        sys.exit(f"Drawing not found: {source}")
    image = Image.open(source).convert("RGB")
    marks = linework(image)   # from the whole drawing, so that both sheets print alike
    out_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "static", "assets", "img")
    for name, start, end in (("ground-wide.webp", spans[0], spans[1]), ("ground-tall.webp", spans[2], spans[3])):
        part = marks.crop((round(marks.width * start), 0, round(marks.width * end), marks.height))
        result = printed(sheet(part))
        path = os.path.join(out_dir, name)
        result.save(path, "WEBP", quality=50, method=6)
        print(f"{name}: {result.width} x {result.height} pixels, {os.path.getsize(path) // 1024} KB")


if __name__ == "__main__":
    main()
