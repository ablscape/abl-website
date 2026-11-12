'use strict';

const fs = require('fs');

// Read the pixel size of a JPEG from its header. No dependencies.
function jpegSize(file) {
  const buf = fs.readFileSync(file);
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) {
    throw new Error(`${file} is not a JPEG file`);
  }
  let i = 2;
  while (i < buf.length - 8) {
    if (buf[i] !== 0xff) { i += 1; continue; }
    const marker = buf[i + 1];
    if (marker === 0xff) { i += 1; continue; }
    const isFrameHeader = marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (isFrameHeader) {
      return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
    }
    const standsAlone = marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7);
    if (standsAlone) { i += 2; continue; }
    i += 2 + buf.readUInt16BE(i + 2);
  }
  throw new Error(`Could not read the size of ${file}`);
}

// Find every prepared width of one photo, for example 01-640.jpg and 01-1280.jpg for "01".
function variants(photosDir, base) {
  const safe = String(base).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`^${safe}-(\\d+)\\.jpg$`);
  const found = [];
  for (const name of fs.readdirSync(photosDir)) {
    const m = name.match(pattern);
    if (m) found.push({ name, width: Number(m[1]) });
  }
  return found.sort((a, b) => a.width - b.width);
}

module.exports = { jpegSize, variants };
