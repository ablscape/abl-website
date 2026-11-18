'use strict';

const { TYPES } = require('../lib/content');
const { esc, reviewNote } = require('../lib/html');
const { projectCard, pageHead } = require('./parts');

// Work: every project, two to a line inside the page's margins: the picture and, beneath it, the kind of
// project, its name and its place. One row of buttons narrows the list: all, then each type.
module.exports = function work(ctx) {
  const { projects, site } = ctx;
  const types = TYPES.filter((type) => projects.some((p) => p.type === type));
  const defaultFilter = 'all';

  const buttons = [['all', 'All']];
  types.forEach((type) => buttons.push([type, type]));

  const filters = buttons.length > 2 ? `<div class="filters" data-filters hidden>
  ${buttons.map(([value, label]) => `<button type="button" data-filter="${value}" aria-pressed="false">${label}</button>`).join('\n  ')}
</div>` : '';

  const grid = projects.length ? `<ul class="project-grid project-list" data-project-grid data-default="${defaultFilter}">
  ${projects.map((p) => `<li data-type="${p.type}">
    ${projectCard(ctx, p, '(min-width: 1500px) 700px, (min-width: 768px) 48vw, 92vw')}
  </li>`).join('\n  ')}
</ul>` : '<p class="empty">Project pages are on their way.</p>';

  const w = site.work || {};
  const intro = w.intro ? `<div class="page-lead">
    ${reviewNote(ctx, w.introNote)}
    <p>${esc(w.intro)}</p>
  </div>` : '';

  return {
    title: 'Work',
    description: `Selected projects by ${site.name}: campus, civic, preservation and residential landscapes.`,
    body: `${pageHead(ctx, site.work && site.work.backdrop, `<div class="page-head${intro ? ' has-lead' : ''}">
  <h1>Work</h1>
  ${intro}
</div>`)}
${filters}
${grid}`,
  };
};
