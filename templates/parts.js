'use strict';

const { esc, picture, liftStyle } = require('../lib/html');

// One project as it is listed on the home page and the Work page: its cover (a photograph or a drawing), its kind, title, place and year.
function projectCard(ctx, project, sizes) {
  const meta = project.year ? `${project.location}, ${project.year}` : project.location;
  const draft = ctx.showNotes && project.status === 'draft' ? '<span class="draft-tag">Draft</span>' : '';
  const cover = project.coverPhoto;
  return `<a class="card" href="${ctx.u(project.url)}">
      <span class="card-image ${cover.isDrawing ? 'is-drawing' : 'is-photo'}"${cover.isDrawing ? ` data-sheet${liftStyle(cover)}` : ' data-photo'}>${picture(ctx, project, cover, { sizes })}</span>
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
//   "lift"     how far to brighten a drawing made on gray paper, so that its paper becomes the page's white
//              (255 divided by the paper's brightness: 1.2 for paper of about 213)
//   "focus"    where the subject sits, across and down, as "60% 40%", for the rare window in which the drawing
//              has to be trimmed; "focusPhone" the same for phones
//   "asDrawn"  true to keep the drawing's own colors
//   "shift"    how far to move the drawing down behind a page's heading on a wide screen, as "2.75rem"
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
  // The drawing is shown whole, so the page needs its proportions.
  vars.push(`--ratio: ${item.width} / ${item.height}`);
  const classes = ['statement-plan'];
  if (ref.asDrawn === true) classes.push('as-drawn');
  const lazy = options && options.lazy ? ' loading="lazy"' : '';
  // Behind a heading the drawing takes at most 62 percent of a wide window; across the home page it takes all of it.
  const sizes = options && options.wide ? '100vw' : '(min-width: 1024px) 62vw, 100vw';
  return {
    plan: `<div class="${classes.join(' ')}" data-sheet aria-hidden="true"${vars.length ? ` style="${vars.join('; ')}"` : ''}><img src="${ctx.u(base + biggest.name)}" srcset="${srcset}" sizes="${sizes}" width="${item.width}" height="${item.height}" alt=""${lazy} decoding="async"></div>`,
    // The credit names what the drawing is of, the project, and nothing else: the firm asked for the kind of
    // drawing ("Plan of the entrance,") to be left out.
    credit: `<p class="statement-credit"><a href="${ctx.u(project.url)}">${esc(project.title)}</a></p>`,
  };
}

// The heading of a page, set over a plan when one is named.
function pageHead(ctx, ref, inner) {
  const back = planBackdrop(ctx, ref);
  // "shift" moves the drawing down a little on a wide screen ("2.75rem"), so that a line of it meets a line of
  // the text beside it; the credit moves with it.
  const shift = back.plan && ref && typeof ref.shift === 'string' && /^\d+(\.\d+)?rem$/.test(ref.shift) ? ` style="--shift: ${ref.shift}"` : '';
  return `<section class="statement page-statement${back.plan ? ' has-plan' : ''}"${shift}>
  ${back.plan}
  <div class="statement-inner">
    ${inner}
  </div>
  ${back.credit}
</section>`;
}

module.exports = { projectCard, sectionLabel, planBackdrop, pageHead };
