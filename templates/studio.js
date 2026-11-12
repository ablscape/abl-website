'use strict';

const { esc, paragraphs, toCome, reviewNote } = require('../lib/html');

// The Client, Site, Design team diagram. Drawn as a sketch on a sheet of yellow trace.
const DIALOGUE_SVG = `<svg class="dialogue-drawing" viewBox="0 0 360 320" role="img" aria-labelledby="dialogue-title">
      <title id="dialogue-title">A triangle joining the client, the site and the design team</title>
      <rect class="dg-trace" x="22" y="30" width="316" height="262" transform="rotate(-2.5 180 160)"/>
      <path class="dg-line" d="M180 84 L84 244 L276 244 Z"/>
      <circle class="dg-node" cx="180" cy="84" r="5"/>
      <circle class="dg-node" cx="84" cy="244" r="5"/>
      <circle class="dg-node" cx="276" cy="244" r="5"/>
      <text class="dg-label" x="180" y="66" text-anchor="middle">Client</text>
      <text class="dg-label" x="84" y="270" text-anchor="middle">Site</text>
      <text class="dg-label" x="276" y="270" text-anchor="middle">Design team</text>
      <text class="dg-center" x="180" y="200" text-anchor="middle">Dialogue</text>
    </svg>`;

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
    ${photo ? `<div class="person-photo">${photo}</div>` : ''}
    <div class="person-text">
      <h3>${esc(p.name)}${p.credentials ? `, <span class="credentials">${esc(p.credentials)}</span>` : ''}</h3>
      ${p.title ? `<p class="person-title">${esc(p.title)}</p>` : ''}
      ${p.email ? `<p class="person-email"><a href="mailto:${esc(p.email)}">${esc(p.email)}</a></p>` : ''}
      ${bio}
      ${facts ? `<dl class="person-facts">
        ${facts}
      </dl>` : ''}
    </div>
  </article>`;
}

// Studio: who the firm is and how it works.
module.exports = function studio(ctx) {
  const { site, people } = ctx;
  const s = site.studio;
  const dialogue = s.dialogue || {};
  const steps = Array.isArray(s.process) ? s.process : [];

  const approach = `<section class="approach">
  <h2>How we work</h2>
  <div class="dialogue">
    ${DIALOGUE_SVG}
    <div class="dialogue-text">
      ${reviewNote(ctx, dialogue.reviewNote)}
      ${Array.isArray(dialogue.text) && dialogue.text.length ? paragraphs(dialogue.text) : `<p>${toCome(ctx, 'the Client, Site, Design team dialogue in the firm\'s words')}</p>`}
    </div>
  </div>
  ${steps.length ? `<ol class="process">
    ${steps.map((step) => `<li>
      <h3>${esc(step.title)}</h3>
      <p>${step.text ? esc(step.text) : toCome(ctx, 'what happens at this step')}</p>
    </li>`).join('\n    ')}
  </ol>` : ''}
</section>`;

  return {
    title: 'Studio',
    description: `The people of ${site.name} and how the studio works with clients.`,
    body: `<div class="page-head">
  <h1>Studio</h1>
</div>
<section class="studio-intro">
  ${paragraphs(s.intro)}
  ${s.note ? `<p class="studio-note">${esc(s.note)}</p>` : ''}
</section>
<section class="people">
  <h2>People</h2>
  ${people.map((p) => person(ctx, p)).join('\n  ')}
</section>
${approach}`,
  };
};
