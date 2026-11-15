'use strict';

const { esc, picture, liftStyle } = require('../lib/html');
const { projectCard, sectionLabel, planBackdrop } = require('./parts');

// Home: the firm's statement at the left and photographs of built work at the right, the way every other page
// opens with words at the left and a picture at the right; a short account of the firm over one of its own plans;
// the featured projects; and a row of the firm's drawings.
module.exports = function home(ctx) {
  const { site, projects, u } = ctx;

  const slides = site.hero
    .map((slide) => {
      const project = projects.find((p) => p.slug === slide.project);
      const photo = project && project.photos.find((ph) => ph.file === slide.photo);
      return project && photo ? { project, photo } : null;
    })
    .filter(Boolean);

  // The photographs beside the statement. On a wide screen they take seven of the page's twelve columns.
  let pictures = '';
  if (slides.length) {
    const first = slides[0];
    const frames = slides.map((s, i) => `<div class="hero-slide${i === 0 ? ' is-active' : ''}" data-title="${esc(s.project.title)}" data-place="${esc(s.project.location)}" data-href="${u(s.project.url)}">
        ${picture(ctx, s.project, s.photo, { sizes: '(min-width: 1500px) 800px, (min-width: 1024px) 55vw, 100vw', lazy: i > 0 })}
      </div>`).join('\n      ');
    pictures = `<div class="lead-pictures" data-hero role="group" aria-label="Photographs of selected projects">
    <div class="hero-frame" data-photo>
      ${frames}
    </div>
    <div class="hero-bar">
      <p class="hero-caption"><a data-hero-link href="${u(first.project.url)}">${esc(first.project.title)}</a><span data-hero-place>, ${esc(first.project.location)}</span></p>
      <button class="hero-toggle" type="button" data-hero-toggle hidden>Pause</button>
    </div>
  </div>`;
  }
  const lead = `<section class="lead${pictures ? ' has-pictures' : ''}">
  <div class="lead-text">
    <p class="statement-text">${esc(site.statement)}</p>
  </div>
  ${pictures}
</section>`;

  // A short account of the firm, over one of the firm's plans: "backdrop" in site.json names a project and one of
  // its drawings. The account is the first paragraph of the People page's introduction.
  const back = planBackdrop(ctx, site.backdrop, { lazy: true });
  const intro = Array.isArray(site.studio.intro) && site.studio.intro.length ? site.studio.intro[0] : '';
  const firm = intro ? `<section class="statement firm-statement${back.plan ? ' has-plan' : ''}">
  ${back.plan}
  <div class="statement-inner">
    ${sectionLabel('The firm')}
    <p class="firm-text">${esc(intro)}</p>
  </div>
  ${back.credit}
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

  // The firm's own plans and sketches, each linked to its project.
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
      <span class="card-meta">${esc(drawing.caption || 'Plan')}</span>
    </a></li>`).join('\n    ')}
  </ul>
</section>` : '';

  return {
    title: '',
    bodyClass: 'home',
    image: slides.length ? `/work/${slides[0].project.slug}/photos/${slides[0].photo.variants[slides[0].photo.variants.length - 1].name}` : '',
    body: `<h1 class="visually-hidden">${esc(site.name)}</h1>
${lead}
${firm}
${selected}
${drawings}`,
  };
};
