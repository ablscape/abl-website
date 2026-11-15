'use strict';

const { esc, paragraphs, picture, toCome, reviewNote, liftStyle } = require('../lib/html');
const { pageHead } = require('./parts');

// The Client, Site, Design team diagram: three points, with an arrow in each direction along every side.
const DIALOGUE_SVG = `<svg class="dialogue-drawing" viewBox="0 0 400 320" role="img" aria-labelledby="dialogue-title">
      <title id="dialogue-title">A triangle joining the client, the site and the design team, with arrows in both directions along each side</title>
      <defs>
        <marker id="dg-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path class="dg-head" d="M1 1.5 L9 5 L1 8.5"/>
        </marker>
      </defs>
      <path class="dg-line" d="M186 72 L98 238" marker-start="url(#dg-arrow)" marker-end="url(#dg-arrow)"/>
      <path class="dg-line" d="M214 72 L302 238" marker-start="url(#dg-arrow)" marker-end="url(#dg-arrow)"/>
      <path class="dg-line" d="M118 260 L282 260" marker-start="url(#dg-arrow)" marker-end="url(#dg-arrow)"/>
      <circle class="dg-node" cx="200" cy="52" r="6"/>
      <circle class="dg-node" cx="86" cy="260" r="6"/>
      <circle class="dg-node" cx="314" cy="260" r="6"/>
      <text class="dg-label" x="200" y="28" text-anchor="middle">Client</text>
      <text class="dg-label" x="86" y="296" text-anchor="middle">Site</text>
      <text class="dg-label" x="314" y="296" text-anchor="middle">Design team</text>
      <text class="dg-center" x="200" y="202" text-anchor="middle">Dialogue</text>
    </svg>`;

// Process: the title and opening over one of the firm's drawings, as on the other pages; then the parts of the
// firm's process in order, every one set the same way, with its number and name at the left and its text at the
// right under a hairline; and the firm's capabilities, set the same way without a number. A part may carry a
// remark, the Client, Site, Design team drawing, or a picture; each stands in the text's own column, under the
// text. Everything comes from "process" in content/site.json.
module.exports = function process(ctx) {
  const { site, projects, u } = ctx;
  const p = site.process || {};
  const sections = Array.isArray(p.sections) ? p.sections : [];
  const services = p.services || {};
  const items = Array.isArray(services.items) ? services.items : [];
  const intro = Array.isArray(p.intro) ? p.intro : [];

  const head = pageHead(ctx, p.backdrop, `<div class="page-head has-lead">
  <h1>Process</h1>
  <div class="page-lead">
    <p>${p.lead ? esc(p.lead) : toCome(ctx, 'how the firm works, in its own words')}</p>
  </div>
</div>`);

  const note = reviewNote(ctx, p.sectionsNote || p.introNote);
  const noteBlock = note ? `<div class="process-note">
  ${note}
</div>` : '';

  const introBlock = intro.length ? `<section class="process-intro">
  ${paragraphs(intro)}
</section>` : '';

  const quote = (q) => (q && q.text ? `<blockquote class="part-quote">
      <p>${esc(q.text)}</p>
      <footer>${esc(q.by || '')}</footer>
    </blockquote>` : '');

  // What a part may show under its text: the Dialogue drawing; a drawing or photograph of the firm's, named by
  // its project and number; or, in previews with notes, a frame that holds the place of a photograph still to
  // come ("figure": { "toCome": "what it will show" }).
  const pictureOf = (sec) => {
    if (sec.diagram) return `<div class="part-diagram">
      ${DIALOGUE_SVG}
    </div>`;
    const ref = sec.figure;
    if (!ref) return '';
    if (typeof ref.toCome === 'string') {
      return ctx.showNotes ? `<div class="part-figure is-to-come">
      <div class="frame-to-come"><span class="photo-to-come">Photograph to come: ${esc(ref.toCome)}</span></div>
    </div>` : '';
    }
    const project = projects.find((pr) => pr.slug === ref.project);
    const drawing = project && project.drawings.find((d) => d.file === ref.file);
    const photo = project && !drawing && project.photos.find((ph) => ph.file === ref.file);
    const item = drawing || photo;
    if (!item) return '';
    const lift = drawing ? liftStyle(Object.assign({}, drawing, ref.lift ? { lift: ref.lift } : {})) : '';
    return `<figure class="part-figure">
      <span class="frame" ${drawing ? `data-sheet${lift}` : 'data-photo'}>${picture(ctx, project, item, { sizes: '(min-width: 900px) 40rem, 100vw' })}</span>
      <figcaption><a href="${u(project.url)}">${esc(ref.caption || item.caption || (drawing ? 'Plan' : 'Photograph'))}, ${esc(project.title)}</a></figcaption>
    </figure>`;
  };

  const part = (number, title, text, extra) => `<section class="part">
  <h2 class="part-title">${number ? `<span class="part-number">${number}</span>` : ''}${esc(title)}</h2>
  <div class="part-body">
    ${text}${extra ? `
    ${extra}` : ''}
  </div>
</section>`;

  const blocks = sections.map((sec, i) => {
    const text = Array.isArray(sec.text) && sec.text.length ? paragraphs(sec.text) : `<p>${toCome(ctx, 'this part of the process, in the firm\'s words')}</p>`;
    const extra = [quote(sec.quote), pictureOf(sec)].filter(Boolean).join('\n    ');
    return part(String(i + 1).padStart(2, '0'), sec.title, text, extra);
  });

  const serviceText = Array.isArray(services.intro) ? services.intro : (services.intro ? [services.intro] : []);
  if (serviceText.length || items.length) {
    blocks.push(part('', 'Capabilities', `${reviewNote(ctx, services.reviewNote)}
    ${serviceText.map((line) => `<p>${esc(line)}</p>`).join('\n    ')}`, items.length ? `<dl class="capabilities">
      ${items.map((sv) => `<div>
        <dt>${esc(sv.name)}</dt>
        <dd>${sv.text ? esc(sv.text) : toCome(ctx, 'what this includes')}</dd>
      </div>`).join('\n      ')}
    </dl>` : ''));
  }

  return {
    title: 'Process',
    description: `How ${site.name} works: research into the history of a site, design in dialogue with the client, mock-ups before construction, and the firm's presence until the planting is established.`,
    body: `${head}
${noteBlock}
${introBlock}
<div class="parts">
${blocks.join('\n')}
</div>`,
  };
};
