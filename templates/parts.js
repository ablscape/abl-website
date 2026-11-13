'use strict';

const { esc, picture } = require('../lib/html');

// One project as it appears in a collage: its cover (a photograph or a drawing), its kind, title, place and year.
function projectCard(ctx, project, sizes) {
  const meta = project.year ? `${project.location}, ${project.year}` : project.location;
  const draft = ctx.showNotes && project.status === 'draft' ? '<span class="draft-tag">Draft</span>' : '';
  const cover = project.coverPhoto;
  return `<a class="card" href="${ctx.u(project.url)}">
      <span class="card-image ${cover.isDrawing ? 'is-drawing' : 'is-photo'}"${cover.isDrawing ? ' data-sheet' : ' data-photo'}>${picture(ctx, project, cover, { sizes })}</span>
      <span class="card-kind">${esc(project.type)}</span>
      <span class="card-title">${esc(project.title)}${draft}</span>
      <span class="card-meta">${esc(meta)}</span>
    </a>`;
}

// A short label over a section, with the accent rule above it.
function sectionLabel(text) {
  return `<h2 class="section-label">${esc(text)}</h2>`;
}

// One of the firm's drawings as the ground of a page: it runs from the top edge of the page, behind the header,
// and dissolves into the white below the heading. Named by its project and number in content/site.json, with
// "focus" (where the subject sits, as "60% 80%") and "asDrawn" (keep the drawing's own colors) when wanted.
// Returns the picture and its credit, or two empty strings when none is named.
function planBackdrop(ctx, ref) {
  const project = ref && ctx.projects.find((p) => p.slug === ref.project);
  const item = project && (project.drawings.find((d) => d.file === ref.file) || project.photos.find((d) => d.file === ref.file));
  if (!item) return { plan: '', credit: '' };
  const base = `/work/${project.slug}/photos/`;
  const srcset = item.variants.map((v) => `${ctx.u(base + v.name)} ${v.width}w`).join(', ');
  const biggest = item.variants[item.variants.length - 1];
  const focus = typeof ref.focus === 'string' && /^\d{1,3}% \d{1,3}%$/.test(ref.focus) ? ` style="--focus: ${ref.focus}"` : '';
  return {
    plan: `<div class="ground${ref.asDrawn === true ? ' as-drawn' : ''}" data-depth="ground" aria-hidden="true"${focus}><div class="ground-sheet"><img src="${ctx.u(base + biggest.name)}" srcset="${srcset}" sizes="100vw" width="${item.width}" height="${item.height}" alt="" decoding="async" fetchpriority="high"></div></div>`,
    credit: `<p class="head-credit"><a href="${ctx.u(project.url)}">${esc(ref.caption || item.caption || 'Plan')}, ${esc(project.title)}</a></p>`,
  };
}

// The heading of a page, set on one of the firm's drawings when one is named.
function pageHead(ctx, ref, inner) {
  const back = planBackdrop(ctx, ref);
  return `<section class="page-statement${back.plan ? ' has-ground' : ''}">
  ${back.plan}
  <div class="head-inner">
    ${inner}
  </div>
  ${back.credit}
</section>`;
}

module.exports = { projectCard, sectionLabel, planBackdrop, pageHead };
