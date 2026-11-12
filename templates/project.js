'use strict';

const { esc, paragraphs, picture, toCome, reviewNote } = require('../lib/html');
const { STORY_PARTS } = require('../lib/content');

// One project page: lead photograph; the title, the facts and the first part of the story side by side;
// then the firm's plan on plain white, and the rest of the story interleaved with the photographs.
module.exports = function projectPage(ctx, project, next) {
  const { u } = ctx;

  // The title block: the same facts a drawing sheet carries in its corner.
  const rows = [
    ['Location', esc(project.location)],
    ['Client', project.client ? esc(project.client) : toCome(ctx, 'client')],
    ['Completed', project.year ? esc(project.year) : toCome(ctx, 'year')],
    ['Role', project.role ? esc(project.role) : toCome(ctx, 'role')],
    ['With', project.collaborators.length ? project.collaborators.map(esc).join('<br>') : ''],
    ['Type', esc(project.type)],
  ].filter(([, value]) => value);

  const titleBlock = `<dl class="title-block" aria-label="Project facts">
        ${rows.map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join('\n        ')}
      </dl>`;

  // The story in parts, or one description.
  const parts = project.hasStory
    ? STORY_PARTS
        .filter(([key]) => Array.isArray(project.story[key]) && project.story[key].length)
        .map(([key, label]) => `<section class="story-part">
          <h2>${label}</h2>
          ${paragraphs(project.story[key])}
        </section>`)
    : [`<div class="story-part">
          ${paragraphs(project.description)}
        </div>`];

  const photoFigure = (photo, sizes) => `<figure>
      ${picture(ctx, project, photo, { sizes })}
      ${photo.caption ? `<figcaption>${esc(photo.caption)}${photo.credit ? ` Photograph: ${esc(photo.credit)}.` : ''}</figcaption>` : (photo.credit ? `<figcaption>Photograph: ${esc(photo.credit)}.</figcaption>` : '')}
    </figure>`;

  // Photographs other than the lead, dealt out as one wide, then a pair, then one wide.
  const rest = project.photos.filter((photo) => photo !== project.coverPhoto);
  const groups = [];
  for (let i = 0; i < rest.length;) {
    if (groups.length % 2 === 0 || i === rest.length - 1) { groups.push(rest.slice(i, i + 1)); i += 1; }
    else { groups.push(rest.slice(i, i + 2)); i += 2; }
  }
  const groupHtml = (group) => group.length === 1
    ? `<div class="photo-row photo-one">\n    ${photoFigure(group[0], '(min-width: 1100px) 1000px, 100vw')}\n  </div>`
    : `<div class="photo-row photo-pair">\n    ${group.map((p) => photoFigure(p, '(min-width: 1100px) 520px, 100vw')).join('\n    ')}\n  </div>`;

  const drawingHtml = (d) => `<figure class="plan">
      ${picture(ctx, project, d, { sizes: '(min-width: 1100px) 1000px, 100vw' })}
      ${d.caption ? `<figcaption>${esc(d.caption)}</figcaption>` : ''}
    </figure>`;

  // Lay the page out: first part beside the title; drawings; then photographs and parts in turn.
  const body = [];
  const opening = parts.shift() || '';
  body.push(`<div class="project-opening">
    <div class="project-head">
      <h1>${esc(project.title)}</h1>
      <p class="project-summary">${esc(project.summary)}</p>
      ${titleBlock}
    </div>
    <div class="project-lead">
      ${reviewNote(ctx, project.reviewNote)}
      ${opening}
    </div>
  </div>`);
  project.drawings.forEach((d) => body.push(drawingHtml(d)));
  let g = 0;
  parts.forEach((part) => {
    if (g < groups.length) body.push(groupHtml(groups[g++]));
    body.push(`<div class="project-text">${part}</div>`);
  });
  while (g < groups.length) body.push(groupHtml(groups[g++]));

  const nextLink = next && next !== project ? `<nav class="project-next" aria-label="More work">
    <a href="${u(next.url)}"><span class="next-label">Next project</span> <span class="next-title">${esc(next.title)}</span></a>
    <a class="all-work" href="${u('/work/')}">All work</a>
  </nav>` : '';

  const cover = project.coverPhoto;
  const largest = cover.variants[cover.variants.length - 1].name;

  return {
    title: project.title,
    description: project.summary,
    image: `/work/${project.slug}/photos/${largest}`,
    bodyClass: 'project-page',
    body: `<article class="project">
  <figure class="project-hero">
    ${picture(ctx, project, cover, { sizes: '100vw', lazy: false })}
    ${cover.caption ? `<figcaption>${esc(cover.caption)}</figcaption>` : ''}
  </figure>
  <div class="project-body">
  ${body.join('\n  ')}
  </div>
  ${nextLink}
</article>`,
  };
};
