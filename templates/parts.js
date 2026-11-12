'use strict';

const { esc, picture } = require('../lib/html');

// One project as it appears in a grid: photograph, title, place and year.
function projectCard(ctx, project, sizes) {
  const meta = project.year ? `${project.location}, ${project.year}` : project.location;
  const draft = ctx.showNotes && project.status === 'draft' ? '<span class="draft-tag">Draft</span>' : '';
  return `<a class="card" href="${ctx.u(project.url)}">
      <span class="card-image">${picture(ctx, project, project.coverPhoto, { sizes })}</span>
      <span class="card-title">${esc(project.title)}${draft}</span>
      <span class="card-meta">${esc(meta)}</span>
    </a>`;
}

module.exports = { projectCard };
