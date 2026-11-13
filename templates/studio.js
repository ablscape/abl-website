'use strict';

const { esc, paragraphs, toCome } = require('../lib/html');
const { pageHead } = require('./parts');

function person(ctx, p) {
  const { u } = ctx;
  const photo = p.photo
    ? `<img src="${u('/assets/img/people/' + p.photo)}" alt="${esc(p.name)}" loading="lazy" decoding="async">`
    : (ctx.showNotes ? '<span class="photo-to-come">Photograph to come</span>' : '');
  const facts = (p.facts || []).filter((f) => Array.isArray(f.items) && f.items.length).map((f) => `<div>
          <dt>${esc(f.label)}</dt>
          <dd>${f.items.map(esc).join('<br>')}</dd>
        </div>`).join('\n        ');
  const bio = Array.isArray(p.bio) && p.bio.length ? paragraphs(p.bio) : `<p>${toCome(ctx, 'biography')}</p>`;
  return `<article class="person${photo ? '' : ' person-no-photo'}">
    ${photo ? `<div class="person-photo"${p.photo ? ' data-photo' : ' data-sheet'}>${photo}</div>` : ''}
    <div class="person-text">
      <h2 class="person-name">${esc(p.name)}${p.credentials ? `, <span class="credentials">${esc(p.credentials)}</span>` : ''}</h2>
      ${p.title ? `<p class="person-title">${esc(p.title)}</p>` : ''}
      ${p.email ? `<p class="person-email"><a href="mailto:${esc(p.email)}">${esc(p.email)}</a></p>` : ''}
      ${bio}
      ${facts ? `<dl class="person-facts">
        ${facts}
      </dl>` : ''}
    </div>
  </article>`;
}

// People: the firm's own account of itself, and the people in it. How it works is on the Process page.
module.exports = function studio(ctx) {
  const { site, people } = ctx;
  const s = site.studio;
  const paras = Array.isArray(s.intro) ? s.intro : [];

  // The first paragraph is the lead, set large beside the heading; the rest follow in the text column.
  const lead = paras.length ? `<div class="page-lead">
    <p>${esc(paras[0])}</p>
  </div>` : '';
  const rest = paras.length > 1 || s.note ? `<section class="studio-intro">
  ${paragraphs(paras.slice(1))}
  ${s.note ? `<p class="studio-note">${esc(s.note)}</p>` : ''}
</section>` : '';

  return {
    title: 'People',
    description: `The people of ${site.name} and how the studio works with clients.`,
    body: `${pageHead(ctx, site.studio && site.studio.backdrop, `<div class="page-head${lead ? ' has-lead' : ''}">
  <h1>People</h1>
  ${lead}
</div>`)}
${rest}
<section class="people">
  ${people.map((p) => person(ctx, p)).join('\n  ')}
</section>`,
  };
};
