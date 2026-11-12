#!/usr/bin/env python3
"""Prepare photographs for a project page.

Usage:
    python3 tools/prepare_photos.py content/projects/<slug> photo1.jpg photo2.jpg ...

For each photograph, in the order given, this writes web-sized copies into
content/projects/<slug>/photos/ named 01-640.jpg, 01-1280.jpg, 01-1920.jpg and
01-2560.jpg. Sizes larger than the original are skipped. Numbering continues
after any photographs already in the folder.

Colors are converted to sRGB, and location data and other camera details are
removed, so a client's address never travels inside a file.

Needs Pillow:  pip install pillow
"""

import io
import os
import re
import sys

try:
    from PIL import Image, ImageCms, ImageOps
except ImportError:
    sys.exit("Pillow is missing. Install it with:  pip install pillow")

WIDTHS = (640, 1280, 1920, 2560)
TARGET = 2560


def to_srgb(image):
    """Convert to sRGB so colors look the same in every browser."""
    profile = image.info.get("icc_profile")
    if profile:
        try:
            source = ImageCms.ImageCmsProfile(io.BytesIO(profile))
            target = ImageCms.createProfile("sRGB")
            return ImageCms.profileToProfile(image, source, target, outputMode="RGB")
        except Exception:
            pass
    return image.convert("RGB")


def main():
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    project_dir = sys.argv[1].rstrip("/")
    sources = sys.argv[2:]
    if not os.path.isdir(os.path.dirname(project_dir) or "."):
        sys.exit(f"Folder not found: {os.path.dirname(project_dir)}")
    photos_dir = os.path.join(project_dir, "photos")
    os.makedirs(photos_dir, exist_ok=True)

    taken = []
    for name in os.listdir(photos_dir):
        match = re.match(r"^(\d+)-\d+\.jpg$", name)
        if match:
            taken.append(int(match.group(1)))
    number = max(taken, default=0)

    lines = []
    for source in sources:
        if not os.path.isfile(source):
            sys.exit(f"File not found: {source}")
        number += 1
        base = f"{number:02d}"
        image = ImageOps.exif_transpose(Image.open(source))
        image = to_srgb(image)
        widths = [w for w in WIDTHS if w <= image.width] or [image.width]
        for width in widths:
            height = round(image.height * width / image.width)
            resized = image if width == image.width else image.resize((width, height), Image.LANCZOS)
            resized.save(os.path.join(photos_dir, f"{base}-{width}.jpg"), "JPEG",
                         quality=82, progressive=True, optimize=True)
        note = ""
        if image.width < TARGET:
            note = f"  (original is {image.width} px wide; ask for a file at least {TARGET} px wide)"
        print(f"{base}: {os.path.basename(source)} -> {', '.join(str(w) for w in widths)} px{note}")
        lines.append(f'    {{ "file": "{base}", "alt": "", "caption": "", "credit": "" }}')

    print("\nAdd these to \"photos\" in project.json, then write the alt text for each:\n")
    print(",\n".join(lines))


if __name__ == "__main__":
    main()
