'use strict';

const { esc, picture } = require('../lib/html');
const { projectCard, sectionLabel, planBackdrop } = require('./parts');

// Home: photographs the width of the screen; the firm's statement set over one of its own plans;
// the featured projects; a row of the firm's drawings; and a short account of the firm.
module.exports = function home(ctx) {
  const { site, projects, u } = ctx;

  const slides = site.hero
    .map((slide) => {
      const project = projects.find((p) => p.slug === slide.project);
      const photo = project && project.photos.find((ph) => ph.file === slide.photo);
      return project && photo ? { project, photo } : null;
    })
    .filter(Boolean);

  let hero = '';
  if (slides.length) {
    const first = slides[0];
    const frames = slides.map((s, i) => `<div class="hero-slide${i === 0 ? ' is-active' : ''}" data-title="${esc(s.project.title)}" data-place="${esc(s.project.location)}" data-href="${u(s.project.url)}">
      ${picture(ctx, s.project, s.photo, { sizes: '100vw', lazy: i > 0 })}
    </div>`).join('\n    ');
    hero = `<section class="hero" data-hero aria-label="Photographs of selected projects">
  <div class="hero-frame" data-photo>
    ${frames}
  </div>
  <div class="hero-bar">
    <p class="hero-caption"><a data-hero-link href="${u(first.project.url)}">${esc(first.project.title)}</a><span data-hero-place>, ${esc(first.project.location)}</span></p>
    <button class="hero-toggle" type="button" data-hero-toggle hidden>Pause</button>
  </div>
</section>`;
  }

  // A plan of the firm's behind the statement: "backdrop" in site.json names a project and one of its drawings.
  const back = planBackdrop(ctx, site.backdrop, { lazy: true });
  const plan = back.plan;
  const planCredit = back.credit;

  const featured = projects.filter((p) => p.featured);
  const shown = featured.length ? featured : projects.slice(0, 3);
  const selected = shown.length ? `<section class="selected">
  ${sectionLabel('Selected work')}
  <ul class="collage">
    ${shown.map((p) => `<li>${projectCard(ctx, p, '(min-width: 900px) 60vw, 100vw')}</li>`).join('\n    ')}
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
      <span class="drawing-image" data-sheet>${picture(ctx, project, drawing, { sizes: '(min-width: 900px) 30vw, 100vw' })}</span>
      <span class="card-title">${esc(project.title)}</span>
      <span class="card-meta">${esc(drawing.caption || 'Plan')}</span>
    </a></li>`).join('\n    ')}
  </ul>
</section>` : '';

  const intro = Array.isArray(site.studio.intro) && site.studio.intro.length ? site.studio.intro[0] : '';
  const firm = intro ? `<section class="firm">
  ${sectionLabel('The firm')}
  <div class="firm-text">
    <p>${esc(intro)}</p>
    <p class="firm-links"><a class="text-link" href="${u('/people/')}">People</a><a class="text-link" href="${u('/process/')}">Process</a></p>
  </div>
</section>` : '';

  return {
    title: '',
    bodyClass: 'home',
    image: slides.length ? `/work/${slides[0].project.slug}/photos/${slides[0].photo.variants[slides[0].photo.variants.length - 1].name}` : '',
    body: `<h1 class="visually-hidden">${esc(site.name)}</h1>
${hero}
<section class="statement${plan ? ' has-plan' : ''}">
  ${plan}
  <div class="statement-inner">
    <p class="statement-text">${esc(site.statement)}</p>
  </div>
  ${planCredit}
</section>
${selected}
${drawings}
${firm}`,
  };
};
