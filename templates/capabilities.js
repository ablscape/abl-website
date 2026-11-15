'use strict';

const { esc, toCome, reviewNote } = require('../lib/html');
const { pageHead } = require('./parts');

// Capabilities: the title and the firm's one-sentence account of what it does, over one of the firm's drawings
// when "backdrop" names one, as on the other pages; then each capability in the form the Process page gives its
// parts, a hairline with the name at the left and, at the right, a sentence explaining what the capability is;
// then what the firm does for private properties. Everything comes from "capabilities" in content/site.json.
// The page listed the projects that show each capability, and closed with the firm's qualifications, until the
// firm asked for explanations in place of the examples and for the qualifications to stay on the People page.
module.exports = function capabilities(ctx) {
  const { site } = ctx;
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

  const blocks = items.map((item) => {
    // A capability whose sentence is still to come stands by its name; its place is marked only in a preview
    // with notes.
    const text = item.text ? `<p>${esc(item.text)}</p>` : (ctx.showNotes ? `<p>${toCome(ctx, 'what this is, in a sentence')}</p>` : '');
    return part(item.name, text);
  });

  if (c.private) blocks.push(part('Private properties', `<p>${esc(c.private)}</p>`));

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
