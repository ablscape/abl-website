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

// One of the firm's drawings to lie behind a heading, named by its project and number in content/site.json.
// It may also say:
//   "caption"  the word for the credit, in place of the drawing's own caption
//   "lift"     how far to brighten a drawing made on gray paper, so that its paper becomes the page's white
//              (255 divided by the paper's brightness: 1.2 for paper of about 213)
//   "focus"    where the subject sits, across and down, as "60% 40%"; "focusPhone" the same for phones
//   "from"     on a wide screen, how far from the left the drawing starts, as "36%", when its subject would
//              otherwise fall under the text
//   "asDrawn"  true to keep the drawing's own colors
// Returns the picture and its credit, or two empty strings when no drawing is named.
function planBackdrop(ctx, ref, options) {
  const project = ref && ctx.projects.find((p) => p.slug === ref.project);
  const item = project && (project.drawings.find((d) => d.file === ref.file) || project.photos.find((d) => d.file === ref.file));
  if (!item) return { plan: '', credit: '' };
  const base = `/work/${project.slug}/photos/`;
  const srcset = item.variants.map((v) => `${ctx.u(base + v.name)} ${v.width}w`).join(', ');
  const biggest = item.variants[item.variants.length - 1];
  const place = (v) => (typeof v === 'string' && /^\d{1,3}% \d{1,3}%$/.test(v) ? v : '');
  const vars = [];
  const lift = Number(ref.lift);
  if (lift > 1 && lift <= 1.6) vars.push(`--lift: ${lift}`);
  if (place(ref.focus)) vars.push(`--focus: ${ref.focus}`);
  if (place(ref.focusPhone)) vars.push(`--focus-phone: ${ref.focusPhone}`);
  const from = typeof ref.from === 'string' && /^\d{1,2}%$/.test(ref.from) ? ref.from : '';
  if (from) vars.push(`--from: ${from}`);
  const classes = ['statement-plan'];
  if (ref.asDrawn === true) classes.push('as-drawn');
  if (from) classes.push('is-side');
  const lazy = options && options.lazy ? ' loading="lazy"' : '';
  return {
    plan: `<div class="${classes.join(' ')}" data-sheet aria-hidden="true"${vars.length ? ` style="${vars.join('; ')}"` : ''}><img src="${ctx.u(base + biggest.name)}" srcset="${srcset}" sizes="100vw" width="${item.width}" height="${item.height}" alt=""${lazy} decoding="async"></div>`,
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
