'use strict';

const { esc, paragraphs, picture, toCome, reviewNote } = require('../lib/html');
const { sectionLabel } = require('./parts');

// The Client, Site, Design team diagram: three points, with an arrow in each direction along every side.
const DIALOGUE_SVG = `<svg class="dialogue-drawing" viewBox="0 0 400 350" role="img" aria-labelledby="dialogue-title">
      <title id="dialogue-title">A triangle joining the client, the site and the design team, with arrows in both directions along each side</title>
      <defs>
        <marker id="dg-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path class="dg-head" d="M1 1.5 L9 5 L1 8.5"/>
        </marker>
      </defs>
      <path class="dg-line" d="M186 82 L98 248" marker-start="url(#dg-arrow)" marker-end="url(#dg-arrow)"/>
      <path class="dg-line" d="M214 82 L302 248" marker-start="url(#dg-arrow)" marker-end="url(#dg-arrow)"/>
      <path class="dg-line" d="M118 270 L282 270" marker-start="url(#dg-arrow)" marker-end="url(#dg-arrow)"/>
      <circle class="dg-node" cx="200" cy="62" r="6"/>
      <circle class="dg-node" cx="86" cy="270" r="6"/>
      <circle class="dg-node" cx="314" cy="270" r="6"/>
      <text class="dg-label" x="200" y="36" text-anchor="middle">Client</text>
      <text class="dg-label" x="86" y="306" text-anchor="middle">Site</text>
      <text class="dg-label" x="314" y="306" text-anchor="middle">Design team</text>
      <text class="dg-center" x="200" y="212" text-anchor="middle">Dialogue</text>
    </svg>`;

// Process: the title and opening over one of the firm's plans; the parts of the firm's process, each with a
// drawing or photograph from a project, and two of Arthur Bartenstein's remarks set large between them;
// and the ways to work with the firm. Everything comes from "process" in content/site.json.
module.exports = function process(ctx) {
  const { site, projects, u } = ctx;
  const p = site.process || {};
  const sections = Array.isArray(p.sections) ? p.sections : [];
  const services = p.services || {};
  const items = Array.isArray(services.items) ? services.items : [];
  const intro = Array.isArray(p.intro) ? p.intro : [];

  // A picture is named by its project and its number; it may be a drawing or a photograph.
  const find = (ref) => {
    const project = ref && projects.find((x) => x.slug === ref.project);
    if (!project) return null;
    const drawing = project.drawings.find((d) => d.file === ref.file);
    const item = drawing || project.photos.find((d) => d.file === ref.file);
    return item ? { project, item, isDrawing: Boolean(drawing) } : null;
  };

  // A plan of the firm's behind the opening, as on the home page.
  const back = find(p.backdrop);
  let plan = '';
  let planCredit = '';
  if (back) {
    const base = `/work/${back.project.slug}/photos/`;
    const srcset = back.item.variants.map((v) => `${u(base + v.name)} ${v.width}w`).join(', ');
    const biggest = back.item.variants[back.item.variants.length - 1];
    plan = `<div class="statement-plan" data-sheet aria-hidden="true"><img src="${u(base + biggest.name)}" srcset="${srcset}" sizes="100vw" width="${back.item.width}" height="${back.item.height}" alt="" decoding="async"></div>`;
    planCredit = `<p class="statement-credit"><a href="${u(back.project.url)}">${esc(back.item.caption || 'Plan')}, ${esc(back.project.title)}</a></p>`;
  }
  const head = `<section class="statement process-head${plan ? ' has-plan' : ''}">
  ${plan}
  <div class="statement-inner">
    <h1>Process</h1>
    <p class="process-lead">${p.lead ? esc(p.lead) : toCome(ctx, 'how the firm works, in its own words')}</p>
  </div>
  ${planCredit}
</section>`;

  const introBlock = intro.length || p.introNote ? `<section class="process-intro">
  ${reviewNote(ctx, p.introNote)}
  ${paragraphs(intro)}
</section>` : '';

  const figure = (ref) => {
    const f = find(ref);
    if (!f) return '';
    return `<figure class="stage-figure${f.isDrawing ? ' is-drawing' : ''}">
      <a class="frame" href="${u(f.project.url)}"${f.isDrawing ? ' data-sheet' : ' data-photo'}>${picture(ctx, f.project, f.item, { sizes: '(min-width: 56rem) 62vw, 100vw' })}</a>
      <figcaption><a href="${u(f.project.url)}">${(ref.caption || f.item.caption) ? `${esc(ref.caption || f.item.caption)}, ` : ''}${esc(f.project.title)}</a></figcaption>
    </figure>`;
  };
  const quote = (q) => (q && q.text ? `<blockquote class="pull">
  <p>${esc(q.text)}</p>
  <footer>${esc(q.by || '')}</footer>
</blockquote>` : '');

  const sectionBlocks = sections.map((sec, i) => `<section class="approach stage">
  ${sectionLabel(sec.title)}
  <div class="stage-body">
    ${i === 0 ? reviewNote(ctx, p.sectionsNote) : ''}
    ${Array.isArray(sec.text) && sec.text.length ? paragraphs(sec.text) : `<p>${toCome(ctx, 'this part of the process, in the firm\'s words')}</p>`}
    ${sec.diagram ? DIALOGUE_SVG : ''}
    ${figure(sec.figure)}
  </div>
</section>
${quote(sec.quote)}`).join('\n');

  const servicesBlock = items.length ? `<section class="approach services">
  ${sectionLabel('Working with us')}
  ${reviewNote(ctx, services.reviewNote)}
  ${services.intro ? `<p class="services-intro">${esc(services.intro)}</p>` : ''}
  <dl>
    ${items.map((s) => `<div>
      <dt>${esc(s.name)}</dt>
      <dd>${s.text ? esc(s.text) : toCome(ctx, 'what this includes')}</dd>
    </div>`).join('\n    ')}
  </dl>
  ${services.outro ? `<p class="services-outro">${esc(services.outro)}</p>` : ''}
</section>` : '';

  return {
    title: 'Process',
    description: `How ${site.name} works: research into the history of a site, design in dialogue with the client, mock-ups before construction, and the firm's presence until the planting is established.`,
    body: `${head}
${introBlock}
${sectionBlocks}
${servicesBlock}`,
  };
};
