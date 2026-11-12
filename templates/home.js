'use strict';

const { esc, picture } = require('../lib/html');
const { projectCard } = require('./parts');

// Home: a few photographs, the firm's statement, and the featured projects.
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
  <div class="hero-frame">
    ${frames}
  </div>
  <div class="hero-bar">
    <p class="hero-caption"><a data-hero-link href="${u(first.project.url)}">${esc(first.project.title)}</a><span data-hero-place>, ${esc(first.project.location)}</span></p>
    <button class="hero-toggle" type="button" data-hero-toggle hidden>Pause</button>
  </div>
</section>`;
  }

  const featured = projects.filter((p) => p.featured);
  const shown = featured.length ? featured : projects.slice(0, 3);
  const selected = shown.length ? `<section class="selected">
  <h2>Selected work</h2>
  <ul class="collage">
    ${shown.map((p) => `<li>${projectCard(ctx, p, '(min-width: 900px) 60vw, 100vw')}</li>`).join('\n    ')}
  </ul>
  <p class="more"><a href="${u('/work/')}">All work</a></p>
</section>` : '';

  // A plan of the firm's, faint, behind the statement: "backdrop" in site.json names a project and one of its drawings.
  let backdrop = '';
  if (site.backdrop && site.backdrop.project) {
    const project = projects.find((p) => p.slug === site.backdrop.project);
    const drawing = project && project.drawings.find((d) => d.file === site.backdrop.file);
    if (drawing) {
      const biggest = drawing.variants[drawing.variants.length - 1].name;
      backdrop = ` has-backdrop" style="--backdrop: url('${u(`/work/${project.slug}/photos/${biggest}`)}')`;
    }
  }

  return {
    title: '',
    bodyClass: 'home',
    image: slides.length ? `/work/${slides[0].project.slug}/photos/${slides[0].photo.variants[slides[0].photo.variants.length - 1].name}` : '',
    body: `<h1 class="visually-hidden">${esc(site.name)}</h1>
${hero}
<section class="statement${backdrop}">
  <p>${esc(site.statement)}</p>
</section>
${selected}`,
  };
};
