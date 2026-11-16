'use strict';

const { esc, picture, liftStyle } = require('../lib/html');
const { projectCard, sectionLabel, planBackdrop } = require('./parts');

// Home: photographs of built work across the whole width of the window, in a low band; a short account of the
// firm; one of the firm's own plans across the whole width of the window, with the firm's statement set over
// it; the featured projects; and a row of the firm's drawings.
module.exports = function home(ctx) {
  const { site, projects, u } = ctx;

  const slides = site.hero
    .map((slide) => {
      const project = projects.find((p) => p.slug === slide.project);
      const photo = project && project.photos.find((ph) => ph.file === slide.photo);
      return project && photo ? { project, photo, focus: slide.focus } : null;
    })
    .filter(Boolean);

  // The photographs across the top. The band is lower than the photographs are, so each is trimmed a little at its
  // head and foot; a slide in site.json may say where its subject sits, as "focus": "50% 100%". Nothing is written
  // beneath them: the line that named the project and its place came off at the firm's word. The photographs stop
  // while the pointer rests on them, and a Pause button, shown only to a keyboard, stands in their corner.
  const place = (v) => (typeof v === 'string' && /^\d{1,3}% \d{1,3}%$/.test(v) ? v : '');
  let pictures = '';
  if (slides.length) {
    const frames = slides.map((s, i) => `<div class="hero-slide${i === 0 ? ' is-active' : ''}"${place(s.focus) ? ` style="--focus: ${s.focus}"` : ''}>
      ${picture(ctx, s.project, s.photo, { sizes: '100vw', lazy: i > 0 })}
    </div>`).join('\n    ');
    pictures = `<section class="hero" data-hero aria-label="Photographs of selected projects">
  <div class="hero-frame" data-photo>
    ${frames}
  </div>
  <button class="hero-toggle" type="button" data-hero-toggle hidden>Pause</button>
</section>`;
  }
  // The statement over one of the firm's plans, shown at its file's own size and centered: "backdrop" in site.json
  // names a project and one of its drawings. On a phone the statement comes first and the whole plan follows.
  const back = planBackdrop(ctx, site.backdrop, { lazy: true, wide: true });
  const statement = `<section class="statement home-statement${back.plan ? ' has-plan' : ''}"${back.ratio ? ` style="--plan-ratio: ${back.ratio}; --plan-w: ${back.width}px"` : ''}>
  ${back.plan}
  <div class="statement-inner">
    <p class="statement-text">${esc(site.statement)}</p>
  </div>
  ${back.credit}
</section>`;

  // A short account of the firm stands between the photographs and the plan: the first paragraph of the firm's
  // introduction, which stands whole on the Capabilities page.
  const caps = site.capabilities || {};
  const intro = Array.isArray(caps.intro) && caps.intro.length ? caps.intro[0] : '';
  const firm = intro ? `<section class="firm">
  ${sectionLabel('The firm')}
  <p class="firm-text">${esc(intro)}</p>
</section>` : '';

  const featured = projects.filter((p) => p.featured);
  const shown = featured.length ? featured : projects.slice(0, 3);
  const selected = shown.length ? `<section class="selected">
  ${sectionLabel('Selected work')}
  <ul class="project-list">
    ${shown.map((p) => `<li>${projectCard(ctx, p, '(min-width: 1500px) 680px, (min-width: 768px) 46vw, 92vw')}</li>`).join('\n    ')}
  </ul>
  <p class="more"><a class="text-link" href="${u('/work/')}">All work</a></p>
</section>` : '';

  // The firm's own plans and sketches, each linked to its project and named by it alone: the firm asked for the
  // kind of drawing ("Plan of the entrance") to be left out.
  const sheets = site.drawings
    .map((entry) => {
      const project = projects.find((p) => p.slug === entry.project);
      const drawing = project && project.drawings.find((d) => d.file === entry.file);
      return project && drawing ? { project, drawing } : null;
    })
    .filter(Boolean);
  const drawings = sheets.length ? `<section class="drawings">
  ${sectionLabel('Plans and drawings')}
  <ul class="drawing-row">
    ${sheets.map(({ project, drawing }) => `<li><a class="card" href="${u(project.url)}">
      <span class="drawing-image" data-sheet${liftStyle(drawing)}>${picture(ctx, project, drawing, { sizes: '(min-width: 900px) 30vw, 100vw' })}</span>
      <span class="card-title">${esc(project.title)}</span>
    </a></li>`).join('\n    ')}
  </ul>
</section>` : '';

  return {
    title: '',
    bodyClass: 'home',
    image: slides.length ? `/work/${slides[0].project.slug}/photos/${slides[0].photo.variants[slides[0].photo.variants.length - 1].name}` : '',
    body: `<h1 class="visually-hidden">${esc(site.name)}</h1>
${pictures}
${firm}
${statement}
${selected}
${drawings}`,
  };
};
