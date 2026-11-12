'use strict';

const { esc, picture } = require('../lib/html');

// One project as it appears in a collage: its cover (a photograph or a drawing), its kind, title, place and year.
function projectCard(ctx, project, sizes) {
  const meta = project.year ? `${project.location}, ${project.year}` : project.location;
  const draft = ctx.showNotes && project.status === 'draft' ? '<span class="draft-tag">Draft</span>' : '';
  const cover = project.coverPhoto;
  return `<a class="card" href="${ctx.u(project.url)}">
      <span class="card-image ${cover.isDrawing ? 'is-drawing' : 'is-photo'}"${cover.isDrawing ? '' : ' data-photo'}>${picture(ctx, project, cover, { sizes })}</span>
      <span class="card-kind">${esc(project.type)}</span>
      <span class="card-title">${esc(project.title)}${draft}</span>
      <span class="card-meta">${esc(meta)}</span>
    </a>`;
}

// A short label over a section, with the accent rule above it.
function sectionLabel(text) {
  return `<h2 class="section-label">${esc(text)}</h2>`;
}

module.exports = { projectCard, sectionLabel };
