'use strict';

const { TYPES } = require('../lib/content');
const { projectCard } = require('./parts');

// Work: every project as a photograph in a staggered collage, with one row of buttons to narrow the list.
module.exports = function work(ctx) {
  const { projects } = ctx;
  const types = TYPES.filter((type) => projects.some((p) => p.type === type));
  const hasFeatured = projects.some((p) => p.featured);
  const hasOthers = projects.some((p) => !p.featured);
  const defaultFilter = hasFeatured && hasOthers ? 'featured' : 'all';

  const buttons = [];
  if (hasFeatured && hasOthers) buttons.push(['featured', 'Featured']);
  buttons.push(['all', 'All']);
  types.forEach((type) => buttons.push([type, type]));

  const filters = buttons.length > 2 ? `<div class="filters" data-filters hidden>
  ${buttons.map(([value, label]) => `<button type="button" data-filter="${value}" aria-pressed="false">${label}</button>`).join('\n  ')}
</div>` : '';

  const grid = projects.length ? `<ul class="project-grid collage" data-project-grid data-default="${defaultFilter}">
  ${projects.map((p) => `<li data-type="${p.type}" data-featured="${p.featured}">
    ${projectCard(ctx, p, '(min-width: 900px) 60vw, 100vw')}
  </li>`).join('\n  ')}
</ul>` : '<p class="empty">Project pages are on their way.</p>';

  return {
    title: 'Work',
    description: `Selected projects by ${ctx.site.name}: campus, civic, preservation and residential landscapes.`,
    body: `<div class="page-head">
  <h1>Work</h1>
</div>
${filters}
${grid}`,
  };
};
