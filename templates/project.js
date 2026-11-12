'use strict';

const { esc, paragraphs, picture, toCome, reviewNote } = require('../lib/html');
const { STORY_PARTS } = require('../lib/content');

// One project page: lead photograph, the story, the facts in a title block, more photographs.
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

  const titleBlock = `<aside class="title-block" aria-label="Project facts">
      <dl>
        ${rows.map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join('\n        ')}
      </dl>
    </aside>`;

  const story = project.hasStory
    ? STORY_PARTS
        .filter(([key]) => Array.isArray(project.story[key]) && project.story[key].length)
        .map(([key, label]) => `<section class="story-part">
        <h2>${label}</h2>
        ${paragraphs(project.story[key])}
      </section>`).join('\n      ')
    : `<div class="story-part">
        ${paragraphs(project.description)}
      </div>`;

  const rest = project.photos.filter((photo) => photo !== project.coverPhoto);
  const gallery = rest.length ? `<div class="project-photos">
    ${rest.map((photo) => `<figure>
      ${picture(ctx, project, photo, { sizes: '(min-width: 1100px) 1100px, 100vw' })}
      ${photo.caption ? `<figcaption>${esc(photo.caption)}${photo.credit ? ` Photograph: ${esc(photo.credit)}.` : ''}</figcaption>` : (photo.credit ? `<figcaption>Photograph: ${esc(photo.credit)}.</figcaption>` : '')}
    </figure>`).join('\n    ')}
  </div>` : '';

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
    <div class="project-text">
      <h1>${esc(project.title)}</h1>
      <p class="project-summary">${esc(project.summary)}</p>
      ${reviewNote(ctx, project.reviewNote)}
      ${story}
    </div>
    ${titleBlock}
  </div>
  ${gallery}
  ${nextLink}
</article>`,
  };
};
