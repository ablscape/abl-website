'use strict';

// Small helpers shared by the templates. No dependencies.

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

// Make any text safe to place inside HTML.
function esc(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, (c) => ESCAPES[c]);
}

// Turn a list of plain-text paragraphs into <p> elements.
function paragraphs(list) {
  return (list || []).map((p) => `<p>${esc(p)}</p>`).join('\n');
}

// Build the link helper for one page.
//   Normal builds:   u('/work/') -> '/work/'
//   Portable builds: u('/work/') -> '../work/index.html' (works when opened from a folder)
function makeUrl(pagePath, portable) {
  return function u(target) {
    if (!portable) return target;
    const parts = String(target).split('#');
    const pathPart = parts[0];
    const hash = parts.length > 1 ? '#' + parts.slice(1).join('#') : '';
    const fromSegments = pagePath.split('/').filter(Boolean);
    const depth = pagePath.endsWith('/') ? fromSegments.length : fromSegments.length - 1;
    const toSegments = pathPart.split('/').filter(Boolean);
    let rel = '../'.repeat(Math.max(depth, 0)) + toSegments.join('/');
    if (pathPart.endsWith('/')) rel += (toSegments.length ? '/' : '') + 'index.html';
    return (rel || 'index.html') + hash;
  };
}

// A responsive <img> for one project photo.
function picture(ctx, project, photo, opts) {
  const o = Object.assign({ sizes: '100vw', cls: '', lazy: true }, opts || {});
  const base = `/work/${project.slug}/photos/`;
  const srcset = photo.variants.map((v) => `${ctx.u(base + v.name)} ${v.width}w`).join(', ');
  const fallback = photo.variants.find((v) => v.width >= 1280) || photo.variants[photo.variants.length - 1];
  const attrs = [
    o.cls ? `class="${o.cls}"` : '',
    `src="${ctx.u(base + fallback.name)}"`,
    `srcset="${srcset}"`,
    `sizes="${o.sizes}"`,
    `width="${photo.width}"`,
    `height="${photo.height}"`,
    `alt="${esc(photo.alt)}"`,
    o.lazy ? 'loading="lazy" decoding="async"' : 'fetchpriority="high"',
  ].filter(Boolean);
  return `<img ${attrs.join(' ')}>`;
}

// Text that the firm still owes. Shown as a yellow marker in previews, left out of the live site.
function toCome(ctx, label) {
  return ctx.showNotes ? `<span class="to-come">To come: ${esc(label)}</span>` : '';
}

// A review note above draft text. Shown in previews only.
function reviewNote(ctx, text) {
  if (!ctx.showNotes || !text) return '';
  return `<p class="review-note"><strong>Preview note.</strong> ${esc(text)}</p>`;
}

// The "abl" of the firm's logo as a drawing, so it stays sharp at any size and can take any color.
// Redrawn from the 230-pixel logo file and fitted to it by measurement. Replace the path with the firm's own vector
// artwork when it is supplied. The header logo, static/assets/img/logo.svg, holds the same path.
const MARK_PATH = 'M28.8 35.4V21A14.4 14.4 0 1 0 20.5 34.04V27.48A8.9 8.9 0 1 1 23.3 21V35.4ZM37.1 0V21A14.4 14.4 0 1 0 45.4 7.96V14.52A8.9 8.9 0 1 1 42.6 21V0ZM76 0H81.5V35.4H76Z';
function markSvg() {
  return `<svg viewBox="0 0 81.6 35.5" aria-hidden="true" focusable="false"><path d="${MARK_PATH}"/></svg>`;
}

module.exports = { esc, paragraphs, makeUrl, picture, toCome, reviewNote, markSvg };
