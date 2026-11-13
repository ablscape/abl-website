'use strict';

const { TYPES } = require('../lib/content');
const { esc, reviewNote } = require('../lib/html');
const { projectCard, pageHead } = require('./parts');

// Work: every project in a staggered collage, with one row of buttons to narrow the list: all, then each type.
module.exports = function work(ctx) {
  const { projects, site } = ctx;
  const types = TYPES.filter((type) => projects.some((p) => p.type === type));
  const defaultFilter = 'all';

  const buttons = [['all', 'All']];
  types.forEach((type) => buttons.push([type, type]));

  const filters = buttons.length > 2 ? `<div class="filters" data-filters hidden>
  ${buttons.map(([value, label]) => `<button type="button" data-filter="${value}" aria-pressed="false">${label}</button>`).join('\n  ')}
</div>` : '';

  const grid = projects.length ? `<ul class="project-grid collage" data-project-grid data-default="${defaultFilter}">
  ${projects.map((p) => `<li data-type="${p.type}">
    ${projectCard(ctx, p, '(min-width: 900px) 60vw, 100vw')}
  </li>`).join('\n  ')}
</ul>` : '<p class="empty">Project pages are on their way.</p>';

  const w = site.work || {};
  const intro = w.intro ? `<div class="page-lead">
    ${reviewNote(ctx, w.introNote)}
    <p>${esc(w.intro)}</p>
  </div>` : '';

  return {
    title: 'Work',
    bodyClass: site.work && site.work.backdrop ? 'has-ground' : '',
    description: `Selected projects by ${site.name}: campus, civic, preservation and residential landscapes.`,
    body: `${pageHead(ctx, site.work && site.work.backdrop, `<div class="page-head${intro ? ' has-lead' : ''}">
  <h1>Work</h1>
  ${intro}
</div>`)}
${filters}
${grid}`,
  };
};
