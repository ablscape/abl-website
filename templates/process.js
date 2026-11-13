'use strict';

const { esc, paragraphs, picture, toCome, reviewNote } = require('../lib/html');
const { sectionLabel, pageHead } = require('./parts');

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
// firm's process, each with its picture beside its text; a remark of Arthur Bartenstein's set large; and the
// ways to work with the firm. Everything comes from "process" in content/site.json.
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

  // The picture beside a part: a drawing or photograph from a project ("drawn": true marks a drawing that a
  // project lists among its photographs), the Dialogue drawing, or, in previews only, a frame that holds the
  // place of a photograph still to come ("figure": { "toCome": "what it will show" }).
  const picturePart = (sec) => {
    if (sec.diagram) return `<div class="stage-picture is-diagram">
    ${DIALOGUE_SVG}
  </div>`;
    const ref = sec.figure;
    if (ref && typeof ref.toCome === 'string') {
      return ctx.showNotes ? `<div class="stage-picture is-to-come">
    <div class="frame-to-come"><span class="photo-to-come">Photograph to come: ${esc(ref.toCome)}</span></div>
  </div>` : '';
    }
    const f = find(ref);
    if (!f) return '';
    const drawn = f.isDrawing || ref.drawn === true;
    const caption = ref.caption || f.item.caption;
    return `<div class="stage-picture">
    <figure class="stage-figure${drawn ? ' is-drawing' : ''}">
      <a class="frame" href="${u(f.project.url)}"${drawn ? ' data-sheet' : ' data-photo'}>${picture(ctx, f.project, f.item, { sizes: '(min-width: 56rem) 54vw, 100vw' })}</a>
      <figcaption><a href="${u(f.project.url)}">${caption ? `${esc(caption)}, ` : ''}${esc(f.project.title)}</a></figcaption>
    </figure>
  </div>`;
  };

  const quote = (q) => (q && q.text ? `<blockquote class="pull">
  <p>${esc(q.text)}</p>
  <footer>${esc(q.by || '')}</footer>
</blockquote>` : '');

  const stage = (title, text, pic, extra) => `<section class="stage ${pic ? 'has-picture' : 'is-text-only'}${extra ? ` ${extra}` : ''}">
  ${sectionLabel(title)}
  <div class="stage-text">
    ${text}
  </div>
  ${pic}
</section>`;

  const blocks = sections.map((sec) => {
    const pic = picturePart(sec);
    const text = Array.isArray(sec.text) && sec.text.length ? paragraphs(sec.text) : `<p>${toCome(ctx, 'this part of the process, in the firm\'s words')}</p>`;
    return { textOnly: !pic, after: quote(sec.quote), html: stage(sec.title, text, pic, sec.diagram ? 'has-diagram' : '') };
  });

  const serviceText = Array.isArray(services.intro) ? services.intro : (services.intro ? [services.intro] : []);
  if (serviceText.length || items.length) {
    blocks.push({
      textOnly: true,
      after: '',
      html: stage('Services', `${reviewNote(ctx, services.reviewNote)}
    ${serviceText.map((line) => `<p class="services-intro">${esc(line)}</p>`).join('\n    ')}
    ${items.length ? `<dl>
      ${items.map((s) => `<div>
        <dt>${esc(s.name)}</dt>
        <dd>${s.text ? esc(s.text) : toCome(ctx, 'what this includes')}</dd>
      </div>`).join('\n      ')}
    </dl>` : ''}`, '', 'services'),
    });
  }

  // Two parts in a row that have no picture share one row, side by side, so neither leaves half the page empty.
  const out = [];
  for (let i = 0; i < blocks.length; i += 1) {
    const a = blocks[i];
    const b = blocks[i + 1];
    if (a.textOnly && !a.after && b && b.textOnly) {
      out.push(`<div class="stage-pair">
${a.html}
${b.html}
</div>
${b.after}`);
      i += 1;
    } else {
      out.push(`${a.html}
${a.after}`);
    }
  }

  return {
    title: 'Process',
    description: `How ${site.name} works: research into the history of a site, design in dialogue with the client, mock-ups before construction, and the firm's presence until the planting is established.`,
    body: `${head}
${noteBlock}
${introBlock}
${out.join('\n')}`,
  };
};
