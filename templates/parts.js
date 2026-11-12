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

// One of the firm's plans to sit behind the heading of a page, named by its project and number.
// Returns the picture and its credit, or two empty strings when no plan is named.
function planBackdrop(ctx, ref) {
  const project = ref && ctx.projects.find((p) => p.slug === ref.project);
  const item = project && (project.drawings.find((d) => d.file === ref.file) || project.photos.find((d) => d.file === ref.file));
  if (!item) return { plan: '', credit: '' };
  const base = `/work/${project.slug}/photos/`;
  const srcset = item.variants.map((v) => `${ctx.u(base + v.name)} ${v.width}w`).join(', ');
  const biggest = item.variants[item.variants.length - 1];
  return {
    plan: `<div class="statement-plan" data-sheet aria-hidden="true"><img src="${ctx.u(base + biggest.name)}" srcset="${srcset}" sizes="100vw" width="${item.width}" height="${item.height}" alt="" decoding="async"></div>`,
    credit: `<p class="statement-credit"><a href="${ctx.u(project.url)}">${esc(ref.caption || item.caption || 'Plan')}, ${esc(project.title)}</a></p>`,
  };
}

// The heading of a page, set over a plan when one is named.
function pageHead(ctx, ref, inner) {
  const back = planBackdrop(ctx, ref);
  return `<section class="statement page-statement${back.plan ? ' has-plan' : ''}">
  ${back.plan}
  <div class="statement-inner">
    ${inner}
  </div>
  ${back.credit}
</section>`;
}

module.exports = { projectCard, sectionLabel, planBackdrop, pageHead };
