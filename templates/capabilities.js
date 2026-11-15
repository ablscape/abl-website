'use strict';

const { esc, toCome, reviewNote } = require('../lib/html');
const { pageHead } = require('./parts');

// Capabilities: the title and the firm's one-sentence account of what it does, over one of the firm's drawings, as
// on the other pages; then each capability in the form the Process page gives its parts, a hairline with the name
// at the left and, at the right, a sentence on what it includes and the projects on the site that show it; then
// what the firm does for private properties, and its qualifications. Everything comes from "capabilities" in
// content/site.json; the qualifications are read from the People page's note and from each person's registration,
// so that they are written once.
module.exports = function capabilities(ctx) {
  const { site, people, projects, u } = ctx;
  const c = site.capabilities || {};
  const items = Array.isArray(c.items) ? c.items : [];

  const head = pageHead(ctx, c.backdrop, `<div class="page-head has-lead">
  <h1>Capabilities</h1>
  <div class="page-lead">
    <p>${c.lead ? esc(c.lead) : toCome(ctx, 'what the firm does, in a sentence')}</p>
  </div>
</div>`);

  const note = reviewNote(ctx, c.note);
  const noteBlock = note ? `<div class="process-note">
  ${note}
</div>` : '';

  const part = (title, body) => `<section class="part">
  <div class="part-head">
    <h2 class="part-title">${esc(title)}</h2>
  </div>
  <div class="part-body">
    ${body}
  </div>
</section>`;

  // The projects that show a capability, in the order the Work page lists them. Drafts are left off the live site,
  // so a capability may stand there with no projects under it.
  const shown = (slugs) => projects.filter((p) => (slugs || []).includes(p.slug));
  const projectList = (list) => (list.length ? `<ul class="part-projects">
      ${list.map((p) => `<li><a href="${u(p.url)}">${esc(p.title)}</a>${p.location ? `<span>, ${esc(p.location)}</span>` : ''}</li>`).join('\n      ')}
    </ul>` : '');

  const blocks = items.map((item) => {
    // The sentence is still to come from the firm; its place is marked only in a preview with notes.
    const text = item.text ? `<p>${esc(item.text)}</p>` : (ctx.showNotes ? `<p>${toCome(ctx, 'what this includes, in a sentence')}</p>` : '');
    return part(item.name, [text, projectList(shown(item.projects))].filter(Boolean).join('\n    '));
  });

  if (c.private) blocks.push(part('Private properties', `<p>${esc(c.private)}</p>`));

  if (c.qualifications) {
    const lines = [];
    if (site.studio && site.studio.note) lines.push(`<p>${esc(site.studio.note)}</p>`);
    (Array.isArray(people) ? people : []).forEach((person) => {
      const reg = (person.facts || []).find((f) => f.label === 'Registration');
      if (reg && Array.isArray(reg.items) && reg.items.length) {
        lines.push(`<p>${esc(person.name)}${person.credentials ? `, ${esc(person.credentials)}` : ''}: ${reg.items.map(esc).join(', ')}</p>`);
      }
    });
    if (lines.length) blocks.push(part('Qualifications', lines.join('\n    ')));
  }

  return {
    title: 'Capabilities',
    description: c.lead || `What ${site.name} does.`,
    body: `${head}
${noteBlock}
<div class="parts">
${blocks.join('\n')}
</div>`,
  };
};
